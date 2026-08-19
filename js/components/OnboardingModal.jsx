/**
 * SafeRoute Guardian - First-Time User Onboarding Modal
 * Guides new users through 3-mode selection and role-specific safety configuration.
 */

window.OnboardingModal = function({ currentUser, onCompleteOnboarding }) {
  const [step, setStep] = React.useState(1); // 1: Role, 2: Setup, 3: Finish
  const [selectedRole, setSelectedRole] = React.useState('tourist');
  const [orgMode, setOrgMode] = React.useState('create'); // 'create' | 'join'
  const [orgName, setOrgName] = React.useState('');
  const [orgType, setOrgType] = React.useState('Educational Institution');
  const [inviteToken, setInviteToken] = React.useState('');
  const [emergencyContact, setEmergencyContact] = React.useState({ name: '', phone: '', relation: 'Primary Contact' });
  const [dependentInfo, setDependentInfo] = React.useState({ name: '', relation: 'Son / Daughter', school: 'Oakwood High School' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleFinish = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (selectedRole === 'tourist') {
        await window.FirebaseService.saveUserProfile(currentUser.uid, {
          primaryRole: 'tourist',
          allowedModes: ['tourist'],
          orgPermission: 'staff',
          emergencyContact: emergencyContact,
          onboardingComplete: true
        });
        onCompleteOnboarding('tourist', 'staff');
      } else if (selectedRole === 'parent') {
        await window.FirebaseService.approveDependentLink(currentUser.uid, dependentInfo);
        onCompleteOnboarding('parent', 'staff');
      } else if (selectedRole === 'organization') {
        if (orgMode === 'create') {
          await window.FirebaseService.createOrganization({ name: orgName || 'Safety Operations Fleet', type: orgType }, currentUser.uid);
          onCompleteOnboarding('organization', 'admin');
        } else {
          const joined = await window.FirebaseService.joinOrganizationWithToken(inviteToken, currentUser.uid, currentUser.email);
          onCompleteOnboarding('organization', joined.role || 'staff');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Setup could not be completed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="srg-modal-backdrop">
      <div className="srg-modal-card" style={{ maxWidth: '580px' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🛡️</span>
            <b style={{ color: '#172A46', fontSize: '1.05rem' }}>Welcome to SafeRoute Guardian</b>
          </div>
          <span style={{ fontSize: '0.74rem', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#64748B', fontWeight: '800' }}>
            Step {step} of 2
          </span>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Step 1: Select Workspace Mode */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#172A46', marginBottom: '0.3rem' }}>
              How will you use SafeRoute Guardian?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.2rem' }}>
              Choose your primary workspace mode. You will be guided through initial setup.
            </p>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { id: 'tourist', title: 'Tourist & Solo Traveler', icon: '🧳', desc: 'Explore safely, compare route safety scores, SOS panic button, and dead-zone beacon.' },
                { id: 'parent', title: 'Parent / Family Guardian', icon: '👨‍👩‍👧', desc: 'Monitor linked dependents, school corridor deviation alerts, and family emergency contacts.' },
                { id: 'organization', title: 'School / Enterprise Organization', icon: '🏢', desc: 'Manage fleets, custom corridors, escalation timeouts, and staff assignments.' }
              ].map(opt => (
                <div
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.9rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${selectedRole === opt.id ? '#2563EB' : '#E2E8F0'}`,
                    background: selectedRole === opt.id ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedRole(opt.id)}
                >
                  <span style={{ fontSize: '1.8rem' }}>{opt.icon}</span>
                  <div>
                    <b style={{ color: '#172A46', fontSize: '0.92rem' }}>{opt.title}</b>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="srg-btn srg-btn-primary" onClick={() => setStep(2)}>
                Continue to Setup →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Role-Specific Configuration */}
        {step === 2 && (
          <div>
            {selectedRole === 'tourist' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#172A46', marginBottom: '0.3rem' }}>
                  Tourist Profile Setup
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.2rem' }}>
                  Configure your emergency contact for automated SOS dispatch.
                </p>

                <label>
                  Emergency Contact Name
                  <input
                    type="text"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                    placeholder="e.g. Maya Chen"
                    required
                  />
                </label>
                <label>
                  Emergency Phone Number (SMS)
                  <input
                    type="tel"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                    placeholder="+1 (555) 019-2831"
                    required
                  />
                </label>
              </div>
            )}

            {selectedRole === 'parent' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#172A46', marginBottom: '0.3rem' }}>
                  Link Family Dependent
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.2rem' }}>
                  Enter your dependent's details to initialize real-time corridor monitoring.
                </p>

                <label>
                  Dependent's Name
                  <input
                    type="text"
                    value={dependentInfo.name}
                    onChange={(e) => setDependentInfo({ ...dependentInfo, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    required
                  />
                </label>
                <label>
                  Relationship
                  <input
                    type="text"
                    value={dependentInfo.relation}
                    onChange={(e) => setDependentInfo({ ...dependentInfo, relation: e.target.value })}
                    placeholder="e.g. Son (15 yrs)"
                  />
                </label>
                <label>
                  School / Activity Destination
                  <input
                    type="text"
                    value={dependentInfo.school}
                    onChange={(e) => setDependentInfo({ ...dependentInfo, school: e.target.value })}
                    placeholder="e.g. Oakwood High School"
                  />
                </label>
              </div>
            )}

            {selectedRole === 'organization' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#172A46', marginBottom: '0.3rem' }}>
                  Organization Setup
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.2rem' }}>
                  Create a new organization workspace or join with an administrator invitation token.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  <button
                    type="button"
                    className={`srg-btn srg-btn-sm ${orgMode === 'create' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                    style={{ flex: 1 }}
                    onClick={() => setOrgMode('create')}
                  >
                    + Create Organization (Admin)
                  </button>
                  <button
                    type="button"
                    className={`srg-btn srg-btn-sm ${orgMode === 'join' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                    style={{ flex: 1 }}
                    onClick={() => setOrgMode('join')}
                  >
                    Enter Invite Token (Staff/Admin)
                  </button>
                </div>

                {orgMode === 'create' ? (
                  <>
                    <label>
                      Organization / School Name
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Apex Global Safety Operations"
                        required
                      />
                    </label>
                    <label>
                      Organization Type
                      <select value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                        <option value="Educational Institution">Educational Institution / School</option>
                        <option value="Tour Operator">Tour & Travel Operator</option>
                        <option value="Corporate Enterprise">Corporate Enterprise / Night Shifts</option>
                      </select>
                    </label>
                  </>
                ) : (
                  <label>
                    Single-Use Invitation Token
                    <input
                      type="text"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      placeholder="e.g. ORG-INV-A92B3C"
                      required
                    />
                  </label>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button type="button" className="srg-btn srg-btn-outline" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                type="button"
                className="srg-btn srg-btn-primary"
                onClick={handleFinish}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Profile...' : 'Complete Onboarding →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
