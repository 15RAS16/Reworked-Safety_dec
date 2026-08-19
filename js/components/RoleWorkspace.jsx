/**
 * SafeRoute Guardian - Role Workspace Dashboard Hub
 * Renders tailored feature cards filtered by role and organization permission level.
 */

window.RoleWorkspace = function({
  currentRole = 'tourist',
  orgPermission = 'staff',
  onSelectFeature,
  activeScenario,
  riskData
}) {
  const role = window.MockData.roles[currentRole] || window.MockData.roles.tourist;

  let features = [];
  if (currentRole === 'tourist') {
    features = [
      {
        id: 'tourist-explore',
        title: 'Explore Safely AI Intelligence',
        icon: '🌸',
        color: '#38BDF8',
        desc: 'Destination safety index, weather warnings, cellular dead-zone intelligence, and fastest vs safer routes.'
      },
      {
        id: 'user-view',
        title: 'My Live Journey Map & SOS',
        icon: '📍',
        color: '#10B981',
        desc: 'GPS corridor tracking, destination ETA, 3s hold SOS panic, and 3-shake gesture trigger.'
      },
      {
        id: 'community-reviews',
        title: 'Community Safety Reviews',
        icon: '⭐',
        color: '#F59E0B',
        desc: 'Crowdsourced street safety ratings, night-lighting tags, solo travel reports, and tips.'
      },
      {
        id: 'local-help',
        title: 'Verified Local Help Network',
        icon: '🤝',
        color: '#818CF8',
        desc: 'Request multilingual guidance, safe transit companions, or localized safety assistance.'
      },
      {
        id: 'safe-spots',
        title: 'Trusted Safe Spots',
        icon: '🏪',
        color: '#EC4899',
        desc: 'Find 24/7 verified police substations, partner hospitals, and emergency callboxes.'
      },
      {
        id: 'timeline',
        title: 'Personal Journey Timeline',
        icon: '◷',
        color: '#64748B',
        desc: 'Chronological timeline of your check-in verifications and Safe Beacon coordinate drops.'
      }
    ];
  } else if (currentRole === 'parent') {
    features = [
      {
        id: 'parent-dashboard',
        title: 'Linked Dependents Live Monitor',
        icon: '🎒',
        color: '#10B981',
        desc: 'Real-time school corridor monitoring, battery levels, deviation alerts, and Safe Beacon sync.'
      },
      {
        id: 'alerts',
        title: 'Family Deviation Alerts Feed',
        icon: '🔔',
        color: '#F59E0B',
        desc: 'Immediate notifications if a family member departs their approved corridor.'
      },
      {
        id: 'contacts',
        title: 'Family Emergency Directory',
        icon: '📇',
        color: '#38BDF8',
        desc: 'Manage school dispatch contacts, family phone numbers, and emergency escalation.'
      },
      {
        id: 'timeline',
        title: 'Family Journey Audit Log',
        icon: '◷',
        color: '#64748B',
        desc: 'Review historical transit milestones and check-in verifications.'
      }
    ];
  } else if (currentRole === 'organization') {
    if (orgPermission === 'admin') {
      features = [
        {
          id: 'admin-monitor',
          title: 'Organization Command Center',
          icon: '🖥️',
          color: '#38BDF8',
          desc: 'Fleet-wide live Leaflet monitoring map, active traveler KPIs, and operational status.'
        },
        {
          id: 'routes',
          title: 'Safe Routes & Corridor Editor',
          icon: '🛤️',
          color: '#10B981',
          desc: 'Configure approved waypoints, adjust buffer widths (50m–500m), and set escalation timeouts.'
        },
        {
          id: 'members',
          title: 'Member & Staff Roster',
          icon: '👥',
          color: '#818CF8',
          desc: 'Issue single-use 7-day cryptographic invite tokens and manage staff assignments.'
        },
        {
          id: 'alerts',
          title: 'Incident Logs & Compliance Audit',
          icon: '📋',
          color: '#EC4899',
          desc: 'Immutable records of corridor breaches, check-in confirmations, and emergency triggers.'
        },
        {
          id: 'ai-telemetry',
          title: 'AI Risk Engine Telemetry',
          icon: '🧠',
          color: '#F59E0B',
          desc: 'Real-time breakdown of all 6 contextual signals with transparent formula weights.'
        },
        {
          id: 'timeline',
          title: 'Enterprise Audit History',
          icon: '◷',
          color: '#64748B',
          desc: 'Chronological timeline of fleet milestones, deviations, and dispatch actions.'
        }
      ];
    } else {
      features = [
        {
          id: 'staff-dashboard',
          title: 'Assigned Fleet Operations',
          icon: '🎒',
          color: '#38BDF8',
          desc: 'Live corridor monitoring and risk telemetry for travelers assigned to your group.'
        },
        {
          id: 'alerts',
          title: 'Assigned Incidents Feed',
          icon: '📋',
          color: '#F59E0B',
          desc: 'Review and acknowledge deviation check-in alerts for your assigned travelers.'
        },
        {
          id: 'timeline',
          title: 'Operational Audit History',
          icon: '◷',
          color: '#64748B',
          desc: 'Chronological transit records for assigned traveler groups.'
        }
      ];
    }
  }

  return (
    <div className="srg-workspace-view">
      {/* Workspace Header */}
      <div className="srg-workspace-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '2rem' }}>{role.icon}</span>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
              {role.title} {currentRole === 'organization' ? `(${orgPermission === 'admin' ? 'Administrator' : 'Staff'})` : ''}
            </h1>
            <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>{role.tagline}</span>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="srg-features-grid">
        {features.map((f) => (
          <div
            key={f.id}
            className="srg-feature-card"
            onClick={() => onSelectFeature(f.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{f.icon}</span>
              <span style={{ color: f.color, fontSize: '0.85rem' }}>→</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.45' }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
