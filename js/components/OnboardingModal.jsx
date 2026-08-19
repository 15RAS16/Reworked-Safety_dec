/**
 * SafeRoute Guardian - First-Time User Onboarding Modal (v2.0)
 * Implements strict 4-step guided role selection and RBAC access configuration:
 * Step 1: Account Login (Completed)
 * Step 2: Select Mode (Tourist / Parent / Organization)
 * Step 3: Choose Access Type (Self Use vs Org Admin vs Org Staff)
 * Step 4: Setup Profile & Verification
 */

window.OnboardingModal = function({ currentUser, onCompleteOnboarding }) {
  // Step 2: Select Mode, Step 3: Choose Access Type, Step 4: Setup Profile
  const [currentStep, setCurrentStep] = React.useState(2);
  
  // Selected configuration state
  const [selectedRole, setSelectedRole] = React.useState('tourist'); // 'tourist' | 'parent' | 'organization'
  const [accessType, setAccessType] = React.useState('self'); // 'self' | 'admin' | 'staff'
  const [orgAction, setOrgAction] = React.useState('create'); // 'create' | 'join'
  
  // Form fields
  const [emergencyContact, setEmergencyContact] = React.useState({ name: '', phone: '', relation: 'Primary Safety Contact' });
  const [dependentInfo, setDependentInfo] = React.useState({ name: '', relation: 'Son / Daughter', school: 'Oakwood High School' });
  const [orgForm, setOrgForm] = React.useState({ name: '', type: 'Educational Institution', inviteToken: '' });
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Handle Mode Selection in Step 2
  const handleSelectMode = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'tourist') {
      setAccessType('self');
    } else if (role === 'parent') {
      setAccessType('self');
    } else if (role === 'organization') {
      setAccessType('admin'); // Default to admin or staff
      setOrgAction('create');
    }
    setCurrentStep(3);
  };

  // Handle Access Type Selection in Step 3
  const handleSelectAccessType = (type) => {
    setAccessType(type);
    setErrorMessage('');
    if (type === 'staff') {
      setOrgAction('join');
    }
    setCurrentStep(4);
  };

  // Finalize Setup and Save in Firestore
  const handleCompleteSetup = async (skipDependent = false) => {
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
          emergencyContact: emergencyContact.phone ? emergencyContact : null,
          onboardingComplete: true
        });
        setSuccessMessage('Tourist profile configured successfully! Opening personal safety dashboard...');
        setTimeout(() => {
          onCompleteOnboarding('tourist', 'staff', 'self');
        }, 600);
      } else if (selectedRole === 'parent') {
        if (!skipDependent && dependentInfo.name.trim()) {
          await window.FirebaseService.approveDependentLink(currentUser.uid, dependentInfo);
        } else {
          await window.FirebaseService.saveUserProfile(currentUser.uid, {
            primaryRole: 'parent',
            accessType: 'self',
            orgPermission: 'staff',
            allowedModes: ['parent'],
            onboardingComplete: true
          });
        }
        setSuccessMessage('Parent Guardian profile configured! Opening family monitoring dashboard...');
        setTimeout(() => {
          onCompleteOnboarding('parent', 'staff', 'self');
        }, 600);
      } else if (selectedRole === 'organization') {
        if (accessType === 'admin') {
          if (orgAction === 'create') {
            if (!orgForm.name.trim()) {
              throw new Error('Please enter an organization or school name.');
            }
            await window.FirebaseService.createOrganization({ name: orgForm.name.trim(), type: orgForm.type }, currentUser.uid);
            setSuccessMessage('Organization created successfully! Launching Command Center...');
            setTimeout(() => {
              onCompleteOnboarding('organization', 'admin', 'admin');
            }, 600);
          } else {
            // Join via Admin invite token
            if (!orgForm.inviteToken.trim()) {
              throw new Error('Please enter an organization administrator invitation token.');
            }
            const joinedOrg = await window.FirebaseService.joinOrganizationWithToken(orgForm.inviteToken, currentUser.uid, currentUser.email);
            setSuccessMessage(`Joined ${joinedOrg.name} as Administrator! Launching Command Center...`);
            setTimeout(() => {
              onCompleteOnboarding('organization', 'admin', 'admin');
            }, 600);
          }
        } else {
          // Organization Staff flow
          if (!orgForm.inviteToken.trim()) {
            throw new Error('Please enter your official single-use staff invitation token.');
          }
          const joinedOrg = await window.FirebaseService.joinOrganizationWithToken(orgForm.inviteToken, currentUser.uid, currentUser.email);
          setSuccessMessage(`Joined ${joinedOrg.name} as Staff Member! Launching Staff Operations Dashboard...`);
          setTimeout(() => {
            onCompleteOnboarding('organization', 'staff', 'staff');
          }, 600);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Setup could not be completed. Please verify your details.');
      setIsLoading(false);
    }
  };

  return (
    <div className="srg-modal-backdrop">
      <div className="srg-modal-card" style={{ maxWidth: '640px', padding: '2rem' }}>
        {/* Progress Step Indicator */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🛡️</span>
              <span style={{ fontWeight: '900', color: '#FFFFFF', fontSize: '1.1rem' }}>SafeRoute Guardian Setup</span>
            </div>
            <span style={{ fontSize: '0.74rem', background: '#38BDF820', color: '#38BDF8', padding: '0.25rem 0.65rem', borderRadius: '999px', fontWeight: '800' }}>
              Step {currentStep} of 4
            </span>
          </div>

          {/* Stepper Breadcrumbs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', fontSize: '0.68rem', textAlign: 'center', color: '#64748B', fontWeight: '700' }}>
            <div style={{ color: '#10B981', borderBottom: '2px solid #10B981', paddingBottom: '4px' }}>✓ 1. Account</div>
            <div style={{ color: currentStep >= 2 ? '#38BDF8' : '#64748B', borderBottom: `2px solid ${currentStep >= 2 ? '#38BDF8' : '#334155'}`, paddingBottom: '4px' }}>2. Mode</div>
            <div style={{ color: currentStep >= 3 ? '#38BDF8' : '#64748B', borderBottom: `2px solid ${currentStep >= 3 ? '#38BDF8' : '#334155'}`, paddingBottom: '4px' }}>3. Access Type</div>
            <div style={{ color: currentStep >= 4 ? '#38BDF8' : '#64748B', borderBottom: `2px solid ${currentStep >= 4 ? '#38BDF8' : '#334155'}`, paddingBottom: '4px' }}>4. Profile</div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '1.2rem', fontWeight: '600' }}>
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '1.2rem', fontWeight: '700' }}>
            ✓ {successMessage}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 1 (STEP 2): "How will you use SafeRoute Guardian?" (Exactly 3 Cards) */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '1.4rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
                How will you use SafeRoute Guardian?
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0 }}>
                Select your primary account purpose to configure your tailored safety workspace.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Card 1: Tourist */}
              <div
                className="srg-role-selection-card"
                style={{ background: '#0F172A', border: '2px solid #1E293B', borderRadius: '14px', padding: '1.2rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => handleSelectMode('tourist')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ fontSize: '2.4rem' }}>🧳</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '1.1rem' }}>Tourist</b>
                      <span style={{ fontSize: '0.72rem', background: '#38BDF820', color: '#38BDF8', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: '800' }}>Personal Travel</span>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.45', margin: '0 0 0.8rem 0' }}>
                      Use SafeRoute Guardian for your own travel, route safety, emergency SOS, local help, and tourist intelligence.
                    </p>
                    <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#38BDF8', borderColor: '#38BDF8' }}>
                      Continue as Tourist →
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Parent / Guardian */}
              <div
                className="srg-role-selection-card"
                style={{ background: '#0F172A', border: '2px solid #1E293B', borderRadius: '14px', padding: '1.2rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => handleSelectMode('parent')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ fontSize: '2.4rem' }}>👨‍👩‍👧</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '1.1rem' }}>Parent / Guardian</b>
                      <span style={{ fontSize: '0.72rem', background: '#10B98120', color: '#10B981', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: '800' }}>Family Safety</span>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.45', margin: '0 0 0.8rem 0' }}>
                      Monitor and protect a child, elderly family member, or dependent during their journey.
                    </p>
                    <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#10B981', borderColor: '#10B981' }}>
                      Continue as Parent / Guardian →
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Organization */}
              <div
                className="srg-role-selection-card"
                style={{ background: '#0F172A', border: '2px solid #1E293B', borderRadius: '14px', padding: '1.2rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => handleSelectMode('organization')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ fontSize: '2.4rem' }}>🏢</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <b style={{ color: '#FFFFFF', fontSize: '1.1rem' }}>Organization</b>
                      <span style={{ fontSize: '0.72rem', background: '#F59E0B20', color: '#F59E0B', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: '800' }}>School & Enterprise</span>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.45', margin: '0 0 0.8rem 0' }}>
                      Manage travel safety for a school, company, tour group, hospital, or institution.
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
        {/* SCREEN 2 (STEP 3): "Choose your access type" (Changes based on main mode) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: '800', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                WORKSPACE ACCESS TIER
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
                Choose your access type
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0 }}>
                {selectedRole === 'tourist' && 'Configuring individual explorer workspace.'}
                {selectedRole === 'parent' && 'Configuring family guardian monitoring tier.'}
                {selectedRole === 'organization' && 'Select whether you are creating/managing an organization or joining as staff.'}
              </p>
            </div>

            {/* TOURIST ACCESS OPTIONS (Self Use only) */}
            {selectedRole === 'tourist' && (
              <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div
                  style={{ background: '#0F172A', border: '2px solid #38BDF8', borderRadius: '12px', padding: '1.2rem', cursor: 'pointer' }}
                  onClick={() => handleSelectAccessType('self')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>👤</span>
                    <b style={{ color: '#FFFFFF', fontSize: '1.05rem' }}>Self Use</b>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.45', margin: '0 0 0.8rem 0' }}>
                    I am using SafeRoute Guardian for my own personal travel safety.
                  </p>
                  <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#38BDF8', borderColor: '#38BDF8' }}>
                    Proceed with Personal Profile →
                  </button>
                </div>
              </div>
            )}

            {/* PARENT ACCESS OPTIONS (Self Use / Guardian) */}
            {selectedRole === 'parent' && (
              <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div
                  style={{ background: '#0F172A', border: '2px solid #10B981', borderRadius: '12px', padding: '1.2rem', cursor: 'pointer' }}
                  onClick={() => handleSelectAccessType('self')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>👨‍👩‍👧</span>
                    <b style={{ color: '#FFFFFF', fontSize: '1.05rem' }}>Self Use / Guardian</b>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.45', margin: '0 0 0.8rem 0' }}>
                    I want to monitor my own child, family member, elderly parent, or dependent.
                  </p>
                  <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#10B981', borderColor: '#10B981' }}>
                    Proceed to Dependent Setup →
                  </button>
                </div>
              </div>
            )}

            {/* ORGANIZATION ACCESS OPTIONS (Exactly 2 Choices: Administrator vs Staff) */}
            {selectedRole === 'organization' && (
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Choice 1: Organization Administrator */}
                <div
                  style={{ background: '#0F172A', border: '2px solid #38BDF8', borderRadius: '12px', padding: '1.2rem', cursor: 'pointer' }}
                  onClick={() => handleSelectAccessType('admin')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>👑</span>
                    <div>
                      <b style={{ color: '#FFFFFF', fontSize: '1.05rem', display: 'block' }}>Organization Administrator</b>
                      <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '700' }}>Full Command Center & Roster Control</span>
                    </div>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.45', margin: '0 0 0.8rem 0' }}>
                    I am creating or managing a school, company, hospital, travel agency, or safety organization.
                  </p>
                  <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#38BDF8', borderColor: '#38BDF8' }}>
                    Select Administrator →
                  </button>
                </div>

                {/* Choice 2: Organization User / Staff */}
                <div
                  style={{ background: '#0F172A', border: '2px solid #F59E0B', borderRadius: '12px', padding: '1.2rem', cursor: 'pointer' }}
                  onClick={() => handleSelectAccessType('staff')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>🛡️</span>
                    <div>
                      <b style={{ color: '#FFFFFF', fontSize: '1.05rem', display: 'block' }}>Organization User / Staff</b>
                      <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: '700' }}>Assigned Fleet & Incident Operations</span>
                    </div>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.45', margin: '0 0 0.8rem 0' }}>
                    I am a staff member, safety officer, teacher, guide, or employee who monitors assigned travelers.
                  </p>
                  <button type="button" className="srg-btn srg-btn-primary srg-btn-sm" style={{ width: '100%', background: '#F59E0B', borderColor: '#F59E0B' }}>
                    Join as Staff Member →
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" onClick={() => setCurrentStep(2)}>
                ← Back to Mode Selection
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3 (STEP 4): "Setup Profile & Verification"                         */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div>
            {/* 1. Tourist Profile Setup */}
            {selectedRole === 'tourist' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  Personal Safety Profile
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1.2rem' }}>
                  Optional: Add a primary safety contact for automated SOS dispatch during emergency escalation.
                </p>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <label>
                    Emergency Contact Name (Optional)
                    <input
                      type="text"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                      placeholder="e.g. Maya Chen"
                    />
                  </label>
                  <label>
                    Emergency Contact Phone Number
                    <input
                      type="tel"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      placeholder="+1 (555) 019-2831"
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="srg-btn srg-btn-outline" onClick={() => setCurrentStep(3)}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="srg-btn srg-btn-primary"
                    onClick={() => handleCompleteSetup(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Enter Tourist Dashboard →'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Parent / Guardian Setup */}
            {selectedRole === 'parent' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  Link Family Dependent
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1.2rem' }}>
                  Enter your dependent's details to initialize real-time corridor monitoring, or choose to link later.
                </p>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <label>
                    Dependent's Full Name
                    <input
                      type="text"
                      value={dependentInfo.name}
                      onChange={(e) => setDependentInfo({ ...dependentInfo, name: e.target.value })}
                      placeholder="e.g. Aarav Sharma"
                    />
                  </label>
                  <label>
                    Relationship
                    <input
                      type="text"
                      value={dependentInfo.relation}
                      onChange={(e) => setDependentInfo({ ...dependentInfo, relation: e.target.value })}
                      placeholder="e.g. Son (15 yrs) / Elderly Parent"
                    />
                  </label>
                  <label>
                    School / Daily Activity Location
                    <input
                      type="text"
                      value={dependentInfo.school}
                      onChange={(e) => setDependentInfo({ ...dependentInfo, school: e.target.value })}
                      placeholder="e.g. Oakwood High School"
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="srg-btn srg-btn-outline" onClick={() => setCurrentStep(3)}>
                    ← Back
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="srg-btn srg-btn-outline"
                      onClick={() => handleCompleteSetup(true)}
                      disabled={isLoading}
                    >
                      Link Later
                    </button>
                    <button
                      type="button"
                      className="srg-btn srg-btn-primary"
                      onClick={() => handleCompleteSetup(false)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Confirm & Open Guardian Dashboard →'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Organization Setup */}
            {selectedRole === 'organization' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.3rem' }}>
                  {accessType === 'admin' ? 'Organization Administrator Setup' : 'Organization Staff Verification'}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1.2rem' }}>
                  {accessType === 'admin'
                    ? 'Create a new safety organization or enter an administrator invitation token.'
                    : 'Enter the official single-use invitation token provided by your Organization Administrator.'}
                </p>

                {accessType === 'admin' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                    <button
                      type="button"
                      className={`srg-btn srg-btn-sm ${orgAction === 'create' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                      style={{ flex: 1 }}
                      onClick={() => setOrgAction('create')}
                    >
                      + Create New Organization
                    </button>
                    <button
                      type="button"
                      className={`srg-btn srg-btn-sm ${orgAction === 'join' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                      style={{ flex: 1 }}
                      onClick={() => setOrgAction('join')}
                    >
                      Enter Admin Invite Token
                    </button>
                  </div>
                )}

                {accessType === 'admin' && orgAction === 'create' ? (
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label>
                      Organization / Institution Name
                      <input
                        type="text"
                        value={orgForm.name}
                        onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                        placeholder="e.g. Apex Global Safety Operations"
                        required
                      />
                    </label>
                    <label>
                      Organization Type
                      <select value={orgForm.type} onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value })}>
                        <option value="Educational Institution">Educational Institution / School</option>
                        <option value="Tour Operator">Tour & Travel Operator</option>
                        <option value="Hospital / Healthcare">Hospital / Healthcare Facility</option>
                        <option value="Corporate Enterprise">Corporate Enterprise / Night Shifts</option>
                      </select>
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label>
                      {accessType === 'admin' ? 'Administrator Invitation Token' : 'Official Staff Invitation Token'}
                      <input
                        type="text"
                        value={orgForm.inviteToken}
                        onChange={(e) => setOrgForm({ ...orgForm, inviteToken: e.target.value })}
                        placeholder="e.g. ORG-INV-A92B3C"
                        required
                      />
                    </label>
                    <small style={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                      {accessType === 'admin'
                        ? 'Requires a pre-issued administrator invitation token from the organization owner.'
                        : 'Single-use cryptographic token issued by your organization administrator. For demo testing, use ORG-INV-DEMO.'}
                    </small>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="srg-btn srg-btn-outline" onClick={() => setCurrentStep(3)}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="srg-btn srg-btn-primary"
                    onClick={() => handleCompleteSetup(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying & Saving...' : (accessType === 'admin' ? 'Launch Command Center →' : 'Join as Staff →')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
