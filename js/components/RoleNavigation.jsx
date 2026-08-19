/**
 * SafeRoute Guardian - Role-Based Navigation Sidebar & Mobile Bar
 * Enforces role isolation across 3 modes (Tourist, Parent/Guardian, Organization)
 * with dedicated Organization Admin and Staff permission tiers.
 */

window.RoleNavigation = function({
  roleId,
  orgPermission = 'staff',
  activeTool,
  onNavigate,
  onSwitchRole,
  onLogout,
  profileName = 'User',
  userEmail = ''
}) {
  // Navigation menus by role and permission level
  const touristMenu = [
    ['tourist-home', '⌂', 'Tourist Home'],
    ['explore-safely', '🧭', 'Explore Safely'],
    ['tourist-journey', '🗺️', 'My Live Journey'],
    ['community-reviews', '⭐', 'Community Reviews'],
    ['local-help', '🤝', 'Local Help Network'],
    ['trusted-safe-spots', '📍', 'Trusted Safe Spots'],
    ['journey-timeline', '◷', 'Journey Timeline'],
    ['tourist-sos', '🚨', 'Emergency SOS']
  ];

  const parentMenu = [
    ['guardian-home', '⌂', 'Guardian Home'],
    ['live-map', '📍', 'Live Dependent Map'],
    ['traveler-status', '👶', 'Dependent Status & Beacon'],
    ['alerts-feed', '🔔', 'Alerts & Deviations'],
    ['guardian-contacts', '📞', 'Emergency Contacts'],
    ['journey-timeline', '◷', 'Incident Evidence']
  ];

  const orgStaffMenu = [
    ['org-home', '⌂', 'Staff Operations'],
    ['org-monitor', '👥', 'Assigned Travelers Map'],
    ['org-incident-log', '📋', 'Incident Logs'],
    ['org-contacts', '📞', 'Dispatch Contacts'],
    ['journey-timeline', '◷', 'Audit History']
  ];

  const orgAdminMenu = [
    ['org-home', '⌂', 'Command Center'],
    ['org-monitor', '🖥️', 'Live Fleet Map'],
    ['admin-users', '👥', 'Member & Staff Roster'],
    ['admin-routes', '🛤️', 'Routes & Corridors'],
    ['org-incident-log', '📋', 'Incident Audit Logs'],
    ['admin-contacts', '📇', 'Safety Dispatch & CAD'],
    ['admin-ai-engine', '🧠', 'AI Risk Telemetry'],
    ['local-help-monitor', '🤝', 'Local Help Monitor'],
    ['journey-timeline', '◷', 'Audit History']
  ];

  // Select active menu items
  let activeMenuItems = touristMenu;
  if (roleId === 'parent') {
    activeMenuItems = parentMenu;
  } else if (roleId === 'organization') {
    activeMenuItems = orgPermission === 'admin' ? orgAdminMenu : orgStaffMenu;
  }

  const roleMeta = (window.SRG_DATA.roles || []).find(r => r.id === roleId) || {
    title: 'Workspace',
    icon: '🛡️'
  };

  const roleDisplayTitle = roleId === 'organization'
    ? (orgPermission === 'admin' ? 'Org Administrator' : 'Organization Staff')
    : roleMeta.title;

  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="srg-role-sidebar">
        {/* Brand */}
        <div className="srg-side-brand">
          <span style={{ fontSize: '1.35rem' }}>🛡️</span>
          <div>
            <b style={{ fontSize: '1.05rem', color: '#172A46', display: 'block', letterSpacing: '-0.02em' }}>SafeRoute</b>
            <small style={{ fontSize: '0.62rem', color: '#60738D', letterSpacing: '0.05em' }}>GUARDIAN PLATFORM</small>
          </div>
        </div>

        {/* Current Role Badge */}
        <div className="srg-side-role">
          <span style={{ fontSize: '1.4rem' }}>{roleMeta.icon}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <small style={{ fontSize: '0.62rem', color: '#7890A9', fontWeight: '700' }}>CURRENT WORKSPACE</small>
            <b style={{ fontSize: '0.84rem', color: '#1E3857', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {roleDisplayTitle}
            </b>
          </div>
        </div>

        {/* Role-Guarded Navigation Items */}
        <nav style={{ display: 'grid', gap: '0.22rem', overflowY: 'auto', flex: 1 }}>
          {activeMenuItems.map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              className={activeTool === id ? 'active' : ''}
              onClick={() => onNavigate(id)}
              title={label}
            >
              <span style={{ fontSize: '1.05rem', minWidth: '20px', textAlign: 'center' }}>{icon}</span>
              <b style={{ fontSize: '0.8rem' }}>{label}</b>
            </button>
          ))}
        </nav>

        {/* Profile Footer */}
        <div className="srg-side-profile">
          <button
            type="button"
            className="srg-profile-trigger"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="User account settings"
          >
            <span style={{ fontSize: '1.25rem' }}>👤</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ fontSize: '0.78rem', color: '#1E3857', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profileName}
              </b>
              <small style={{ fontSize: '0.64rem', color: '#71839A' }}>{roleDisplayTitle}</small>
            </div>
            <i style={{ fontStyle: 'normal', color: '#94A3B8' }}>{profileOpen ? '▴' : '▾'}</i>
          </button>

          {profileOpen && (
            <div className="srg-profile-menu">
              <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #E5EDF5', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block' }}>Signed in as</span>
                <b style={{ fontSize: '0.75rem', color: '#0F172A', wordBreak: 'break-all' }}>{userEmail || profileName}</b>
              </div>
              <button type="button" onClick={() => { setProfileOpen(false); onSwitchRole(); }}>
                ⇄ Switch Workspace Mode
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); onNavigate('settings'); }}>
                ⚙ Account Settings
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); onLogout(); }} style={{ color: '#EF4444' }}>
                ↪ Secure Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="srg-mobile-nav">
        {activeMenuItems.slice(0, 4).map(([id, icon, label]) => (
          <button
            key={id}
            type="button"
            className={activeTool === id ? 'active' : ''}
            onClick={() => onNavigate(id)}
          >
            <span>{icon}</span>
            <small>{label.split(' ')[0]}</small>
          </button>
        ))}
        <button type="button" onClick={onSwitchRole}>
          <span>⇄</span>
          <small>Roles</small>
        </button>
      </nav>
    </>
  );
};
