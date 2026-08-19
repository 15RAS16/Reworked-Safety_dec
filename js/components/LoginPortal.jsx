/**
 * SafeRoute Guardian - Secure Authentication Portal
 * Split-panel layout with Google OAuth popup, Email/Password login/registration,
 * password reset dispatch, password visibility toggle, and permanent simulation banner.
 */

window.LoginPortal = function({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = React.useState('login'); // 'login' | 'register' | 'reset'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [infoMessage, setInfoMessage] = React.useState('');

  const isDemoActive = window.ConfigService && window.ConfigService.isDemoModeEnabled();
  const isSetupRequired = window.ConfigService && window.ConfigService.isSetupRequired();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      const user = await window.FirebaseService.signInWithGoogle();
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      if (activeTab === 'login') {
        const user = await window.FirebaseService.signInWithEmail(email, password);
        if (user) onLoginSuccess(user);
      } else if (activeTab === 'register') {
        const user = await window.FirebaseService.registerWithEmail(email, password, displayName);
        if (user) {
          setInfoMessage('Account created! A verification link has been dispatched to your email.');
          onLoginSuccess(user);
        }
      } else if (activeTab === 'reset') {
        const res = await window.FirebaseService.resetPassword(email);
        setInfoMessage(res.message);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Fast-Pass Personas (Available strictly in isolated Demo Mode)
  const handleQuickDemoPersona = async (roleType, orgPerm = 'staff', isNewUser = false) => {
    setIsLoading(true);
    const demoUser = {
      uid: `demo-${roleType}-${Date.now()}`,
      displayName: isNewUser
        ? 'New Demo User'
        : (roleType === 'tourist' ? 'Elena Rostova (Tourist)' : roleType === 'parent' ? 'Priya Sharma (Parent)' : (orgPerm === 'admin' ? 'Marcus Vance (Org Lead)' : 'Sarah Jenkins (Org Staff)')),
      email: `${roleType}@saferoute.demo`,
      emailVerified: true,
      primaryRole: roleType,
      accessType: isNewUser ? null : (roleType === 'organization' ? (orgPerm === 'admin' ? 'admin' : 'staff') : 'self'),
      allowedModes: isNewUser ? [] : [roleType],
      orgPermission: orgPerm,
      organizationId: roleType === 'organization' ? 'demo-org-1' : null,
      organizationIds: roleType === 'organization' ? ['demo-org-1'] : [],
      orgName: roleType === 'organization' ? 'Apex Safety Institute' : null,
      onboardingComplete: !isNewUser,
      isDemoUser: true
    };
    await window.FirebaseService.saveUserProfile(demoUser.uid, demoUser);
    onLoginSuccess(demoUser);
    setIsLoading(false);
  };

  if (isSetupRequired) {
    return (
      <div className="srg-auth-page">
        <div className="srg-auth-card" style={{ maxWidth: '560px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Firebase Setup Required
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            SafeRoute Guardian requires Firebase client credentials or active Demo Mode. Please copy <code>.env.example</code> to <code>.env.local</code> with your Firebase project keys, or set <code>VITE_ENABLE_DEMO_MODE=true</code>.
          </p>
          <a
            href="FIREBASE_SETUP.md"
            target="_blank"
            className="srg-btn srg-btn-primary"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            View Firebase Setup Guide →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="srg-auth-page">
      <div className="srg-auth-container">
        {/* Left Side: Brand Value Proposition Panel */}
        <div className="srg-auth-brand-panel">
          <div className="srg-auth-brand-header">
            <span style={{ fontSize: '2.4rem' }}>🛡️</span>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                SafeRoute Guardian
              </h1>
              <span style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: '700' }}>
                AI CORRIDOR & GEOFENCE SAFETY PLATFORM
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: '1.6', margin: '1.5rem 0' }}>
            Deterministic 6-signal safety risk scoring, real-time geofence tracking, tourist intelligence, and emergency escalation for solo travelers, families, and enterprise fleets.
          </p>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.82rem', color: '#94A3B8' }}>
              <span style={{ color: '#10B981', fontWeight: '800' }}>✓</span>
              <span>Explainable AI Risk Engine (0-100 deterministic scoring)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.82rem', color: '#94A3B8' }}>
              <span style={{ color: '#10B981', fontWeight: '800' }}>✓</span>
              <span>Point-to-Polyline-Segment geofencing with zero false alerts</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.82rem', color: '#10B981' }}>
              <span style={{ color: '#10B981', fontWeight: '800' }}>✓</span>
              <span>Role-Based Access Control: Tourist, Parent, Organization</span>
            </div>
          </div>

          {/* Antigravity Attribution */}
          <div style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.74rem', color: '#64748B' }}>
            Built with Google Antigravity • Dual-Tone Siren Synthesizer
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="srg-auth-card">
          {/* Permanent Simulation Banner */}
          {isDemoActive && (
            <div className="srg-sim-banner">
              ⚡ <b>Simulated Demo Mode Active</b> — No real emergency dispatch
            </div>
          )}

          {/* Auth Tab Navigation */}
          <div className="srg-auth-tabs">
            <button
              type="button"
              className={`srg-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setErrorMessage(''); setInfoMessage(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`srg-auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setErrorMessage(''); setInfoMessage(''); }}
            >
              Register
            </button>
            <button
              type="button"
              className={`srg-auth-tab ${activeTab === 'reset' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reset'); setErrorMessage(''); setInfoMessage(''); }}
            >
              Reset
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="srg-auth-error">
              ⚠️ {errorMessage}
            </div>
          )}
          {infoMessage && (
            <div className="srg-auth-info">
              ✓ {infoMessage}
            </div>
          )}

          {/* Google OAuth Button */}
          {activeTab !== 'reset' && (
            <>
              <button
                type="button"
                className="srg-google-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="srg-auth-divider">
                <span>or use email & password</span>
              </div>
            </>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth}>
            {activeTab === 'register' && (
              <label>
                Full Name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  required
                />
              </label>
            )}

            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>

            {activeTab !== 'reset' && (
              <label>
                Password
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="srg-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </label>
            )}

            <button
              type="submit"
              className="srg-btn srg-btn-primary"
              style={{ width: '100%', marginTop: '0.8rem' }}
              disabled={isLoading}
            >
              {isLoading
                ? 'Authenticating...'
                : activeTab === 'login'
                  ? 'Sign In to SafeRoute'
                  : activeTab === 'register'
                    ? 'Create Secure Account'
                    : 'Send Password Reset Link'}
            </button>
          </form>

          {/* Isolated Demo Quick Persona Selectors */}
          {isDemoActive && (
            <div style={{ marginTop: '1.4rem', paddingTop: '1rem', borderTop: '1px solid #1E293B' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '800', display: 'block', marginBottom: '0.5rem', textAlign: 'center' }}>
                QUICK EVALUATION DEMO PERSONAS:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <button
                  type="button"
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}
                  onClick={() => handleQuickDemoPersona('tourist')}
                >
                  🧳 Tourist (Returning)
                </button>
                <button
                  type="button"
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}
                  onClick={() => handleQuickDemoPersona('parent')}
                >
                  👨‍👩‍👧 Parent (Returning)
                </button>
                <button
                  type="button"
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}
                  onClick={() => handleQuickDemoPersona('organization', 'admin')}
                >
                  🏢 Org Admin (Returning)
                </button>
                <button
                  type="button"
                  className="srg-btn srg-btn-outline srg-btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.4rem 0.2rem' }}
                  onClick={() => handleQuickDemoPersona('organization', 'staff')}
                >
                  🛡️ Org Staff (Returning)
                </button>
              </div>
              <button
                type="button"
                className="srg-btn srg-btn-sm"
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.45rem', background: '#38BDF820', color: '#38BDF8', border: '1px dashed #38BDF8' }}
                onClick={() => handleQuickDemoPersona('tourist', 'staff', true)}
              >
                ✨ Test First-Time Onboarding Flow (New User)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
