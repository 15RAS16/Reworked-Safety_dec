/**
 * SafeRoute Guardian - Multi-Step Account Onboarding Modal
 * Guides newly registered users through role selection and role-specific setup:
 * 1. Role Selection (Exactly 3 Modes: Tourist, Parent/Guardian, Organization)
 * 2. Role-specific configuration (Tourist profile, Parent dependent linking, Org creation/joining)
 * 3. Firestore persistence & redirect to dashboard.
 */

window.OnboardingModal = function({ user, onCompleteOnboarding }) {
  const [step, setStep] = React.useState(1); // 1: Choose Role, 2: Configure Details, 3: Success
  const [selectedRole, setSelectedRole] = React.useState('tourist'); // 'tourist' | 'parent' | 'organization'
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Tourist Form State
  const [touristForm, setTouristForm] = React.useState({
    displayName: (user && user.displayName) || '',
    emergencyContactName: 'Marcus Vance',
    emergencyContactPhone: '+1 (555) 345-6789',
    emergencyContactRelation: 'Tour Director / Friend'
  });

  // Parent Form State
  const [parentForm, setParentForm] = React.useState({
    dependentName: 'Aarav Sharma',
    dependentRelation: 'Son (15 yrs)',
    schoolOrCenter: 'Oakwood High School',
    linkingCode: 'OAK-7842'
  });

  // Organization Form State
  const [orgTypeChoice, setOrgTypeChoice] = React.useState('create'); // 'create' | 'join'
  const [orgForm, setOrgForm] = React.useState({
    orgName: 'Apex City Safety Network',
    orgType: 'Educational Institution',
    inviteCode: ''
  });

  const roles = [
    {
      id: 'tourist',
      title: 'Tourist',
      icon: '🧳',
      badge: 'Individual Traveler',
      color: '#38BDF8',
      desc: 'Explore unfamiliar destinations with AI safety intelligence, weather warnings, dead-zone maps, community reviews, and SOS panic triggers.',
      access: 'Personal profile, live journey corridor, personal contacts & timeline.'
    },
    {
      id: 'parent',
      title: 'Parent / Guardian',
      icon: '👨‍👩‍👧',
      badge: 'Family Safety',
      color: '#10B981',
      desc: 'Monitor linked children or elderly family members along approved routes with real-time deviation alerts and family check-ins.',
      access: 'Linked dependents dashboard, live route tracking, family contacts & alert feed.'
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: '🏢',
      badge: 'School & Enterprise Ops',
      color: '#F59E0B',
      desc: 'Centralized safety command for tour operators, schools, hospitals, or corporate travel teams with Admin and Staff access tiers.',
      access: 'Multi-traveler monitoring, custom corridor editor, staff roster & CAD gateways.'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmitOnboarding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (selectedRole === 'tourist') {
        await window.FirebaseService.saveUserProfile(user.uid, {
          displayName: touristForm.displayName || user.displayName || 'Tourist Explorer',
          primaryRole: 'tourist',
          orgPermission: 'staff',
          onboardingComplete: true,
          emergencyContact: {
            name: touristForm.emergencyContactName,
            phone: touristForm.emergencyContactPhone,
            relation: touristForm.emergencyContactRelation
          }
        });
      } else if (selectedRole === 'parent') {
        await window.FirebaseService.linkDependent(user.uid, {
          displayName: parentForm.dependentName,
          travelerType: parentForm.dependentRelation,
          school: parentForm.schoolOrCenter,
          linkingCode: parentForm.linkingCode
        });
        await window.FirebaseService.saveUserProfile(user.uid, {
          primaryRole: 'parent',
          orgPermission: 'staff',
          onboardingComplete: true
        });
      } else if (selectedRole === 'organization') {
        if (orgTypeChoice === 'create') {
          await window.FirebaseService.createOrganization({
            name: orgForm.orgName,
            type: orgForm.orgType
          }, user.uid);
        } else {
          await window.FirebaseService.joinOrganizationWithCode(orgForm.inviteCode, user.uid, user.email);
        }
      }

      setStep(3);
      setTimeout(() => {
        onCompleteOnboarding(selectedRole);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Unable to save profile configuration. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="srg-modal-backdrop">
      <div className="srg-onboarding-card">
        {/* Header */}
        <div className="srg-onboarding-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🛡️</span>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#172A46' }}>
                Account Setup & Role Activation
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#60738D' }}>
                Step {step} of 2 — Configure your SafeRoute Guardian workspace
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="srg-onboarding-body">
            <p style={{ fontSize: '0.92rem', color: '#334155', fontWeight: '600', marginBottom: '1rem' }}>
              Choose your primary account workspace mode. You can customize role-specific contacts and permissions in the next step.
            </p>

            <div className="srg-onboarding-roles-grid">
              {roles.map(role => (
                <button
                  key={role.id}
                  type="button"
                  className={`srg-onboarding-role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{ borderColor: selectedRole === role.id ? role.color : '#E2E8F0' }}
                >
                  <div className="srg-onboarding-role-top">
                    <span style={{ fontSize: '2rem' }}>{role.icon}</span>
                    <span className="srg-onboarding-badge" style={{ background: `${role.color}18`, color: role.color }}>
                      {role.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginTop: '0.5rem' }}>
                    {role.title}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.45', margin: '0.4rem 0' }}>
                    {role.desc}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9', fontSize: '0.74rem', color: '#475569' }}>
                    <b>Access:</b> {role.access}
                  </div>
                </button>
              ))}
            </div>

            <div className="srg-onboarding-footer">
              <button
                type="button"
                className="srg-btn srg-btn-primary"
                onClick={handleNext}
                style={{ minWidth: '160px' }}
              >
                Continue Setup →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Role Details Configuration */}
        {step === 2 && (
          <form className="srg-onboarding-body" onSubmit={handleSubmitOnboarding}>
            {selectedRole === 'tourist' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                  🧳 Tourist Safety Profile
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.2rem' }}>
                  Configure your traveler identity and primary emergency contact for SOS broadcasts.
                </p>

                <label>
                  Your Display Name
                  <input
                    type="text"
                    value={touristForm.displayName}
                    onChange={(e) => setTouristForm({ ...touristForm, displayName: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    required
                  />
                </label>

                <label>
                  Emergency Contact Full Name
                  <input
                    type="text"
                    value={touristForm.emergencyContactName}
                    onChange={(e) => setTouristForm({ ...touristForm, emergencyContactName: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    required
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <label>
                    Contact Phone (SMS)
                    <input
                      type="tel"
                      value={touristForm.emergencyContactPhone}
                      onChange={(e) => setTouristForm({ ...touristForm, emergencyContactPhone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </label>
                  <label>
                    Relationship
                    <input
                      type="text"
                      value={touristForm.emergencyContactRelation}
                      onChange={(e) => setTouristForm({ ...touristForm, emergencyContactRelation: e.target.value })}
                      placeholder="e.g. Tour Guide / Family"
                    />
                  </label>
                </div>
              </div>
            )}

            {selectedRole === 'parent' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                  👨‍👩‍👧 Link Your First Dependent
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.2rem' }}>
                  Link a child or family member to begin monitoring approved commute corridors.
                </p>

                <label>
                  Dependent Child / Family Member Name
                  <input
                    type="text"
                    value={parentForm.dependentName}
                    onChange={(e) => setParentForm({ ...parentForm, dependentName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    required
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <label>
                    Relationship
                    <input
                      type="text"
                      value={parentForm.dependentRelation}
                      onChange={(e) => setParentForm({ ...parentForm, dependentRelation: e.target.value })}
                      placeholder="e.g. Son (15 yrs)"
                      required
                    />
                  </label>
                  <label>
                    School / Activity Location
                    <input
                      type="text"
                      value={parentForm.schoolOrCenter}
                      onChange={(e) => setParentForm({ ...parentForm, schoolOrCenter: e.target.value })}
                      placeholder="e.g. Oakwood High"
                    />
                  </label>
                </div>

                <label>
                  Student Linking Code (Optional)
                  <input
                    type="text"
                    value={parentForm.linkingCode}
                    onChange={(e) => setParentForm({ ...parentForm, linkingCode: e.target.value })}
                    placeholder="e.g. OAK-7842"
                  />
                  <small style={{ color: '#64748B', fontSize: '0.74rem' }}>Provided by school safety administrator or child's mobile app.</small>
                </label>
              </div>
            )}

            {selectedRole === 'organization' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                  🏢 Organization Workspace Setup
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1rem' }}>
                  Create a new organization command center or join an existing organization with an invitation code.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`srg-btn srg-btn-sm ${orgTypeChoice === 'create' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                    onClick={() => setOrgTypeChoice('create')}
                  >
                    👑 Create Organization (Admin)
                  </button>
                  <button
                    type="button"
                    className={`srg-btn srg-btn-sm ${orgTypeChoice === 'join' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                    onClick={() => setOrgTypeChoice('join')}
                  >
                    🔑 Join with Invite Code
                  </button>
                </div>

                {orgTypeChoice === 'create' ? (
                  <div>
                    <label>
                      Organization Name
                      <input
                        type="text"
                        value={orgForm.orgName}
                        onChange={(e) => setOrgForm({ ...orgForm, orgName: e.target.value })}
                        placeholder="e.g. Apex Travel Ops & Tours"
                        required
                      />
                    </label>

                    <label>
                      Organization Type
                      <select
                        value={orgForm.orgType}
                        onChange={(e) => setOrgForm({ ...orgForm, orgType: e.target.value })}
                      >
                        <option value="Educational Institution">Educational Institution / School</option>
                        <option value="Tour & Travel Agency">Tour & Travel Operator</option>
                        <option value="Healthcare & Hospital">Healthcare & Hospital System</option>
                        <option value="Corporate Enterprise">Corporate Enterprise / Field Ops</option>
                      </select>
                    </label>
                    <p style={{ fontSize: '0.76rem', color: '#16A34A', fontWeight: '600' }}>
                      ✓ As the creator, your account will be designated as <b>Organization Administrator</b>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label>
                      Organization Invite Code
                      <input
                        type="text"
                        value={orgForm.inviteCode}
                        onChange={(e) => setOrgForm({ ...orgForm, inviteCode: e.target.value })}
                        placeholder="e.g. ORG-982145 or ADMIN-773"
                        required
                      />
                      <small style={{ color: '#64748B', fontSize: '0.74rem' }}>Enter the invite code issued by your organization safety lead.</small>
                    </label>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="srg-login-error" style={{ marginTop: '1rem' }} role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="srg-onboarding-footer" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="srg-btn srg-btn-outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="srg-btn srg-btn-primary"
                disabled={loading}
                style={{ minWidth: '180px' }}
              >
                {loading ? 'Activating Profile...' : 'Complete & Launch →'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="srg-onboarding-body" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#172A46' }}>
              Welcome to SafeRoute Guardian!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.4rem' }}>
              Your <b>{selectedRole.toUpperCase()}</b> workspace has been configured securely. Redirecting you to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
