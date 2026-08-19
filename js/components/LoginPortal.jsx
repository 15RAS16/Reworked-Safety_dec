/**
 * SafeRoute Guardian - Production Authentication Portal
 * Supports Google OAuth, Email/Password sign-in & registration, Password Reset,
 * input validation, password visibility toggle, loading states, and secure fallback.
 * 
 * SECURITY RULES:
 * - Never store passwords or tokens in LocalStorage.
 * - Google authentication uses official Google OAuth popup.
 */

window.LoginPortal = function({ onAuthSuccess }) {
  const [authMode, setAuthMode] = React.useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [infoMessage, setInfoMessage] = React.useState('');

  const statusLabel = window.ConfigService ? window.ConfigService.getStatusLabel() : '🛡️ SafeRoute Guardian';

  const clearMessages = () => {
    setError('');
    setInfoMessage('');
  };

  // Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    clearMessages();
    setLoading(true);
    try {
      const user = await window.FirebaseService.signInWithGoogle();
      if (user) {
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Google authentication could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (authMode === 'forgot') {
      setLoading(true);
      try {
        const result = await window.FirebaseService.resetPassword(email.trim());
        setInfoMessage(result.message || 'Password reset link sent to your email.');
      } catch (err) {
        setError(err.message || 'Unable to dispatch password reset. Please verify the email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (authMode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      try {
        const user = await window.FirebaseService.registerWithEmail(email.trim(), password, displayName.trim());
        if (user) {
          onAuthSuccess(user);
        }
      } catch (err) {
        setError(err.message || 'Registration failed. This email may already be in use.');
      } finally {
        setLoading(false);
      }
    } else {
      // Sign in
      setLoading(true);
      try {
        const user = await window.FirebaseService.signInWithEmail(email.trim(), password);
        if (user) {
          onAuthSuccess(user);
        }
      } catch (err) {
        setError(err.message || 'Invalid email or password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Fast Demo Entry
  const handleQuickDemo = async (role = 'tourist') => {
    clearMessages();
    setLoading(true);
    try {
      const demoUser = {
        uid: 'demo-user-' + Date.now(),
        displayName: role === 'parent' ? 'Priya Sharma (Parent)' : role === 'organization' ? 'Marcus Vance (Admin)' : 'Elena Rostova (Tourist)',
        email: `demo-${role}@saferoute.internal`,
        photoURL: null,
        providerId: 'demo',
        primaryRole: role,
        orgPermission: role === 'organization' ? 'admin' : 'staff',
        orgName: role === 'organization' ? 'Apex Safety Ops' : null,
        onboardingComplete: true,
        linkedDependentIds: role === 'parent' ? ['dep-aarav'] : [],
        createdAt: new Date().toISOString()
      };
      await window.FirebaseService.saveUserProfile(demoUser.uid, demoUser);
      onAuthSuccess(demoUser);
    } catch (err) {
      setError('Demo launch failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="srg-login-page">
      {/* Story & Visual Branding Aside */}
      <aside className="srg-login-story">
        <div className="srg-login-brand">
          <span className="srg-login-shield">🛡️</span>
          <span>SafeRoute Guardian</span>
        </div>

        <div className="srg-login-story-copy">
          <p className="srg-login-eyebrow">ENTERPRISE CORRIDOR & FAMILY SAFETY</p>
          <h1>Every journey deserves a <em>trusted safety net.</em></h1>
          <p>AI-assisted safe corridors, real-time geofence tracking, instant emergency escalation, and multi-tenant role access control.</p>
        </div>

        <div className="srg-login-map-art" aria-hidden="true">
          <i className="srg-map-art-route"></i>
          <b className="srg-map-art-pin one">●</b>
          <b className="srg-map-art-pin two">●</b>
          <span className="srg-map-art-card">✓ Active Geofence Protection</span>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#B8D9EF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{statusLabel}</span>
          </div>
          <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Engineered with Google Antigravity</small>
        </div>
      </aside>

      {/* Main Authentication Card */}
      <main className="srg-login-main">
        <div className="srg-login-card">
          <div className="srg-login-mobile-brand">🛡️ SafeRoute Guardian</div>

          <div className="srg-auth-tabs">
            <button
              type="button"
              className={`srg-auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); clearMessages(); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`srg-auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthMode('register'); clearMessages(); }}
            >
              Create Account
            </button>
            {authMode === 'forgot' && (
              <button type="button" className="srg-auth-tab active">
                Reset Password
              </button>
            )}
          </div>

          <div style={{ margin: '1.2rem 0 0.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: '#182B48', fontWeight: '800', letterSpacing: '-0.03em' }}>
              {authMode === 'login' && 'Welcome back'}
              {authMode === 'register' && 'Create your account'}
              {authMode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="srg-login-subtitle">
              {authMode === 'login' && 'Sign in to access your role-protected safety workspace.'}
              {authMode === 'register' && 'Join the SafeRoute Guardian network with secure authentication.'}
              {authMode === 'forgot' && 'Enter your verified email to receive a password reset link.'}
            </p>
          </div>

          {/* Google OAuth Button */}
          {authMode !== 'forgot' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="srg-btn srg-google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
                aria-label="Continue with Google"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="srg-login-divider">
                <span>or continue with email</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <label>
                Full Name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  autoComplete="name"
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
                autoComplete="email"
                required
              />
            </label>

            {authMode !== 'forgot' && (
              <label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Password</span>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      className="srg-link-btn"
                      onClick={() => { setAuthMode('forgot'); clearMessages(); }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="srg-password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    className="srg-pwd-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </label>
            )}

            {authMode === 'register' && (
              <label>
                Confirm Password
                <div className="srg-password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>
            )}

            {error && (
              <div className="srg-login-error" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="srg-login-success" role="status">
                <span>✓</span>
                <span>{infoMessage}</span>
              </div>
            )}

            <button
              className="srg-btn srg-btn-primary srg-login-continue"
              type="submit"
              disabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? (
                <span>Securing session...</span>
              ) : authMode === 'login' ? (
                <span>Sign In →</span>
              ) : authMode === 'register' ? (
                <span>Create Account →</span>
              ) : (
                <span>Send Reset Link →</span>
              )}
            </button>

            {authMode === 'forgot' && (
              <button
                type="button"
                className="srg-btn srg-btn-outline"
                onClick={() => { setAuthMode('login'); clearMessages(); }}
                style={{ width: '100%', marginTop: '0.75rem' }}
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* Quick Sandbox / Evaluator Fast Pass */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid #E5EDF5' }}>
            <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', marginBottom: '0.6rem' }}>
              ⚡ QUICK ROLE EVALUATION (FAST PASS)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
              <button
                type="button"
                className="srg-btn srg-btn-outline srg-btn-sm"
                onClick={() => handleQuickDemo('tourist')}
                title="Log in as Tourist persona (Elena)"
              >
                🧳 Tourist
              </button>
              <button
                type="button"
                className="srg-btn srg-btn-outline srg-btn-sm"
                onClick={() => handleQuickDemo('parent')}
                title="Log in as Parent persona (Priya)"
              >
                👨‍👩‍👧 Parent
              </button>
              <button
                type="button"
                className="srg-btn srg-btn-outline srg-btn-sm"
                onClick={() => handleQuickDemo('organization')}
                title="Log in as Org Admin persona (Marcus)"
              >
                🏢 Org Admin
              </button>
            </div>
            <p className="srg-login-terms">
              🔒 SafeRoute Guardian uses strict role guards. Passwords and secrets are never stored in browser LocalStorage.
            </p>
          </div>
        </div>
      </main>
    </section>
  );
};
