/**
 * SafeRoute Guardian - Friendly Access Denied Component
 * Displayed when an authenticated user attempts to access an unauthorized tool or dashboard.
 */

window.AccessDenied = function({ currentRole, requiredRole, onReturnHome }) {
  return (
    <div className="srg-access-denied-container">
      <div className="srg-access-denied-card">
        <div className="srg-access-denied-icon">🔒</div>
        
        <div className="srg-access-denied-badge">
          PERMISSION RESTRICTED
        </div>

        <h1 className="srg-access-denied-title">
          Access Restricted
        </h1>

        <p className="srg-access-denied-desc">
          You are currently logged in with the <b>{currentRole ? currentRole.toUpperCase() : 'USER'}</b> role.
          This safety workspace or administrative tool requires <b>{requiredRole || 'different permissions'}</b>.
        </p>

        <div className="srg-access-denied-details">
          <div className="srg-access-denied-row">
            <span>Your Active Mode:</span>
            <b>{currentRole === 'organization' ? 'Organization' : currentRole === 'parent' ? 'Parent / Guardian' : 'Tourist'}</b>
          </div>
          <div className="srg-access-denied-row">
            <span>Data Security Policy:</span>
            <span style={{ color: '#10B981' }}>Role-Based Access Control Active</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="srg-btn srg-btn-primary"
            onClick={onReturnHome}
          >
            ← Return to My Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
