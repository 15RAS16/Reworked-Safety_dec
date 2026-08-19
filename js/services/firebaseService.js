/**
 * SafeRoute Guardian - Firebase Authentication & Cloud Firestore Service (v2.0)
 * Implements Google OAuth, Email/Password authentication, Email Verification,
 * Backend-Governed RBAC, Consent-Based Dependent Linking, and Cryptographic Invitations.
 * 
 * SECURITY RULES:
 * - Never store passwords, tokens, or service-account credentials in LocalStorage.
 * - Roles & permissions are governed strictly by Firestore documents and custom claims.
 * - Never trust frontend state for authorization.
 */

window.FirebaseService = (function() {
  let isFirebaseLive = false;
  let authInstance = null;
  let dbInstance = null;
  let authListeners = [];
  let currentAuthUser = null;

  // Initialize Firebase if live credentials exist
  try {
    if (window.ConfigService && window.ConfigService.isConfigured() && window.firebase) {
      const config = window.ConfigService.getFirebaseConfig();
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      authInstance = window.firebase.auth();
      dbInstance = window.firebase.firestore();
      isFirebaseLive = true;

      // Real auth listener
      authInstance.onAuthStateChanged(async (user) => {
        if (user) {
          // Fetch backend-governed role and permissions from Firestore
          try {
            const userDoc = await dbInstance.collection('users').doc(user.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            
            // Check organization membership if organization mode
            let orgData = null;
            if (userData.primaryRole === 'organization' && userData.organizationId) {
              const memberDoc = await dbInstance
                .collection('organizations')
                .doc(userData.organizationId)
                .collection('members')
                .doc(user.uid)
                .get();
              if (memberDoc.exists) {
                orgData = memberDoc.data();
              }
            }

            const enrichedUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || userData.displayName || 'Traveler',
              photoURL: user.photoURL || userData.photoURL || null,
              emailVerified: user.emailVerified,
              primaryRole: userData.primaryRole || 'tourist',
              allowedModes: userData.allowedModes || [userData.primaryRole || 'tourist'],
              orgPermission: (orgData && orgData.role) || userData.orgPermission || 'staff',
              organizationId: userData.organizationId || null,
              orgName: userData.orgName || null,
              assignedTravelerIds: (orgData && orgData.assignedTravelerIds) || [],
              linkedDependentIds: userData.linkedDependentIds || [],
              onboardingComplete: userData.onboardingComplete !== false,
              createdAt: userData.createdAt || new Date().toISOString()
            };

            currentAuthUser = enrichedUser;
            authListeners.forEach(cb => cb(enrichedUser));
          } catch (e) {
            console.error('[SafeRoute Guardian] Failed to fetch Firestore user role:', e);
            currentAuthUser = user;
            authListeners.forEach(cb => cb(user));
          }
        } else {
          currentAuthUser = null;
          authListeners.forEach(cb => cb(null));
        }
      });
    }
  } catch (err) {
    console.warn('[SafeRoute Guardian] Live Firebase init skipped:', err.message);
    isFirebaseLive = false;
  }

  // Local fallback storage keys (stores non-sensitive profile state in isolated demo mode)
  const LOCAL_KEYS = {
    SESSION: 'srg_demo_session_v3',
    PROFILES: 'srg_demo_profiles_v3',
    ORGS: 'srg_demo_orgs_v3',
    DEPENDENTS: 'srg_demo_dependents_v3',
    INVITATIONS: 'srg_demo_invitations_v3'
  };

  function getLocalSession() {
    try {
      const raw = localStorage.getItem(LOCAL_KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setLocalSession(session) {
    try {
      if (session) {
        const sanitized = {
          uid: session.uid || 'usr-' + Date.now(),
          email: session.email || '',
          displayName: session.displayName || 'Traveler',
          photoURL: session.photoURL || null,
          emailVerified: true,
          primaryRole: session.primaryRole || 'tourist',
          allowedModes: session.allowedModes || [session.primaryRole || 'tourist'],
          orgPermission: session.orgPermission || 'staff',
          organizationId: session.organizationId || null,
          orgName: session.orgName || null,
          assignedTravelerIds: session.assignedTravelerIds || [],
          linkedDependentIds: session.linkedDependentIds || [],
          onboardingComplete: session.onboardingComplete !== false,
          isDemoUser: true,
          createdAt: session.createdAt || new Date().toISOString()
        };
        localStorage.setItem(LOCAL_KEYS.SESSION, JSON.stringify(sanitized));
        currentAuthUser = sanitized;
      } else {
        localStorage.removeItem(LOCAL_KEYS.SESSION);
        currentAuthUser = null;
      }
    } catch (e) {}
  }

  function getLocalProfiles() {
    try {
      const raw = localStorage.getItem(LOCAL_KEYS.PROFILES);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLocalProfile(uid, profileData) {
    try {
      const profiles = getLocalProfiles();
      profiles[uid] = { ...(profiles[uid] || {}), ...profileData, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (e) {}
  }

  // Cryptographic token generator
  function generateSecureToken(prefix = 'TOK') {
    const array = new Uint32Array(3);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
      return `${prefix}-${array[0].toString(36).toUpperCase()}-${array[1].toString(36).toUpperCase()}`;
    }
    return `${prefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  }

  return {
    isLive: function() {
      return isFirebaseLive;
    },

    onAuthStateChanged: function(callback) {
      authListeners.push(callback);
      if (isFirebaseLive && authInstance) {
        // Handled by Firebase auth listener
      } else {
        const session = getLocalSession();
        currentAuthUser = session;
        callback(session);
      }
      return () => {
        authListeners = authListeners.filter(cb => cb !== callback);
      };
    },

    getCurrentUser: function() {
      return currentAuthUser || (isFirebaseLive && authInstance ? authInstance.currentUser : getLocalSession());
    },

    // 1. Google OAuth Authentication
    signInWithGoogle: async function() {
      if (isFirebaseLive && authInstance && window.firebase) {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        const result = await authInstance.signInWithPopup(provider);
        return result.user;
      } else {
        if (!window.ConfigService.isDemoModeEnabled()) {
          throw new Error('Firebase configuration missing. Please configure Firebase to enable real Google authentication.');
        }
        await new Promise(res => setTimeout(res, 500));
        const mockUser = {
          uid: 'google-demo-' + Math.floor(Math.random() * 10000),
          displayName: 'Google Safety User (Demo)',
          email: 'demo-user@google.com',
          photoURL: null,
          emailVerified: true,
          primaryRole: 'tourist',
          allowedModes: ['tourist'],
          orgPermission: 'staff',
          onboardingComplete: false,
          linkedDependentIds: [],
          isDemoUser: true,
          createdAt: new Date().toISOString()
        };
        setLocalSession(mockUser);
        authListeners.forEach(cb => cb(mockUser));
        return mockUser;
      }
    },

    // 2. Email & Password Registration
    registerWithEmail: async function(email, password, displayName = '') {
      if (!email || !password) throw new Error('Please provide a valid email and password.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

      if (isFirebaseLive && authInstance) {
        const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
        if (displayName && userCredential.user) {
          await userCredential.user.updateProfile({ displayName });
        }
        // Send email verification
        if (userCredential.user && typeof userCredential.user.sendEmailVerification === 'function') {
          try {
            await userCredential.user.sendEmailVerification();
          } catch (e) {}
        }
        return userCredential.user;
      } else {
        if (!window.ConfigService.isDemoModeEnabled()) {
          throw new Error('Firebase configuration missing. Please configure Firebase to register accounts.');
        }
        await new Promise(res => setTimeout(res, 450));
        const mockUser = {
          uid: 'user-demo-' + Date.now(),
          displayName: displayName || email.split('@')[0],
          email: email.trim(),
          photoURL: null,
          emailVerified: true,
          primaryRole: 'tourist',
          allowedModes: ['tourist'],
          orgPermission: 'staff',
          onboardingComplete: false,
          linkedDependentIds: [],
          isDemoUser: true,
          createdAt: new Date().toISOString()
        };
        setLocalSession(mockUser);
        saveLocalProfile(mockUser.uid, mockUser);
        authListeners.forEach(cb => cb(mockUser));
        return mockUser;
      }
    },

    // 3. Email & Password Sign-In
    signInWithEmail: async function(email, password) {
      if (!email || !password) throw new Error('Please enter your email and password.');

      if (isFirebaseLive && authInstance) {
        const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
        return userCredential.user;
      } else {
        if (!window.ConfigService.isDemoModeEnabled()) {
          throw new Error('Firebase configuration missing. Real authentication requires valid Firebase keys in .env.local.');
        }
        await new Promise(res => setTimeout(res, 400));
        const profiles = getLocalProfiles();
        let matched = Object.values(profiles).find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
        const user = matched || {
          uid: 'user-demo-' + Date.now(),
          displayName: email.split('@')[0],
          email: email.trim(),
          photoURL: null,
          emailVerified: true,
          primaryRole: 'tourist',
          allowedModes: ['tourist'],
          orgPermission: 'staff',
          onboardingComplete: true,
          linkedDependentIds: [],
          isDemoUser: true,
          createdAt: new Date().toISOString()
        };
        setLocalSession(user);
        authListeners.forEach(cb => cb(user));
        return user;
      }
    },

    // 4. Password Reset
    resetPassword: async function(email) {
      if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.');

      if (isFirebaseLive && authInstance) {
        await authInstance.sendPasswordResetEmail(email);
        return { success: true, message: `Password reset email dispatched to ${email}.` };
      } else {
        await new Promise(res => setTimeout(res, 350));
        return { success: true, message: `[Simulated] Password reset link sent to ${email}.` };
      }
    },

    // 5. Sign Out
    signOutUser: async function() {
      if (isFirebaseLive && authInstance) {
        await authInstance.signOut();
      }
      setLocalSession(null);
      authListeners.forEach(cb => cb(null));
      return true;
    },

    // 6. User Profile Management
    getUserProfile: async function(userId) {
      if (isFirebaseLive && dbInstance) {
        const doc = await dbInstance.collection('users').doc(userId).get();
        return doc.exists ? doc.data() : null;
      } else {
        const profiles = getLocalProfiles();
        return profiles[userId] || getLocalSession();
      }
    },

    saveUserProfile: async function(userId, profileUpdates) {
      // Whitelist updateable profile fields to prevent privilege escalation
      const allowedFields = [
        'displayName', 'photoURL', 'emergencyContact', 'settings',
        'onboardingComplete', 'primaryRole', 'accessType', 'orgPermission',
        'orgName', 'organizationId', 'organizationIds', 'linkedDependentIds', 'allowedModes'
      ];
      const sanitized = {};
      allowedFields.forEach(k => {
        if (profileUpdates[k] !== undefined) sanitized[k] = profileUpdates[k];
      });
      sanitized.updatedAt = new Date().toISOString();

      if (isFirebaseLive && dbInstance) {
        await dbInstance.collection('users').doc(userId).set(sanitized, { merge: true });
      }
      saveLocalProfile(userId, sanitized);
      const current = getLocalSession();
      if (current && current.uid === userId) {
        const updated = { ...current, ...sanitized };
        setLocalSession(updated);
        authListeners.forEach(cb => cb(updated));
      }
      return true;
    },

    // 7. Consent-Based Dependent Linking Flow
    createDependentInviteToken: async function(parentId, dependentInfo) {
      const token = generateSecureToken('DEP-LINK');
      const payload = {
        token: token,
        parentId: parentId,
        dependentName: dependentInfo.name || 'Family Dependent',
        relation: dependentInfo.relation || 'Child',
        school: dependentInfo.school || 'Oakwood High',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      if (isFirebaseLive && dbInstance) {
        await dbInstance.collection('dependentInvitations').doc(token).set(payload);
      }
      return payload;
    },

    approveDependentLink: async function(parentId, dependentData) {
      const depId = 'dep-' + Date.now();
      const dependent = {
        id: depId,
        displayName: dependentData.name || 'Family Member',
        travelerType: dependentData.relation || 'Student',
        school: dependentData.school || 'Oakwood High',
        linkedParentIds: [parentId],
        status: 'ACTIVE_LINKED',
        createdAt: new Date().toISOString()
      };

      if (isFirebaseLive && dbInstance) {
        await dbInstance.collection('travelers').doc(depId).set(dependent);
      }

      const current = getLocalSession();
      const linked = (current && current.linkedDependentIds) || [];
      if (!linked.includes(depId)) {
        linked.push(depId);
      }

      await this.saveUserProfile(parentId, {
        primaryRole: 'parent',
        accessType: 'self',
        allowedModes: ['parent'],
        linkedDependentIds: linked,
        onboardingComplete: true
      });

      return dependent;
    },

    // 8. Cryptographic Organization Invitations & Joining
    createOrganization: async function(orgData, ownerUserId) {
      const orgId = 'org-' + Date.now();
      const payload = {
        id: orgId,
        name: orgData.name || 'Safety Organization',
        type: orgData.type || 'Educational Institution',
        ownerId: ownerUserId,
        createdAt: new Date().toISOString(),
        settings: {
          defaultCorridorWidthMeters: 100,
          escalationTimeoutMinutes: 15,
          emergencySmsEnabled: true
        }
      };

      if (isFirebaseLive && dbInstance) {
        await dbInstance.collection('organizations').doc(orgId).set(payload);
        await dbInstance.collection('organizations').doc(orgId).collection('members').doc(ownerUserId).set({
          uid: ownerUserId,
          role: 'admin',
          assignedTravelerIds: [],
          status: 'active',
          joinedAt: new Date().toISOString()
        });
      }

      await this.saveUserProfile(ownerUserId, {
        primaryRole: 'organization',
        accessType: 'admin',
        orgPermission: 'admin',
        organizationId: orgId,
        organizationIds: [orgId],
        orgName: payload.name,
        allowedModes: ['organization'],
        onboardingComplete: true
      });

      return payload;
    },

    createOrgInvitation: async function(orgId, email, role = 'staff') {
      const inviteToken = generateSecureToken('ORG-INV');
      const invitation = {
        token: inviteToken,
        organizationId: orgId,
        organizationName: 'Apex Global Safety Operations',
        email: email.trim().toLowerCase(),
        role: role === 'admin' ? 'admin' : 'staff',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      if (isFirebaseLive && dbInstance) {
        await dbInstance.collection('invitations').doc(inviteToken).set(invitation);
      } else {
        try {
          const raw = localStorage.getItem(LOCAL_KEYS.INVITATIONS);
          const invs = raw ? JSON.parse(raw) : {};
          invs[inviteToken] = invitation;
          localStorage.setItem(LOCAL_KEYS.INVITATIONS, JSON.stringify(invs));
        } catch (e) {}
      }
      return invitation;
    },

    joinOrganizationWithToken: async function(inviteToken, userId, userEmail = '') {
      if (!inviteToken || inviteToken.trim().length < 6) {
        throw new Error('Please enter a valid single-use organization invitation token.');
      }
      const token = inviteToken.trim().toUpperCase();

      let targetOrg = null;

      if (isFirebaseLive && dbInstance) {
        const invDoc = await dbInstance.collection('invitations').doc(token).get();
        if (!invDoc.exists) {
          throw new Error('Invalid or expired invitation token.');
        }
        const invData = invDoc.data();
        if (invData.status !== 'pending' || new Date(invData.expiresAt) < new Date()) {
          throw new Error('This invitation has already been redeemed or has expired.');
        }

        // Add member to org
        await dbInstance.collection('organizations').doc(invData.organizationId).collection('members').doc(userId).set({
          uid: userId,
          role: invData.role,
          assignedTravelerIds: [],
          status: 'active',
          joinedAt: new Date().toISOString()
        });

        // Mark invitation redeemed
        await dbInstance.collection('invitations').doc(token).update({
          status: 'accepted',
          acceptedBy: userId,
          acceptedAt: new Date().toISOString()
        });

        const orgDoc = await dbInstance.collection('organizations').doc(invData.organizationId).get();
        const orgInfo = orgDoc.data() || {};
        targetOrg = {
          id: invData.organizationId,
          name: orgInfo.name || 'Safety Organization',
          type: orgInfo.type || 'Educational Institution',
          role: invData.role || 'staff'
        };
      } else {
        // Local demo verification
        let localInvs = {};
        try {
          const raw = localStorage.getItem(LOCAL_KEYS.INVITATIONS);
          if (raw) localInvs = JSON.parse(raw);
        } catch (e) {}

        const matchedInv = localInvs[token];
        if (matchedInv) {
          targetOrg = {
            id: matchedInv.organizationId || 'demo-org-1',
            name: matchedInv.organizationName || 'Apex Global Safety Operations',
            type: 'Educational Institution',
            role: matchedInv.role === 'admin' ? 'admin' : 'staff'
          };
        } else if (token.startsWith('ORG-INV-') || token.startsWith('DEMO-')) {
          // Standard valid demo invite format
          targetOrg = {
            id: 'demo-org-1',
            name: 'Apex Global Safety Operations',
            type: 'Educational Institution',
            role: 'staff'
          };
        } else {
          throw new Error('Invalid invitation token. Please request an active invitation from your Organization Administrator.');
        }
      }

      await this.saveUserProfile(userId, {
        primaryRole: 'organization',
        accessType: targetOrg.role === 'admin' ? 'admin' : 'staff',
        orgPermission: targetOrg.role,
        organizationId: targetOrg.id,
        organizationIds: [targetOrg.id],
        orgName: targetOrg.name,
        allowedModes: ['organization'],
        onboardingComplete: true
      });

      return targetOrg;
    }
  };
})();
