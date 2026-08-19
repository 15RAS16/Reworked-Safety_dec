/**
 * SafeRoute Guardian - Role-Guarded Navigation Component
 * Compact desktop sidebar and responsive mobile bottom bar.
 * Strict Role Guarding: Unauthorized tools are never rendered.
 */

window.RoleNavigation = function({
  currentRole = 'tourist',
  orgPermission = 'staff',
  allowedModes = ['tourist'],
  activeTool = 'workspace',
  onSelectTool,
  onOpenRoles
}) {
  const rolesObj = (window.SRG_DATA && window.SRG_DATA.roles) || (window.MockData && window.MockData.roles) || {};
  const roleData = rolesObj[currentRole] || (Array.isArray(rolesObj) ? rolesObj.find(r => r.id === currentRole) : null) || {};
  
  // Filter tools based on role and organization permission
  let availableTools = [];
  if (currentRole === 'tourist') {
    availableTools = [
      { id: 'workspace', label: 'Safety Hub', icon: '🛡️' },
      { id: 'tourist-explore', label: 'Explore Safely', icon: '🌸' },
      { id: 'user-view', label: 'Live Journey', icon: '📍' },
      { id: 'safe-spots', label: 'Safe Spots', icon: '🏪' },
      { id: 'community-reviews', label: 'Reviews', icon: '⭐' },
      { id: 'local-help', label: 'Local Help', icon: '🤝' },
      { id: 'timeline', label: 'Timeline', icon: '◷' }
    ];
  } else if (currentRole === 'parent') {
    availableTools = [
      { id: 'workspace', label: 'Guardian Hub', icon: '👨‍👩‍👧' },
      { id: 'parent-dashboard', label: 'Dependents Monitor', icon: '🎒' },
      { id: 'alerts', label: 'Family Alerts', icon: '🔔' },
      { id: 'contacts', label: 'Safety Contacts', icon: '📇' },
      { id: 'timeline', label: 'Timeline', icon: '◷' }
    ];
  } else if (currentRole === 'organization') {
    if (orgPermission === 'admin') {
      availableTools = [
        { id: 'workspace', label: 'Command Hub', icon: '🏢' },
        { id: 'admin-monitor', label: 'Fleet Monitor', icon: '🖥️' },
        { id: 'routes', label: 'Corridors', icon: '🛤️' },
        { id: 'members', label: 'Roster', icon: '👥' },
        { id: 'alerts', label: 'Audit Logs', icon: '📋' },
        { id: 'ai-telemetry', label: 'AI Telemetry', icon: '🧠' }
      ];
    } else {
      availableTools = [
        { id: 'workspace', label: 'Staff Hub', icon: '🛡️' },
        { id: 'staff-dashboard', label: 'Assigned Fleet', icon: '🎒' },
        { id: 'alerts', label: 'Incidents', icon: '📋' },
        { id: 'timeline', label: 'Timeline', icon: '◷' }
      ];
    }
  }

  return (
    <nav className="srg-role-nav">
      <div className="srg-nav-inner">
        {/* Workspace Switcher / Back Button */}
        <button
          type="button"
          className="srg-nav-item srg-nav-role-btn"
          onClick={onOpenRoles}
          title="Switch Safety Mode"
        >
          <span style={{ fontSize: '1.2rem' }}>🔀</span>
          <span className="srg-nav-label">Switch Mode</span>
        </button>

        <div className="srg-nav-divider" />

        {/* Filtered Authorized Tools */}
        {availableTools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              className={`srg-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTool(tool.id)}
            >
              <span className="srg-nav-icon">{tool.icon}</span>
              <span className="srg-nav-label">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
