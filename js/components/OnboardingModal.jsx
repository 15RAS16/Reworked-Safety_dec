/**
 * SafeRoute Guardian - Post-Login Role Onboarding & Demo Personas (v2.0)
 * 
 * Strict Post-Login Flow:
 * 1. Choose Main Role (Tourist | Parent/Guardian | Organization)
 * 2. Access Tier Configuration:
 *    - Tourist: Automatically "Self-use"
 *    - Parent: Automatically "Self-use"
 *    - Organization: "Administrator" vs "Staff Member" (No manual elevation in real mode)
 * 3. Profile / Organization Details setup
 * 4. Quick Evaluation Demo Personas (Post-Login Only):
 *    - Displays relevant demo personas filtered to the chosen role
 *    - Clearly labeled as "Demo / Competition Mode — No real emergency service contacted"
 *    - Includes "Skip demo and continue" button
 *    - Saves profile with onboardingComplete: true
 */

window.OnboardingModal = function({ currentUser, onCompleteOnboarding, onSelectDemoScenario }) {
  // Step 1: Role Selection, Step 2: Access Type / Org Tier, Step 3: Details, Step 4: Quick Demo Personas
  const [currentStep, setCurrentStep] = React.useState(1);
  
  // Selected configuration state
  const [selectedRole, setSelectedRole] = React.useState('tourist'); // 'tourist' | 'parent' | 'organization'
  const [accessType, setAccessType] = React.useState('self'); // 'self' | 'admin' | 'staff'
  const [orgAction, setOrgAction] = React.useState('create'); // 'create' | 'join'
  
  // Form fields
  const [emergencyContact, setEmergencyContact] = React.useState({ name: '', phone: '', relation: 'Primary Safety Contact' });
  const [dependentInfo, setDependentInfo] = React.useState({ name: 'Aarav Sharma', relation: 'Son (15 yrs)', school: 'MMU Mullana Campus' });
  const [orgForm, setOrgForm] = React.useState({ name: 'MMU Mullana Campus Safety Operations', type: 'Educational Institution', inviteToken: '' });
  
  // Selected Demo Persona
  const [selectedPersona, setSelectedPersona] = React.useState(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Handle Mode Selection (Step 1)
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'tourist') {
      setAccessType('self');
      setCurrentStep(3); // Skip access tier selection -> go straight to details
    } else if (role === 'parent') {
      setAccessType('self');
      setCurrentStep(3); // Skip access tier selection -> go straight to details
    } else if (role === 'organization') {
      setAccessType('staff'); // Default to staff
      setOrgAction('join');
      setCurrentStep(2); // Ask Admin vs Staff
    }
  };

  // Handle Organization Tier Selection (Step 2)
  const handleSelectOrgTier = (tier) => {
    setAccessType(tier);
    setErrorMessage('');
    if (tier === 'admin') {
      setOrgAction('create');
    } else {
      setOrgAction('join');
    }
    setCurrentStep(3);
  };

  // Finalize Profile Setup & Advance to Post-Login Demo Personas (Step 3 -> Step 4)
  const handleProceedToPersonas = async (skipDetails = false) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (selectedRole === 'tourist') {
        await window.FirebaseService.saveUserProfile(currentUser.uid, {
          primaryRole: 'tourist',
          accessType: 'self',
          orgPermission: 'staff',
          allowedModes: ['tourist'],
          emergencyContact: emergencyContact.phone ? emergencyContact : null
        });
      } else if (selectedRole === 'parent') {
        if (!skipDetails && dependentInfo.name.trim()) {
          await window.FirebaseService.approveDependentLink(currentUser.uid, dependentInfo);
        } else {
          await window.FirebaseService.saveUserProfile(currentUser.uid, {
            primaryRole: 'parent',
            accessType: 'self',
            orgPermission: 'staff',
            allowedModes: ['parent']
          });
        }
      } else if (selectedRole === 'organization') {
        if (accessType === 'admin') {
          if (orgAction === 'create') {
            if (!orgForm.name.trim()) throw new Error('Please enter an organization or university unit name.');
            await window.FirebaseService.createOrganization({ name: orgForm.name.trim(), type: orgForm.type }, currentUser.uid);
          } else {
            if (!orgForm.inviteToken.trim()) throw new Error('Please enter an administrator invitation token.');
            await window.FirebaseService.joinOrganizationWithToken(orgForm.inviteToken, currentUser.uid, currentUser.email);
          }
        } else {
          // Staff member
          const token = orgForm.inviteToken.trim() || 'ORG-INV-DEMO';
          await window.FirebaseService.joinOrganizationWithToken(token, currentUser.uid, currentUser.email);
        }
      }

      setIsLoading(false);
      setCurrentStep(4); // Move to Quick Evaluation Demo Personas
    } catch (err) {
      setErrorMessage(err.message || 'Setup could not be completed. Please check your details.');
      setIsLoading(false);
    }
  };

  // Complete onboarding (with or without selected persona)
  const handleFinishOnboarding = async (chosenPersona = null) => {
    setIsLoading(true);
    try {
      const orgPerm = (selectedRole === 'organization' && accessType === 'admin') ? 'admin' : 'staff';
      
      // Save onboarding complete flag
      await window.FirebaseService.saveUserProfile(currentUser.uid, {
        onboardingComplete: true
      });

      // If a demo persona was selected, apply its scenario
      if (chosenPersona && chosenPersona.scenarioId) {
        const allScenarios = (window.SRG_DATA && window.SRG_DATA.scenarios) || [];
        const matched = allScenarios.find(s => s.id === chosenPersona.scenarioId);
        if (matched && onSelectDemoScenario) {
          onSelectDemoScenario(matched);
        }
      }

      setSuccessMessage('Setup finalized! Launching your verified dashboard...');
      setTimeout(() => {
        onCompleteOnboarding(selectedRole, orgPerm, accessType);
      }, 500);
    } catch (err) {
      setIsLoading(false);
      onCompleteOnboarding(selectedRole, accessType === 'admin' ? 'admin' : 'staff', accessType);
    }
  };

  // Get relevant personas for the selected role
  const getRelevantPersonas = () => {
    const personas = (window.SRG_DATA && window.SRG_DATA.demoPersonas) || {};
    if (selectedRole === 'tourist') return personas.tourist || [];
    if (selectedRole === 'parent') return personas.parent || [];
    if (selectedRole === 'organization') {
      return accessType === 'admin' ? (personas.organization_admin || []) : (personas.organization_staff || []);
    }
    return [];
  };

  return (
    <div className="srg-modal-backdrop">
      <div className="srg-modal-card" style={{ maxWidth: '640px', padding: '2rem' }}>
        {/* Header with Progress Steps */}
        <div style={{ marginBottom: '1.4rem', paddingBottom: '1rem', borderBottom: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛡️</span>
              <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '1.05rem' }}>
                SafeRoute Guardian Setup
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#38BDF820', color: '#38BDF8', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '800' }}>
              Step {currentStep} of 4
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', fontSize: '0.68rem', textAlign: 'center', color: '#64748B', fontWeight: '700' }}>
            <div style={{ color: currentStep >= 1 ? '#38BDF8' : '#64748B', borderBottom: `2px solid ${currentStep >= 1 ? '#38BDF8' : '#1E293B'}`, paddingBottom: '4px' }}>1. Choose Role</div>
            <div style={{ color: currentStep >= 2 ? '#38BDF8' : '#64748B', borderBottom: `2px solid ${currentStep >= 2 ? '#38BDF8' : '#1E293B'}`, paddingBottom: '4px' }}>2. Access Tier</div>
            <div style={{ color: currentStep >= 3 ? '#38BDF8' : '#64748B', borderBottom: `2px solid ${currentStep >= 3 ? '#38BDF8' : '#1E293B'}`, paddingBottom: '4px' }}>3. Profile</div>
            <div style={{ color: currentStep >= 4 ? '#10B981' : '#64748B', borderBottom: `2px solid ${currentStep >= 4 ? '#10B981' : '#1E293B'}`, paddingBottom: '4px' }}>4. Demo Personas</div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', fontWeight: '600' }}>
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6EE7B7', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', fontWeight: '700' }}>
            ✓ {successMessage}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: Main Role Selection (Exactly 3 Cards)                             */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 0.3rem 0' }}>
                How will you use SafeRoute Guardian?
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
                Select your primary account purpose.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {/* Role 1: Tourist */}
              <div
                className="srg-role-selection-card"
                style={{ background: '#0B1528', border: '1.5px solid #1E293B', borderRadius: '12px', padding: '1.1rem', cursor: 'pointer' }}
                onClick={() => handleSelectRole('tourist')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '2.2rem' }}>🧳</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '1.05rem' }}>Tourist & Visitor</b>
                      <span style={{ fontSize: '0.7rem', background: '#38BDF820', color: '#38BDF8', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: '800' }}>Self-Use</span>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 0.6rem 0' }}>
                      Explore campus & local destinations with live route safety, AI weather alerts, safe havens, and emergency SOS.
                    </p>
                    <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#38BDF8', borderColor: '#38BDF8' }}>
                      Continue as Tourist (Self-use) →
                    </button>
                  </div>
                </div>
              </div>

              {/* Role 2: Parent / Guardian */}
              <div
                className="srg-role-selection-card"
                style={{ background: '#0B1528', border: '1.5px solid #1E293B', borderRadius: '12px', padding: '1.1rem', cursor: 'pointer' }}
                onClick={() => handleSelectRole('parent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '2.2rem' }}>👨‍👩‍👧</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '1.05rem' }}>Parent / Guardian</b>
                      <span style={{ fontSize: '0.7rem', background: '#10B98120', color: '#10B981', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: '800' }}>Family Safety</span>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 0.6rem 0' }}>
                      Monitor a student or family dependent traveling along approved university and daily commute corridors.
                    </p>
                    <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#10B981', borderColor: '#10B981' }}>
                      Continue as Parent / Guardian →
                    </button>
                  </div>
                </div>
              </div>

              {/* Role 3: Organization */}
              <div
                className="srg-role-selection-card"
                style={{ background: '#0B1528', border: '1.5px solid #1E293B', borderRadius: '12px', padding: '1.1rem', cursor: 'pointer' }}
                onClick={() => handleSelectRole('organization')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '2.2rem' }}>🏢</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '1.05rem' }}>Organization</b>
                      <span style={{ fontSize: '0.7rem', background: '#F59E0B20', color: '#F59E0B', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: '800' }}>Campus & Enterprise</span>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 0.6rem 0' }}>
                      University security command, hostel wardens, coordinators, or enterprise fleet safety coordinators.
                    </p>
                    <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#F59E0B', borderColor: '#F59E0B' }}>
                      Continue as Organization →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Organization Tier Selection (Admin vs Staff)                      */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: '800', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                ORGANIZATION ROLE TIER
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 0.3rem 0' }}>
                Select Your Organization Position
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
                Are you an Administrator or a Staff Member?
              </p>
            </div>

            <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {/* Option 1: Administrator */}
              <div
                style={{ background: '#0B1528', border: '1.5px solid #38BDF8', borderRadius: '12px', padding: '1.1rem', cursor: 'pointer' }}
                onClick={() => handleSelectOrgTier('admin')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>👑</span>
                  <div>
                    <b style={{ color: '#FFFFFF', fontSize: '1rem', display: 'block' }}>Organization Administrator</b>
                    <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '700' }}>Full Command Center & Geofence Policy Management</span>
                  </div>
                </div>
                <p style={{ color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 0.6rem 0' }}>
                  Manage campus-wide geofence corridors, view all travelers, invite staff members, and configure CAD gateways.
                </p>
                <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#38BDF8', borderColor: '#38BDF8' }}>
                  Select Administrator →
                </button>
              </div>

              {/* Option 2: Staff Member */}
              <div
                style={{ background: '#0B1528', border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '1.1rem', cursor: 'pointer' }}
                onClick={() => handleSelectOrgTier('staff')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>🛡️</span>
                  <div>
                    <b style={{ color: '#FFFFFF', fontSize: '1rem', display: 'block' }}>Staff Member / Field Coordinator</b>
                    <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: '700' }}>Assigned Fleet & Incident Operations</span>
                  </div>
                </div>
                <p style={{ color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 0.6rem 0' }}>
                  Monitor assigned traveler groups, hostel blocks, or student shifts with real-time incident resolution.
                </p>
                <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#F59E0B', borderColor: '#F59E0B' }}>
                  Join as Staff Member →
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={() => setCurrentStep(1)}>
                ← Back to Mode Selection
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Setup Profile Details                                             */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div>
            {/* Tourist Profile */}
            {selectedRole === 'tourist' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  Personal Safety Profile
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.1rem' }}>
                  Optional: Add a primary emergency contact for automated notification during emergency SOS triggers.
                </p>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                    Emergency Contact Name (Optional)
                    <input
                      type="text"
                      className="srg-insta-input"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                      placeholder="e.g. Dr. Kabir Roy"
                      style={{ marginTop: '0.3rem' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                    Emergency Phone Number
                    <input
                      type="tel"
                      className="srg-insta-input"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{ marginTop: '0.3rem' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Parent Profile */}
            {selectedRole === 'parent' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  Link Family Dependent
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.1rem' }}>
                  Enter student / dependent details to initiate real-time campus corridor monitoring.
                </p>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                    Dependent's Full Name
                    <input
                      type="text"
                      className="srg-insta-input"
                      value={dependentInfo.name}
                      onChange={(e) => setDependentInfo({ ...dependentInfo, name: e.target.value })}
                      placeholder="e.g. Aarav Sharma"
                      style={{ marginTop: '0.3rem' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                    Relationship
                    <input
                      type="text"
                      className="srg-insta-input"
                      value={dependentInfo.relation}
                      onChange={(e) => setDependentInfo({ ...dependentInfo, relation: e.target.value })}
                      placeholder="e.g. Son (15 yrs) / Student"
                      style={{ marginTop: '0.3rem' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                    Campus / Institution
                    <input
                      type="text"
                      className="srg-insta-input"
                      value={dependentInfo.school}
                      onChange={(e) => setDependentInfo({ ...dependentInfo, school: e.target.value })}
                      placeholder="e.g. MMU Mullana Campus"
                      style={{ marginTop: '0.3rem' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Organization Profile */}
            {selectedRole === 'organization' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  {accessType === 'admin' ? 'Organization Administrator Setup' : 'Staff Member Setup'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.1rem' }}>
                  {accessType === 'admin'
                    ? 'Configure your university unit or safety command center.'
                    : 'Enter your staff invitation token provided by your Administrator.'}
                </p>

                {accessType === 'admin' ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                      Organization / Campus Unit Name
                      <input
                        type="text"
                        className="srg-insta-input"
                        value={orgForm.name}
                        onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                        placeholder="e.g. MMU Mullana Security Command"
                        style={{ marginTop: '0.3rem' }}
                        required
                      />
                    </label>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                      Unit Type
                      <select
                        className="srg-insta-input"
                        value={orgForm.type}
                        onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value })}
                        style={{ marginTop: '0.3rem' }}
                      >
                        <option value="Educational Institution">Educational Institution / University</option>
                        <option value="Hospital / Healthcare">Hospital & Healthcare Facility</option>
                        <option value="Tour Operator">Tour & Travel Operator</option>
                        <option value="Corporate Enterprise">Enterprise Campus</option>
                      </select>
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                      Staff Invitation Token
                      <input
                        type="text"
                        className="srg-insta-input"
                        value={orgForm.inviteToken}
                        onChange={(e) => setOrgForm({ ...orgForm, inviteToken: e.target.value })}
                        placeholder="e.g. ORG-INV-DEMO"
                        style={{ marginTop: '0.3rem' }}
                      />
                    </label>
                    <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                      For testing, you can use <code>ORG-INV-DEMO</code>.
                    </small>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="srg-btn srg-btn-outline"
                onClick={() => setCurrentStep(selectedRole === 'organization' ? 2 : 1)}
              >
                ← Back
              </button>
              <button
                type="button"
                className="srg-btn srg-btn-primary"
                onClick={() => handleProceedToPersonas(false)}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Continue to Demo Personas →'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Quick Evaluation Demo Personas (POST-LOGIN ONLY)                   */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                QUICK EVALUATION DEMO PERSONAS
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 0.3rem 0' }}>
                Choose a Demo Scenario to Evaluate
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                Select a relevant pre-configured persona for {selectedRole.toUpperCase()} mode, or skip to start fresh.
              </p>
            </div>

            {/* Permanent Simulation Notice */}
            <div className="srg-competition-notice">
              <span>⚡</span>
              <span><b>Demo / Competition Mode</b> — No real emergency services or SMS are contacted.</span>
            </div>

            {/* Persona Selection Grid */}
            <div className="srg-onboarding-persona-grid">
              {getRelevantPersonas().map((persona) => {
                const isSelected = selectedPersona && selectedPersona.id === persona.id;
                return (
                  <div
                    key={persona.id}
                    className={`srg-onboarding-persona-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPersona(persona)}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '1.6rem' }}>{persona.avatar}</span>
                        <span style={{ fontSize: '0.68rem', background: '#38BDF820', color: '#38BDF8', padding: '0.15rem 0.45rem', borderRadius: '999px', fontWeight: '800' }}>
                          {persona.tag}
                        </span>
                      </div>
                      <b style={{ color: '#FFFFFF', fontSize: '0.92rem', display: 'block' }}>{persona.name}</b>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem' }}>{persona.roleTitle}</span>
                      <p style={{ color: '#CBD5E1', fontSize: '0.76rem', lineHeight: '1.4', margin: 0 }}>
                        {persona.description}
                      </p>
                    </div>

                    <div style={{ marginTop: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid #1E293B' }}>
                      <span style={{ fontSize: '0.72rem', color: isSelected ? '#10B981' : '#38BDF8', fontWeight: '700' }}>
                        {isSelected ? '✓ Selected for Demo' : 'Select Persona'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="srg-btn srg-btn-outline srg-btn-sm"
                onClick={() => handleFinishOnboarding(null)}
                disabled={isLoading}
              >
                Skip demo and continue →
              </button>

              <button
                type="button"
                className="srg-btn srg-btn-primary"
                onClick={() => handleFinishOnboarding(selectedPersona)}
                disabled={isLoading}
              >
                {isLoading
                  ? 'Launching...'
                  : selectedPersona
                    ? `Launch with ${selectedPersona.name} →`
                    : 'Confirm & Open Dashboard →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
