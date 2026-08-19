/**
 * SafeRoute Guardian - Access Denied & Role Guard Block Screen
 * Informative, user-friendly security barrier rendered when a user attempts
 * to access a workspace or tool outside their authorized permissions.
 */

window.AccessDenied = function({
  currentRole = 'tourist',
  orgPermission = 'staff',
  attemptedTool = '',
  onReturnToAllowedWorkspace
}) {
  const roleName = currentRole === 'tourist'
    ? 'Tourist (Personal Safety)'
    : currentRole === 'parent'
      ? 'Parent / Family Guardian'
      : `Organization (${orgPermission === 'admin' ? 'Administrator' : 'Staff'})`;

  return (
    <div className="srg-access-denied-view">
      <div className="srg-access-denied-card">
        <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF', marginBottom: '0.4rem' }}>
          Access Restricted by Policy
        </h2>
        <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: '1.5', marginBottom: '1.2rem' }}>
          Your authenticated account is registered under <b>{roleName}</b>. The requested tool (<code>{attemptedTool}</code>) requires additional organizational permissions.
        </p>

        <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.78rem', color: '#CBD5E1' }}>
          <div>🛡️ <b>Security Enforcement:</b> Zero frontend privilege escalation.</div>
          <div style={{ marginTop: '0.3rem' }}>
            Permissions are governed strictly by Firestore Security Rules and custom claims.
          </div>
        </div>

        <button
          type="button"
          className="srg-btn srg-btn-primary"
          onClick={onReturnToAllowedWorkspace}
          style={{ width: '100%' }}
        >
          ← Return to My Permitted Workspace
        </button>
      </div>
    </div>
  );
};
