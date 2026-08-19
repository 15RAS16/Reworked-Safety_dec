/**
 * SafeRoute Guardian - Role Selection & Workspace Switcher
 * Presents exactly 3 top-level modes: Tourist, Parent/Guardian, and Organization.
 * Displays scenario presets and permission tier breakdowns.
 */

window.LandingSection = function({
  onSelectRole,
  activeRole = 'tourist',
  orgPermission = 'admin',
  onSelectOrgPermission,
  allowedModes = ['tourist', 'parent', 'organization'],
  scenarios = [],
  activeScenario,
  onSelectScenario
}) {
  const roles = [
    {
      id: 'tourist',
      title: 'Tourist & Solo Traveler',
      icon: '🧳',
      badge: 'Personal Safety',
      color: '#38BDF8',
      desc: 'AI safety scores, fastest vs safer route comparison, live weather warnings, cellular dead-zone intelligence, community reviews, and safe havens.',
      features: [
        'Explore Safely AI Intelligence',
        'Fastest vs Safer Route Comparison',
        'Personal GPS Corridor Tracking',
        '3s SOS & 3-Shake Gesture Panic',
        'Safe Beacon Offline Mode',
        'Local Help Network Requests'
      ]
    },
    {
      id: 'parent',
      title: 'Parent / Family Guardian',
      icon: '👨‍👩‍👧',
      badge: 'Family Safety',
      color: '#10B981',
      desc: 'Monitor verified linked children and family dependents with real-time route corridors, deviation alerts, battery telemetry, and safe beacon updates.',
      features: [
        'Linked Dependents Live Monitor',
        'Consent-Based Family Linking',
        'School Corridor Deviation Feeds',
        'Last Safe Beacon Tracking',
        'Family Emergency Directory',
        'Chronological Incident History'
      ]
    },
    {
      id: 'organization',
      title: 'School / Enterprise Organization',
      icon: '🏢',
      badge: 'Enterprise Command',
      color: '#F59E0B',
      desc: 'Operational safety center for schools, tour operators, and enterprises. Includes Staff operational monitoring and Administrator command tools.',
      features: [
        'Organization Command Center',
        'Staff Roster & Member Management',
        'Custom Route & Corridor Width Editor',
        'Escalation Timeout Thresholds',
        'Explainable AI Risk Telemetry',
        'Emergency Simulation Suite (Demo)'
      ]
    }
  ];

  return (
    <div className="srg-landing-view">
      {/* Hero Welcome Banner */}
      <div className="srg-landing-hero">
        <div style={{ fontSize: '0.76rem', color: '#38BDF8', fontWeight: '800', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
          AUTHORIZED SAFETY WORKSPACES
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.6rem 0' }}>
          Select Safety Workspace Mode
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#94A3B8', maxWidth: '650px', margin: '0 auto' }}>
          Switch between your authorized workspaces. Permissions are governed strictly by your verified profile.
        </p>
      </div>

      {/* 3 Main Role Cards Grid */}
      <div className="srg-roles-grid">
        {roles.map((r) => {
          const isSelected = activeRole === r.id;
          const isAllowed = allowedModes && allowedModes.length > 0 ? allowedModes.includes(r.id) : true;

          return (
            <div
              key={r.id}
              className={`srg-role-selection-card ${isSelected ? 'active' : ''} ${!isAllowed ? 'disabled' : ''}`}
              style={{
                borderColor: isSelected ? r.color : '#1E293B',
                opacity: isAllowed ? 1 : 0.55
              }}
              onClick={() => {
                if (isAllowed) {
                  onSelectRole(r.id);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '2.4rem' }}>{r.icon}</span>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {!isAllowed && (
                    <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '999px', background: '#334155', color: '#94A3B8', fontWeight: '700' }}>
                      🔒 Restricted
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: `${r.color}20`, color: r.color, fontWeight: '800' }}>
                    {r.badge}
                  </span>
                </div>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                {r.title}
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '1.2rem', minHeight: '52px' }}>
                {r.desc}
              </p>

              {/* Organization Internal Permission Selector if Selected */}
              {r.id === 'organization' && isSelected && isAllowed && (
                <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem' }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>
                    ORGANIZATION PERMISSION TIER:
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className={`srg-btn srg-btn-sm ${orgPermission === 'admin' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                      style={{ flex: 1, fontSize: '0.74rem' }}
                      onClick={() => onSelectOrgPermission && onSelectOrgPermission('admin')}
                    >
                      👑 Admin
                    </button>
                    <button
                      type="button"
                      className={`srg-btn srg-btn-sm ${orgPermission === 'staff' ? 'srg-btn-primary' : 'srg-btn-outline'}`}
                      style={{ flex: 1, fontSize: '0.74rem' }}
                      onClick={() => onSelectOrgPermission && onSelectOrgPermission('staff')}
                    >
                      🛡️ Staff
                    </button>
                  </div>
                </div>
              )}

              {/* Feature Highlights */}
              <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '1.4rem' }}>
                {r.features.map((f, idx) => (
                  <div key={idx} style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: r.color }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="srg-btn srg-btn-primary"
                style={{ width: '100%', background: isSelected ? r.color : (isAllowed ? '#1E293B' : '#334155'), borderColor: isSelected ? r.color : '#334155', color: '#FFFFFF', cursor: isAllowed ? 'pointer' : 'not-allowed' }}
                disabled={!isAllowed}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAllowed) onSelectRole(r.id);
                }}
              >
                {!isAllowed ? '🔒 Not Authorized' : (isSelected ? 'Enter Workspace →' : 'Switch Workspace')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Demo Journey Scenarios Selector */}
      <div style={{ marginTop: '2.5rem', background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>
          Explore Verified Journey Scenarios
        </h3>
        <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginBottom: '1.2rem' }}>
          Switch between pre-configured corridor presets to test student commutes, tourist walks, and night hospital shifts.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {scenarios.map((sc) => {
            const isCurrent = activeScenario && activeScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem',
                  background: isCurrent ? 'rgba(56, 189, 248, 0.12)' : '#0F172A',
                  border: `1px solid ${isCurrent ? '#38BDF8' : '#1E293B'}`,
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectScenario(sc)}
              >
                <span style={{ fontSize: '2rem' }}>{sc.avatar}</span>
                <div>
                  <b style={{ color: '#FFFFFF', fontSize: '0.94rem' }}>{sc.travelerName}</b>
                  <div style={{ fontSize: '0.76rem', color: '#38BDF8', marginTop: '2px' }}>{sc.travelerRole}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{sc.routeName}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
