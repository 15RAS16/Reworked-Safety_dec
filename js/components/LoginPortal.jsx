/**
 * SafeRoute Guardian - Minimal Instagram-Style Authentication Portal
 * Clean, distraction-free authentication interface:
 * - SafeRoute Guardian brand header
 * - Email / Password input with inline validation and show/hide toggle
 * - Sign In / Create Account seamless tab toggle
 * - Forgot Password dispatch modal
 * - Email-only authentication (Google OAuth not available in competition demo)
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
