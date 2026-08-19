window.LoginPortal = function({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const submit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Enter your email or phone number and password to continue.'); return; }
    onLogin(email.trim().includes('@') ? email.trim().split('@')[0] : email.trim());
  };
  return <section className="srg-login-page">
    <aside className="srg-login-story"><div className="srg-login-brand"><span className="srg-login-shield">🛡️</span><span>SafeRoute Guardian</span></div><div className="srg-login-story-copy"><p className="srg-login-eyebrow">TRAVEL WITH A SAFETY NET</p><h1>Every journey deserves a <em>trusted route.</em></h1><p>Route intelligence, check-ins, and one clear place to act when help is needed.</p></div><div className="srg-login-map-art" aria-hidden="true"><i className="srg-map-art-route"></i><b className="srg-map-art-pin one">●</b><b className="srg-map-art-pin two">●</b><span className="srg-map-art-card">✓ Protected corridor active</span></div><small>Built with Google Antigravity</small></aside>
    <main className="srg-login-main"><form className="srg-login-card" onSubmit={submit}><div className="srg-login-mobile-brand">🛡️ SafeRoute Guardian</div><p className="srg-login-eyebrow">WELCOME BACK</p><h2>Sign in to your safety workspace</h2><p className="srg-login-subtitle">Use your account or explore the complete demo experience.</p><label>Email or phone<input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" /></label><label>Password<input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type="password" autoComplete="current-password" /></label>{error && <p className="srg-login-error">{error}</p>}<button className="srg-btn srg-btn-primary srg-login-continue" type="submit">Continue →</button><div className="srg-login-divider"><span>or</span></div><button type="button" className="srg-btn srg-btn-outline srg-login-demo" onClick={() => onLogin('Demo User')}>✨ Continue with demo account</button><p className="srg-login-terms">Demo mode uses simulated alerts and emergency dispatches only.</p></form></main>
  </section>;
};
