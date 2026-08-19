/**
 * SafeRoute Guardian - Main Application Coordinator
 * Implements Firebase Authentication, 3-Role Workspace Isolation,
 * Multi-Step Onboarding, Route Guards, Explainable AI Risk Engine, and Emergency Protocols.
 */

window.App = function() {
  // 1. Firebase Authentication & User Profile State
  const [currentUser, setCurrentUser] = React.useState(() => {
    return window.FirebaseService ? window.FirebaseService.getCurrentUser() : null;
  });
  const [userProfile, setUserProfile] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // 2. Scenarios and Active Journey Selection
  const [scenarios, setScenarios] = React.useState(() => window.StorageService.getRoutes());
  const [activeScenario, setActiveScenario] = React.useState(() => scenarios[0]);

  // 3. Navigation State (3 Top-Level Roles)
  // currentView: 'landing' (3 workspace selector) | 'workspace' (feature cards hub) | 'tool' (specific feature/dashboard)
  const [currentView, setCurrentView] = React.useState('landing');
  const [currentRole, setCurrentRole] = React.useState('tourist'); // 'tourist' | 'parent' | 'organization'
  const [orgPermission, setOrgPermission] = React.useState('staff'); // 'staff' | 'admin'
  const [activeTool, setActiveTool] = React.useState(null);

  // 4. Audio Mute State
  const [isMuted, setIsMuted] = React.useState(false);

  // 5. Position & Journey State
  const [currentPos, setCurrentPos] = React.useState(() => activeScenario.demoWaypoints.safe);
  const [journeyState, setJourneyState] = React.useState({
    stage: 'ON_ROUTE',
    timeOffRouteSeconds: 0,
    isMovingFarther: false,
    isNight: activeScenario.isNightTime || false,
    checkinStatus: 'NOT_NEEDED', // 'NOT_NEEDED' | 'PENDING' | 'ACKNOWLEDGED' | 'EXPIRED'
    isSosActive: false,
    emergencySource: null,
    isTestEmergency: false
  });

  // 6. Escalation Countdown (Default 15 minutes = 900 seconds)
  const [countdownSeconds, setCountdownSeconds] = React.useState(900);
  const [isFastForwarding, setIsFastForwarding] = React.useState(false);
  const [showDeviationModal, setShowDeviationModal] = React.useState(false);

  // 7. Alerts, Contacts, Reviews, Help Requests & Safe Beacon
  const [alerts, setAlerts] = React.useState(() => window.StorageService.getAlerts());
  const [contacts, setContacts] = React.useState(() => window.StorageService.getContacts(activeScenario.id));
  const [communityReviews, setCommunityReviews] = React.useState(() => window.StorageService.getCommunityReviews());
  const [localHelpRequests, setLocalHelpRequests] = React.useState(() => window.StorageService.getLocalHelpRequests());
  const [networkStatus, setNetworkStatus] = React.useState('STRONG');
  const [safeBeacon, setSafeBeacon] = React.useState(() => window.StorageService.getSafeBeacon());
  const [journeyTimeline, setJourneyTimeline] = React.useState(() => window.StorageService.getJourneyTimeline());
  const [toasts, setToasts] = React.useState([]);

  // 8. Device Motion Hardware State
  const [motionStatus, setMotionStatus] = React.useState(() => window.MotionService.getStatus());

  // Toast Helper
  const addToast = (title, message, type = 'info') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const recordTimeline = (type, message, tone = 'system', extra = {}) => {
    const event = window.StorageService.addTimelineEvent({ type, message, tone, ...extra });
    setJourneyTimeline(prev => [event, ...prev]);
  };

  // Auth State Listener
  React.useEffect(() => {
    if (!window.FirebaseService) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = window.FirebaseService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load user profile from Firestore or local fallback
        const profile = await window.FirebaseService.getUserProfile(user.uid);
        setUserProfile(profile);

        if (profile) {
          if (profile.primaryRole) setCurrentRole(profile.primaryRole);
          if (profile.orgPermission) setOrgPermission(profile.orgPermission);
          if (profile.onboardingComplete === false) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        } else if (!user.onboardingComplete) {
          setShowOnboarding(true);
        }
      } else {
        setUserProfile(null);
        setShowOnboarding(false);
      }
      setAuthLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Safe Beacon Sync on Network Status Change
  React.useEffect(() => {
    if (networkStatus === 'LIMITED' || networkStatus === 'OFFLINE') {
      const beacon = {
        travelerName: activeScenario.travelerName,
        location: currentPos,
        timestamp: new Date().toISOString(),
        battery: 76,
        destination: activeScenario.destinationName,
        routeStatus: journeyState.stage,
        riskScore: riskData.score,
        networkStatus
      };
      window.StorageService.saveSafeBeacon(beacon);
      setSafeBeacon(beacon);
      recordTimeline('SAFE_BEACON_SAVED', `Safe Beacon saved while network is ${networkStatus.toLowerCase()}.`, 'warning');
    }
  }, [networkStatus]);

  const handleSetNetworkStatus = (nextStatus) => {
    const hadBeacon = !!safeBeacon;
    setNetworkStatus(nextStatus);
    recordTimeline('NETWORK_STATUS', `Network connectivity changed to ${nextStatus} (Demo / Simulated).`, nextStatus === 'STRONG' ? 'safe' : 'warning');
    if (nextStatus === 'STRONG' && hadBeacon) {
      addToast('Safe Beacon Synced', 'Last known safe location successfully transmitted to safety console.', 'success');
      recordTimeline('SAFE_BEACON_SYNCED', 'Safe Beacon synced: last known location received.', 'safe');
      window.StorageService.clearSafeBeacon();
      setSafeBeacon(null);
    }
  };

  // Switch Active Scenario
  const handleSelectScenario = (sc) => {
    setActiveScenario(sc);
    setCurrentPos(sc.demoWaypoints.safe);
    setJourneyState({
      stage: 'ON_ROUTE',
      timeOffRouteSeconds: 0,
      isMovingFarther: false,
      isNight: sc.isNightTime || false,
      checkinStatus: 'NOT_NEEDED',
      isSosActive: false,
      emergencySource: null,
      isTestEmergency: false
    });
    setCountdownSeconds(sc.escalationTimeoutMinutes * 60);
    setShowDeviationModal(false);
    setContacts(window.StorageService.getContacts(sc.id));
    addToast('Persona Activated', `Switched active journey to ${sc.travelerName} (${sc.routeName})`, 'info');
    recordTimeline('JOURNEY_STARTED', `${sc.travelerName} began monitored travel along approved corridor to ${sc.destinationName}.`, 'safe');
  };

  // Calculate Explainable AI Safety Risk Score (0 - 100)
  const riskData = React.useMemo(() => {
    return window.RiskEngine.assessRisk({
      travelerName: activeScenario.travelerName,
      currentPos: currentPos,
      routeWaypoints: activeScenario.routeWaypoints,
      corridorWidthMeters: activeScenario.corridorWidthMeters,
      timeOffRouteSeconds: journeyState.timeOffRouteSeconds,
      isMovingFarther: journeyState.isMovingFarther,
      isNight: journeyState.isNight,
      checkinStatus: journeyState.checkinStatus,
      isSosActive: journeyState.isSosActive,
      destinationName: activeScenario.destinationName
    });
  }, [activeScenario, currentPos, journeyState]);

  // Initialize DeviceMotion hardware listener
  React.useEffect(() => {
    window.MotionService.init({
      onEmergency: () => {
        handleTriggerSos('SHAKE_GESTURE');
      },
      onStatusChange: (status) => {
        setMotionStatus(status);
      }
    });

    return () => {
      window.MotionService.stopListening();
    };
  }, []);

  // Countdown & Time-Off-Route Timer Loop
  React.useEffect(() => {
    let interval = null;

    if (journeyState.checkinStatus === 'PENDING' && !journeyState.isSosActive) {
      interval = setInterval(() => {
        setJourneyState(prev => ({
          ...prev,
          timeOffRouteSeconds: prev.timeOffRouteSeconds + (isFastForwarding ? 45 : 1)
        }));

        setCountdownSeconds(prev => {
          const step = isFastForwarding ? 45 : 1;
          const next = prev - step;
          if (next <= 0) {
            handleTimeoutEscalation();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else if (riskData.distanceOffCorridor > 0 && !journeyState.isSosActive) {
      interval = setInterval(() => {
        setJourneyState(prev => ({
          ...prev,
          timeOffRouteSeconds: prev.timeOffRouteSeconds + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [journeyState.checkinStatus, journeyState.isSosActive, riskData.distanceOffCorridor, isFastForwarding]);

  // Auth Handler from LoginPortal
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (!user.onboardingComplete) {
      setShowOnboarding(true);
    } else {
      if (user.primaryRole) setCurrentRole(user.primaryRole);
      if (user.orgPermission) setOrgPermission(user.orgPermission);
      setCurrentView('workspace');
      addToast('Secure Session Established', `Welcome back, ${user.displayName || 'Traveler'}!`, 'success');
    }
  };

  const handleCompleteOnboarding = (role) => {
    setCurrentRole(role);
    setShowOnboarding(false);
    setCurrentView('workspace');
    addToast('Onboarding Complete', `Your ${role.toUpperCase()} safety workspace is ready.`, 'success');
  };

  const handleLogout = async () => {
    await window.FirebaseService.signOutUser();
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentView('landing');
    setActiveTool(null);
    addToast('Logged Out', 'You have been securely signed out.', 'info');
  };

  // Workspace Navigation Handlers
  const handleSelectRoleFromLanding = (roleId) => {
    setCurrentRole(roleId);
    setCurrentView('workspace');
    addToast('Workspace Opened', `Entered ${roleId.toUpperCase()} workspace. Select a feature card to launch.`, 'info');
  };

  const handleSwitchRole = () => {
    setCurrentView('landing');
    setActiveTool(null);
  };

  const handleBackToRoles = () => {
    setCurrentView('landing');
    setActiveTool(null);
  };

  const handleBackToWorkspace = () => {
    setCurrentView('workspace');
    setActiveTool(null);
  };

  const handleRoleNavigate = (toolId) => {
    setActiveTool(toolId);
    setCurrentView('tool');
  };

  const handleLaunchFeature = (roleId, featureId) => {
    setCurrentRole(roleId);
    setActiveTool(featureId);
    setCurrentView('tool');
  };

  // Shortcuts
  const handleOpenExploreSafely = () => {
    setCurrentRole('tourist');
    setActiveTool('explore-safely');
    setCurrentView('tool');
  };

  const handleOpenCommunityReviews = () => {
    setCurrentRole('tourist');
    setActiveTool('community-reviews');
    setCurrentView('tool');
  };

  const handleOpenLocalHelp = () => {
    setCurrentRole('tourist');
    setActiveTool('local-help');
    setCurrentView('tool');
  };

  // Emergency Trigger Protocol
  const handleTriggerSos = (source = 'MANUAL_SOS', isSilentTest = false) => {
    setJourneyState(prev => ({
      ...prev,
      isSosActive: true,
      emergencySource: source,
      isTestEmergency: isSilentTest
    }));
    setShowDeviationModal(false);

    if (!isSilentTest && window.AudioService) {
      window.AudioService.startSiren();
    }

    const newAlert = window.StorageService.addAlert({
      travelerName: activeScenario.travelerName,
      type: 'SOS_EMERGENCY',
      severity: 'emergency',
      message: `[Demo / Simulated] CRITICAL: ${activeScenario.travelerName} activated Emergency Protocol via ${source}. Dispatched to guardian & CAD gateway.`,
      status: 'ACTIVE',
      resolvedBy: null
    });
    setAlerts(prev => [newAlert, ...prev]);
    recordTimeline('SOS_ACTIVATED', `Emergency protocol activated via ${source}. ${safeBeacon ? 'Latest Safe Beacon coordinates attached.' : 'Live GPS coordinates attached.'}`, 'emergency');

    addToast('EMERGENCY ACTIVATED (Simulated)', `SOS broadcast dispatched to ${activeScenario.guardianName} and safety console!`, 'emergency');
  };

  // Timeout Escalation Trigger
  const handleTimeoutEscalation = () => {
    setJourneyState(prev => ({
      ...prev,
      checkinStatus: 'EXPIRED',
      isSosActive: true,
      emergencySource: 'TIMEOUT_ESCALATION'
    }));
    setIsFastForwarding(false);
    setShowDeviationModal(false);

    if (window.AudioService) {
      window.AudioService.startSiren();
    }

    const newAlert = window.StorageService.addAlert({
      travelerName: activeScenario.travelerName,
      type: 'TIMEOUT_ESCALATION',
      severity: 'emergency',
      message: `[Demo / Simulated] UNRESPONSIVE ESCALATION: ${activeScenario.travelerName} did not respond within ${activeScenario.escalationTimeoutMinutes}m. Dispatched emergency network.`,
      status: 'ACTIVE',
      resolvedBy: null
    });
    setAlerts(prev => [newAlert, ...prev]);
    recordTimeline('EMERGENCY_ESCALATED', 'Safety check-in expired; emergency contacts notified (Demo / Simulated).', 'emergency');

    addToast('Escalation Protocol Active (Simulated)', 'Safety check-in expired without response. Dispatched emergency network.', 'emergency');
  };

  // Cancel Emergency
  const handleCancelEmergency = (reason = 'Cancelled by traveler') => {
    if (window.AudioService) {
      window.AudioService.stopSiren();
      window.AudioService.playSafeConfirmation();
    }

    setJourneyState(prev => ({
      ...prev,
      isSosActive: false,
      emergencySource: null,
      isTestEmergency: false,
      checkinStatus: 'ACKNOWLEDGED'
    }));

    const newAlert = window.StorageService.addAlert({
      travelerName: activeScenario.travelerName,
      type: 'EMERGENCY_CANCELLED',
      severity: 'info',
      message: `[Demo / Simulated] Emergency cancelled for ${activeScenario.travelerName}: ${reason}`,
      status: 'RESOLVED',
      resolvedBy: reason
    });
    setAlerts(prev => [newAlert, ...prev]);
    recordTimeline('EMERGENCY_CANCELLED', reason, 'safe');

    addToast('Emergency Cancelled', 'Safety siren stopped and safety network notified of cancellation.', 'success');
  };

  // "I'm Safe" Acknowledgment
  const handleAcknowledgeSafe = () => {
    if (window.AudioService) {
      window.AudioService.playSafeConfirmation();
    }

    setJourneyState(prev => ({
      ...prev,
      checkinStatus: 'ACKNOWLEDGED',
      timeOffRouteSeconds: 0
    }));
    setShowDeviationModal(false);
    setIsFastForwarding(false);

    const newAlert = window.StorageService.addAlert({
      travelerName: activeScenario.travelerName,
      type: 'SAFE_CHECKIN',
      severity: 'info',
      message: `[Demo / Simulated] ${activeScenario.travelerName} confirmed "I'm Safe" and is returning to safe corridor.`,
      status: 'RESOLVED',
      resolvedBy: 'Traveler check-in'
    });
    setAlerts(prev => [newAlert, ...prev]);
    recordTimeline('SAFE_CHECKIN', `${activeScenario.travelerName} confirmed they are safe.`, 'safe');

    addToast('Safety Confirmed', 'Check-in registered. Please continue along the approved corridor.', 'success');
  };

  // Interactive Demo Step Trigger
  const handleTriggerDemoStep = (stepType) => {
    switch (stepType) {
      case 'SAFE_ON_ROUTE':
        setCurrentPos(activeScenario.demoWaypoints.safe);
        setJourneyState(prev => ({
          ...prev,
          stage: 'ON_ROUTE',
          timeOffRouteSeconds: 0,
          isMovingFarther: false,
          checkinStatus: 'NOT_NEEDED',
          isSosActive: false
        }));
        setShowDeviationModal(false);
        setIsFastForwarding(false);
        if (window.AudioService) window.AudioService.stopSiren();
        addToast('Demo Step: Safe on Route', `${activeScenario.travelerName} is on approved route corridor.`, 'success');
        recordTimeline('ON_ROUTE', 'Journey status returned to the approved safe corridor.', 'safe');
        break;

      case 'MINOR_DEVIATION':
        setCurrentPos(activeScenario.demoWaypoints.minorDeviation);
        setJourneyState(prev => ({
          ...prev,
          stage: 'MINOR_DEVIATION',
          timeOffRouteSeconds: 45,
          isMovingFarther: false,
          checkinStatus: 'NOT_NEEDED',
          isSosActive: false
        }));
        setShowDeviationModal(false);
        if (window.AudioService) window.AudioService.playCheckinAlert();
        addToast('Demo Step: Minor Deviation', 'Traveler drifted ~140m off corridor. Gentle route reminder dispatched.', 'warning');
        recordTimeline('ROUTE_DEVIATION', 'Minor route deviation detected; a gentle route reminder was sent.', 'warning');
        break;

      case 'SEVERE_DEVIATION':
        setCurrentPos(activeScenario.demoWaypoints.severeDeviation);
        setJourneyState(prev => ({
          ...prev,
          stage: 'SEVERE_DEVIATION',
          timeOffRouteSeconds: 180,
          isMovingFarther: true,
          checkinStatus: 'PENDING',
          isSosActive: false
        }));
        setCountdownSeconds(activeScenario.escalationTimeoutMinutes * 60);
        setShowDeviationModal(true);
        if (window.AudioService) window.AudioService.playCheckinAlert();
        addToast('Demo Step: High Risk Drift', 'Traveler is 450m outside corridor! "Are you safe?" check-in activated.', 'warning');
        recordTimeline('CHECKIN_SENT', 'High-risk route drift detected; “Are you safe?” check-in sent.', 'warning');
        break;

      case 'RETURN_TO_ROUTE':
        setCurrentPos(activeScenario.demoWaypoints.returning);
        setJourneyState(prev => ({
          ...prev,
          stage: 'RETURNING',
          isMovingFarther: false,
          checkinStatus: 'ACKNOWLEDGED'
        }));
        setShowDeviationModal(false);
        addToast('Demo Step: Returning to Corridor', 'Traveler trajectory vector is heading back toward corridor.', 'info');
        recordTimeline('RETURNING_TO_ROUTE', 'Traveler is moving back toward the approved corridor.', 'system');
        break;

      case 'FAST_FORWARD_TIMEOUT':
        setIsFastForwarding(true);
        setShowDeviationModal(true);
        addToast('Fast Forwarding Demo', 'Escalation countdown running at 45x speed (~20s total).', 'warning');
        break;

      case 'SOS_TRIGGER':
        handleTriggerSos('ADMIN_PANIC_TRIGGER', false);
        break;

      default:
        break;
    }
  };

  const handleToggleMute = () => {
    if (window.AudioService) {
      const muted = window.AudioService.toggleMute();
      setIsMuted(muted);
      addToast(muted ? 'Audio Muted' : 'Audio Enabled', muted ? 'Sirens and alert sounds are muted.' : 'Sirens and alert sounds are active.', 'info');
    }
  };

  const handleAddContact = (newContact) => {
    const updated = [...contacts, newContact];
    setContacts(updated);
    window.StorageService.saveContacts(activeScenario.id, updated);
    addToast('Contact Added', `${newContact.name} added to safety network.`, 'success');
  };

  const handleClearAlerts = () => {
    window.StorageService.saveAlerts([]);
    setAlerts([]);
    addToast('Audit Log Cleared', 'Alert history has been reset.', 'info');
  };

  const handleUpdateScenarioRoute = (scenarioId, updates) => {
    const updatedScenarios = scenarios.map(sc => sc.id === scenarioId ? { ...sc, ...updates } : sc);
    setScenarios(updatedScenarios);
    window.StorageService.saveRoutes(updatedScenarios);
    if (activeScenario.id === scenarioId) {
      setActiveScenario(prev => ({ ...prev, ...updates }));
    }
    addToast('Route Updated', 'Corridor buffer settings updated successfully.', 'success');
  };

  const handleAddCommunityReview = (newReview) => {
    const created = window.StorageService.addCommunityReview(newReview);
    setCommunityReviews(prev => [created, ...prev]);
    addToast('Review Submitted', 'Your safety report has been added to community intelligence.', 'success');
  };

  const handleCreateLocalHelpRequest = (request) => {
    const created = window.StorageService.addLocalHelpRequest({ ...request, travelerName: activeScenario.travelerName });
    setLocalHelpRequests(prev => [created, ...prev]);
    addToast('Local Help Requested', `Your request was sent to ${request.helperName}.`, 'success');
  };

  const handleUpdateLocalHelpRequest = (requestId, updates) => {
    const updated = window.StorageService.updateLocalHelpRequest(requestId, updates);
    setLocalHelpRequests(prev => prev.map(request => request.id === requestId ? updated : request));
  };

  // Helper to render the active tool/dashboard view with Route Guards
  const renderActiveToolView = () => {
    // Check permission rules:
    // Tourists cannot access admin-users, org-command, org-members, guardian-home
    const adminOnlyTools = ['admin-users', 'org-members', 'admin-routes', 'admin-contacts', 'admin-ai-engine', 'admin-demo-controls'];
    const parentOnlyTools = ['guardian-home', 'parent-link-dependent'];
    const orgOnlyTools = ['org-home', 'org-monitor', 'org-reports', 'org-incident-log', 'org-contacts', ...adminOnlyTools];

    if (currentRole === 'tourist' && (orgOnlyTools.includes(activeTool) || parentOnlyTools.includes(activeTool))) {
      return (
        <window.AccessDenied
          currentRole="tourist"
          requiredRole="Parent / Guardian or Organization"
          onReturnHome={handleBackToWorkspace}
        />
      );
    }

    if (currentRole === 'parent' && orgOnlyTools.includes(activeTool)) {
      return (
        <window.AccessDenied
          currentRole="parent"
          requiredRole="Organization Administrator or Staff"
          onReturnHome={handleBackToWorkspace}
        />
      );
    }

    if (currentRole === 'organization' && orgPermission === 'staff' && adminOnlyTools.includes(activeTool)) {
      return (
        <window.AccessDenied
          currentRole="organization staff"
          requiredRole="Organization Administrator"
          onReturnHome={handleBackToWorkspace}
        />
      );
    }

    // Full Screen Maps
    const fullMapTools = ['live-map', 'traveler-live-map', 'org-monitor', 'org-full-map', 'admin-full-map', 'admin-monitor'];
    if (fullMapTools.includes(activeTool)) {
      return (
        <window.FullScreenMap
          title={activeTool === 'live-map' ? 'Live Dependent Route Map' : activeTool === 'traveler-live-map' ? 'My Live Journey Map' : 'Group Safety Monitoring Map'}
          activeScenario={activeScenario}
          riskData={riskData}
          currentPos={currentPos}
          journeyState={journeyState}
          safeBeacon={safeBeacon}
          onBack={handleBackToWorkspace}
          onTriggerSos={handleTriggerSos}
        />
      );
    }

    // Focused Pages
    const focusedPages = ['tourist-home', 'route-safety', 'guardian-home', 'safe-beacon', 'org-home', 'org-reports', 'admin-users', 'local-help-monitor', 'helper-verification', 'settings', 'trusted-safe-spots', 'journey-timeline'];
    if (focusedPages.includes(activeTool)) {
      return (
        <window.RoleFeaturePage 
          tool={activeTool}
          roleId={currentRole}
          orgPermission={orgPermission}
          activeScenario={activeScenario}
          riskData={riskData}
          safeBeacon={safeBeacon}
          timeline={journeyTimeline}
          onBack={handleBackToWorkspace}
          onOpen={handleRoleNavigate}
        />
      );
    }

    // 1. Explore Safely View
    if (activeTool === 'explore-safely') {
      return (
        <window.TouristExploreView 
          activeScenario={activeScenario}
          onBackToWorkspace={handleBackToWorkspace}
          onOpenCommunityReviews={handleOpenCommunityReviews}
          communityReviews={communityReviews}
        />
      );
    }

    // 2. Community Reviews View
    if (activeTool === 'community-reviews') {
      return (
        <window.CommunityReviewsView 
          onBackToWorkspace={handleBackToWorkspace}
          onOpenExploreSafely={handleOpenExploreSafely}
          communityReviews={communityReviews}
          onAddReview={handleAddCommunityReview}
        />
      );
    }

    // 3. Local Help Network
    if (activeTool === 'local-help') {
      return (
        <window.LocalHelpNetwork
          activeScenario={activeScenario}
          onBackToWorkspace={handleBackToWorkspace}
          onOpenExploreSafely={handleOpenExploreSafely}
          onOpenCommunityReviews={handleOpenCommunityReviews}
          onCreateRequest={handleCreateLocalHelpRequest}
          onUpdateRequest={handleUpdateLocalHelpRequest}
          requests={localHelpRequests}
        />
      );
    }

    // 4. Tourist / Traveler Journey Dashboard
    if (currentRole === 'tourist' || activeTool === 'tourist-journey' || activeTool === 'tourist-sos' || activeTool === 'traveler-status') {
      return (
        <window.UserDashboard 
          roleId={currentRole}
          onBackToWorkspace={handleBackToWorkspace}
          onOpenExploreSafely={handleOpenExploreSafely}
          onOpenCommunityReviews={handleOpenCommunityReviews}
          activeScenario={activeScenario}
          riskData={riskData}
          currentPos={currentPos}
          journeyState={journeyState}
          onAcknowledgeSafe={handleAcknowledgeSafe}
          onTriggerSos={(src) => handleTriggerSos(src, false)}
          onTestEmergency={() => handleTriggerSos('DEMO_TEST_SILENT', true)}
          motionStatus={motionStatus}
          onRequestMotionPermission={() => window.MotionService.requestPermission()}
          onSimulateShake={() => window.MotionService.simulateShake()}
          networkStatus={networkStatus}
          safeBeacon={safeBeacon}
          onSetNetworkStatus={handleSetNetworkStatus}
        />
      );
    }

    // 5. Parent / Organization Command Center
    let initialTab = 'monitor';
    if (activeTool === 'admin-routes' || activeTool === 'org-routes') initialTab = 'routes';
    else if (activeTool === 'alerts-feed' || activeTool === 'org-incident-log') initialTab = 'alerts';
    else if (activeTool === 'guardian-contacts' || activeTool === 'admin-contacts' || activeTool === 'org-contacts') initialTab = 'contacts';
    else if (activeTool === 'admin-ai-engine') initialTab = 'ai-engine';
    else if (activeTool === 'local-help-monitor') initialTab = 'local-help';
    else if (activeTool === 'admin-users') initialTab = 'members';

    return (
      <window.AdminDashboard 
        initialTab={initialTab}
        roleId={currentRole}
        orgPermission={orgPermission}
        onBackToWorkspace={handleBackToWorkspace}
        activeScenario={activeScenario}
        scenarios={scenarios}
        onSelectScenario={handleSelectScenario}
        riskData={riskData}
        currentPos={currentPos}
        journeyState={journeyState}
        onTriggerDemoStep={handleTriggerDemoStep}
        alerts={alerts}
        onClearAlerts={handleClearAlerts}
        contacts={contacts}
        onAddContact={handleAddContact}
        onUpdateScenarioRoute={handleUpdateScenarioRoute}
        onTestEmergency={() => handleTriggerSos('DEMO_TEST_SILENT', true)}
        localHelpRequests={localHelpRequests}
        journeyTimeline={journeyTimeline}
        safeBeacon={safeBeacon}
      />
    );
  };

  // If not authenticated, render LoginPortal
  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#94A3B8', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
        <h2 style={{ color: '#FFFFFF', marginBottom: '0.5rem' }}>SafeRoute Guardian</h2>
        <p style={{ fontSize: '0.9rem' }}>Authenticating safety session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <window.LoginPortal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="srg-app-shell">
      {/* Role-Guarded Navigation Sidebar */}
      {currentView !== 'landing' && (
        <window.RoleNavigation 
          roleId={currentRole}
          orgPermission={orgPermission}
          activeTool={activeTool}
          onNavigate={handleRoleNavigate}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
          profileName={currentUser.displayName || currentUser.email || 'Traveler'}
          userEmail={currentUser.email}
        />
      )}

      <div className={currentView !== 'landing' ? 'srg-app-content' : 'srg-app-content srg-role-select-content'}>
        {/* Global Navigation Header */}
        <window.Header 
          currentView={currentView}
          currentRole={currentRole}
          orgPermission={orgPermission}
          activeTool={activeTool}
          onSelectRole={setCurrentRole}
          onBackToRoles={handleBackToRoles}
          onOpenExploreSafely={handleOpenExploreSafely}
          onOpenCommunityReviews={handleOpenCommunityReviews}
          onOpenLocalHelp={handleOpenLocalHelp}
          activeScenario={activeScenario}
          scenarios={scenarios}
          onSelectScenario={handleSelectScenario}
          safetyScore={riskData.score}
          safetyLevel={riskData.level}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          currentUser={currentUser}
        />

        {/* Main App Container */}
        <main className="srg-main-container">
          {/* Screen 1: 3-Workspace Selection Interface */}
          {currentView === 'landing' && (
            <window.LandingSection 
              onSelectRole={handleSelectRoleFromLanding}
              scenarios={scenarios}
              activeScenario={activeScenario}
              onSelectScenario={handleSelectScenario}
              currentUser={currentUser}
            />
          )}

          {/* Screen 2: Role Workspace Hub (Feature Cards Grid) */}
          {currentView === 'workspace' && (
            <window.RoleWorkspace 
              roleId={currentRole}
              orgPermission={orgPermission}
              onBackToRoles={handleBackToRoles}
              onLaunchFeature={handleLaunchFeature}
              activeScenario={activeScenario}
              riskData={riskData}
            />
          )}

          {/* Screen 3: Specific Dashboard or Intelligence Tool */}
          {currentView === 'tool' && renderActiveToolView()}
        </main>
      </div>

      {/* Onboarding Modal for First-Time Setup */}
      {showOnboarding && currentUser && (
        <window.OnboardingModal
          user={currentUser}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      )}

      {/* Full-screen Emergency Overlay when SOS / Escalation is active */}
      {journeyState.isSosActive && (
        <window.EmergencyOverlay 
          activeScenario={activeScenario}
          currentPos={currentPos}
          emergencyTriggerSource={journeyState.emergencySource}
          onCancelEmergency={handleCancelEmergency}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Deviation Check-in Modal with 15m Countdown and Fast-Forward Demo */}
      {showDeviationModal && !journeyState.isSosActive && (
        <window.DeviationModal 
          activeScenario={activeScenario}
          riskData={riskData}
          countdownSeconds={countdownSeconds}
          isFastForwarding={isFastForwarding}
          onAcknowledgeSafe={handleAcknowledgeSafe}
          onFastForwardDemo={() => setIsFastForwarding(true)}
        />
      )}

      {/* Real-time Toast Notifications */}
      <window.ToastContainer 
        toasts={toasts}
        onDismissToast={removeToast}
      />
    </div>
  );
};
