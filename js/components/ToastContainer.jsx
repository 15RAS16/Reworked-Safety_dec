/**
 * SafeRoute Guardian - Toast Notification Stack Component
 */

window.ToastContainer = function({ toasts = [], onDismissToast = () => {} }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="srg-toast-stack">
      {toasts.map(toast => {
        const isEmergency = toast.type === 'emergency';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        let borderColor = 'var(--border-subtle)';
        let icon = 'ℹ️';
        if (isEmergency) {
          borderColor = '#EF4444';
          icon = '🚨';
        } else if (isWarning) {
          borderColor = '#F59E0B';
          icon = '⚠️';
        } else if (isSuccess) {
          borderColor = '#10B981';
          icon = '✅';
        }

        return (
          <div 
            key={toast.id}
            className="srg-toast"
            style={{ borderLeft: `4px solid ${borderColor}` }}
          >
            <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.85rem' }}>{toast.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '2px' }}>{toast.message}</div>
            </div>
            <button 
              type="button"
              onClick={() => onDismissToast && onDismissToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0 4px'
              }}
              aria-label="Dismiss toast notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};
