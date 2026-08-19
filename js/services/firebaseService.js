/**
 * SafeRoute Guardian - Firebase Authentication & Cloud Firestore Service Layer
 * Supports Google OAuth, Email/Password auth, Password Reset, onAuthStateChanged,
 * role-based profile persistence, organizations, dependents, and zero-breakage mock fallback.
 * 
 * SECURITY RULES:
 * - Never store passwords, Gmail credentials, or secrets in LocalStorage.
 * - Never build forms asking for third-party OAuth provider passwords directly.
 * - Enforce role-based access control and strict data separation.
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

      // Listen for auth state changes
      authInstance.onAuthStateChanged((user) => {
        currentAuthUser = user;
        authListeners.forEach(cb => cb(user));
      });
    }
  } catch (err) {
    console.warn('[SafeRoute Guardian] Firebase live init skipped, using secure local simulation:', err.message);
    isFirebaseLive = false;
  }

  // Local fallback storage keys (stores only sanitized non-sensitive profile data)
  const LOCAL_KEYS = {
    SESSION: 'srg_auth_session_v2',
    PROFILES: 'srg_user_profiles_v2',
    ORGS: 'srg_organizations_v2',
    DEPENDENTS: 'srg_dependents_v2'
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
        // Sanitize: ensure no passwords or secrets exist
        const sanitized = {
          uid: session.uid || 'usr-' + Date.now(),
          email: session.email || '',
          displayName: session.displayName || 'Traveler',
          photoURL: session.photoURL || null,
          providerId: session.providerId || 'password',
          primaryRole: session.primaryRole || 'tourist',
          orgPermission: session.orgPermission || 'staff',
          orgId: session.orgId || null,
          orgName: session.orgName || null,
          onboardingComplete: !!session.onboardingComplete,
          linkedDependentIds: session.linkedDependentIds || [],
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

  return {
    isLive: function() {
      return isFirebaseLive;
    },

    onAuthStateChanged: function(callback) {
      authListeners.push(callback);
      if (isFirebaseLive && authInstance) {
        // Handled by authInstance listener above
      } else {
        // Emit current local session
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

    // 1. Sign in with Google (OAuth Popup)
    signInWithGoogle: async function() {
      if (isFirebaseLive && authInstance && window.firebase) {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        const result = await authInstance.signInWithPopup(provider);
        return result.user;
      } else {
        // Safe simulated Google OAuth flow
        await new Promise(res => setTimeout(res, 600));
        const mockUser = {
          uid: 'google-user-' + Math.floor(Math.random() * 10000),
          displayName: 'Google Safety User',
          email: 'user@google-oauth.demo',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          providerId: 'google.com',
          primaryRole: 'tourist',
          orgPermission: 'staff',
          onboardingComplete: false,
          linkedDependentIds: [],
          createdAt: new Date().toISOString()
        };
        setLocalSession(mockUser);
        authListeners.forEach(cb => cb(mockUser));
        return mockUser;
      }
    },

    // 2. Email and Password Registration
    registerWithEmail: async function(email, password, displayName = '') {
      if (!email || !password) throw new Error('Please provide a valid email and password.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');

      if (isFirebaseLive && authInstance) {
        const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
        if (displayName && userCredential.user) {
          await userCredential.user.updateProfile({ displayName });
        }
        return userCredential.user;
      } else {
        await new Promise(res => setTimeout(res, 500));
        const name = displayName || email.split('@')[0];
        const mockUser = {
          uid: 'user-' + Date.now(),
          displayName: name,
          email: email.trim(),
          photoURL: null,
          providerId: 'password',
          primaryRole: 'tourist',
          orgPermission: 'staff',
          onboardingComplete: false,
          linkedDependentIds: [],
          createdAt: new Date().toISOString()
        };
        setLocalSession(mockUser);
        saveLocalProfile(mockUser.uid, mockUser);
        authListeners.forEach(cb => cb(mockUser));
        return mockUser;
      }
    },

    // 3. Email and Password Sign-In
    signInWithEmail: async function(email, password) {
      if (!email || !password) throw new Error('Please enter both your email and password.');

      if (isFirebaseLive && authInstance) {
        const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
        return userCredential.user;
      } else {
        await new Promise(res => setTimeout(res, 450));
        const profiles = getLocalProfiles();
        // Check if existing profile matched by email
        let matched = Object.values(profiles).find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
        const user = matched || {
          uid: 'user-' + Date.now(),
          displayName: email.split('@')[0],
          email: email.trim(),
          photoURL: null,
          providerId: 'password',
          primaryRole: 'tourist',
          orgPermission: 'staff',
          onboardingComplete: true,
          linkedDependentIds: [],
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
        return { success: true, message: `Password reset link sent to ${email}.` };
      } else {
        await new Promise(res => setTimeout(res, 400));
        return { success: true, message: `[Simulated] Password reset email dispatched to ${email}.` };
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

    // 6. Profile & Role Management
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
      if (isFirebaseLive && dbInstance) {
        await dbInstance.collection('users').doc(userId).set(profileUpdates, { merge: true });
      }
      saveLocalProfile(userId, profileUpdates);
      const current = getLocalSession();
      if (current && current.uid === userId) {
        const updated = { ...current, ...profileUpdates };
        setLocalSession(updated);
        authListeners.forEach(cb => cb(updated));
      }
      return true;
    },

    // 7. Organization Helpers
    createOrganization: async function(orgData, ownerUserId) {
      const orgId = 'org-' + Date.now();
      const payload = {
        id: orgId,
        name: orgData.name || 'Safety Organization',
        type: orgData.type || 'School / University',
        ownerId: ownerUserId,
        inviteCode: 'ORG-' + Math.floor(100000 + Math.random() * 900000),
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
          userId: ownerUserId,
          role: 'admin',
          assignedTravelerIds: [],
          joinedAt: new Date().toISOString()
        });
      }

      // Update local profile
      await this.saveUserProfile(ownerUserId, {
        primaryRole: 'organization',
        orgPermission: 'admin',
        orgId: orgId,
        orgName: payload.name,
        onboardingComplete: true
      });

      return payload;
    },

    joinOrganizationWithCode: async function(inviteCode, userId, userEmail = '') {
      if (!inviteCode || inviteCode.trim().length < 4) {
        throw new Error('Please enter a valid organization invite code.');
      }
      const code = inviteCode.trim().toUpperCase();

      // Simulated lookup / Firestore query
      const orgPayload = {
        id: 'org-joined-' + Date.now(),
        name: code.includes('ADMIN') ? 'Metro City Campus Safety' : 'Apex Global Travel Ops',
        type: 'Educational Institution',
        role: code.includes('ADMIN') ? 'admin' : 'staff'
      };

      await this.saveUserProfile(userId, {
        primaryRole: 'organization',
        orgPermission: orgPayload.role,
        orgId: orgPayload.id,
        orgName: orgPayload.name,
        onboardingComplete: true
      });

      return orgPayload;
    },

    // 8. Dependent Linking Helpers (Parent / Guardian)
    linkDependent: async function(parentId, dependentData) {
      const depId = 'dep-' + Date.now();
      const dependent = {
        id: depId,
        displayName: dependentData.displayName || 'Family Member',
        travelerType: dependentData.travelerType || 'Student',
        linkingCode: dependentData.linkingCode || 'DEP-' + Math.floor(1000 + Math.random() * 9000),
        linkedParentIds: [parentId],
        activeRouteId: dependentData.activeRouteId || 'student-commute',
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
        linkedDependentIds: linked,
        onboardingComplete: true
      });

      return dependent;
    }
  };
})();
