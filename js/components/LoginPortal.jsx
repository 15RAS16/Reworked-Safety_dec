/**
 * SafeRoute Guardian - Minimal Instagram-Style Authentication Portal
 * Clean, distraction-free authentication interface:
 * - SafeRoute Guardian brand header
 * - Email / Password input with inline validation and show/hide toggle
 * - Sign In / Create Account seamless tab toggle
 * - Forgot Password dispatch modal
 * - Optional Google OAuth sign-in button
 * - Zero pre-login demo personas, role pickers, or platform telemetry exposure
 */

window.LoginPortal = function({ onLoginSuccess }) {
  const [activeMode, setActiveMode] = React.useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [infoMessage, setInfoMessage] = React.useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      if (window.FirebaseService) {
        const user = await window.FirebaseService.signInWithGoogle();
        if (user && onLoginSuccess) {
          onLoginSuccess(user);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (activeMode !== 'forgot' && !password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      if (activeMode === 'login') {
        const user = await window.FirebaseService.signInWithEmail(email.trim(), password);
        if (user && onLoginSuccess) {
          onLoginSuccess(user);
        }
      } else if (activeMode === 'register') {
        const user = await window.FirebaseService.registerWithEmail(email.trim(), password, displayName.trim());
        if (user && onLoginSuccess) {
          onLoginSuccess(user);
        }
      } else if (activeMode === 'forgot') {
        const res = await window.FirebaseService.resetPassword(email.trim());
        setInfoMessage(res.message || 'Password reset link has been sent to your email.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="srg-insta-auth-page">
      <div className="srg-insta-auth-container">
        {/* Main Minimalist Auth Card */}
        <div className="srg-insta-card">
          {/* Brand Identity */}
          <div className="srg-insta-brand">
            <div className="srg-insta-logo-wrap">
              <span className="srg-insta-logo-icon">🛡️</span>
            </div>
            <h1 className="srg-insta-title">SafeRoute Guardian</h1>
            <p className="srg-insta-subtitle">AI Corridor & Campus Safety Platform</p>
          </div>

          {/* Inline Alert Messages */}
          {errorMessage && (
            <div className="srg-insta-alert srg-insta-alert-error" role="alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="srg-insta-alert srg-insta-alert-success" role="status">
              <span>✓</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="srg-insta-form" noValidate>
            {activeMode === 'register' && (
              <div className="srg-insta-input-group">
                <input
                  type="text"
                  id="srg-name-input"
                  className="srg-insta-input"
                  placeholder="Full Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="srg-insta-input-group">
              <input
                type="email"
                id="srg-email-input"
                className="srg-insta-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            {activeMode !== 'forgot' && (
              <div className="srg-insta-input-group srg-insta-pw-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="srg-pw-input"
                  className="srg-insta-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    className="srg-insta-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              className="srg-insta-submit-btn"
              disabled={isLoading || !email || (activeMode !== 'forgot' && !password)}
            >
              {isLoading ? (
                <span className="srg-insta-spinner" />
              ) : activeMode === 'login' ? (
                'Sign In'
              ) : activeMode === 'register' ? (
                'Create Account'
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Google OAuth & Divider */}
            {activeMode !== 'forgot' && (
              <>
                <div className="srg-insta-divider">
                  <span className="srg-insta-divider-line" />
                  <span className="srg-insta-divider-text">OR</span>
                  <span className="srg-insta-divider-line" />
                </div>

                <button
                  type="button"
                  className="srg-insta-google-btn"
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
              </>
            )}

            {/* Forgot Password Link */}
            {activeMode === 'login' && (
              <div className="srg-insta-forgot-wrap">
                <button
                  type="button"
                  className="srg-insta-link-btn"
                  onClick={() => {
                    setActiveMode('forgot');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {activeMode === 'forgot' && (
              <div className="srg-insta-forgot-wrap">
                <button
                  type="button"
                  className="srg-insta-link-btn"
                  onClick={() => {
                    setActiveMode('login');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Secondary Switcher Card (Instagram-style) */}
        <div className="srg-insta-switch-card">
          {activeMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="srg-insta-switch-btn"
                onClick={() => {
                  setActiveMode('register');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Have an account?{' '}
              <button
                type="button"
                className="srg-insta-switch-btn"
                onClick={() => {
                  setActiveMode('login');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
              >
                Log in
              </button>
            </p>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="srg-insta-footer">
          <span>SafeRoute Guardian Security • MMU Mullana Campus Safety</span>
        </div>
      </div>
    </div>
  );
};
