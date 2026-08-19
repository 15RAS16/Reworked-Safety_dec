/**
 * SafeRoute Guardian - Main Application Orchestrator (v2.0)
 * Manages Firebase Authentication state, Backend-Governed RBAC,
 * Geospatial Risk Engine evaluation, Simulation Suite, Audio Sirens,
 * and Role-Isolated UI Views (Tourist, Parent, Staff, Admin).
 */

window.App = function() {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authInitialized, setAuthInitialized] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // 2. Role & Permissions State (Governed by Backend User Profile)
  const [currentRole, setCurrentRole] = React.useState('tourist'); // 'tourist' | 'parent' | 'organization'
  const [orgPermission, setOrgPermission] = React.useState('staff'); // 'staff' | 'admin'
  const [activeTool, setActiveTool] = React.useState('workspace');
  const [isRolePickerOpen, setIsRolePickerOpen] = React.useState(false);

  // 3. Journey & Scenario State
  const scenarios = window.MockData.scenarios;
  const [activeScenario, setActiveScenario] = React.useState(scenarios[0]); // Elena / Aarav / Maya
  const [currentPos, setCurrentPos] = React.useState(scenarios[0].originCoords);
  const [journeyState, setJourneyState] = React.useState({
    status: 'IN_TRANSIT',
    etaMinutes: 14,
    speedKmh: 4.2,
    timeOffRouteSeconds: 0,
    isMovingFarther: false,
    isNight: false,
    checkinStatus: 'NOT_NEEDED',
    isSosActive: false
  });

  // 4. Alerts, Contacts, Timeline, and Local Help State
  const [alerts, setAlerts] = React.useState(() => window.StorageService.getAlerts());
  const [contacts, setContacts] = React.useState(() => window.StorageService.getContacts());
  const [journeyTimeline, setJourneyTimeline] = React.useState(() => window.StorageService.getTimeline());
  const [localHelpRequests, setLocalHelpRequests] = React.useState(() => window.StorageService.getLocalHelpRequests());
  const [safeBeacon, setSafeBeacon] = React.useState(null);

  // 5. Emergency Overlays & Check-in Modals
  const [isEmergencyOverlayOpen, setIsEmergencyOverlayOpen] = React.useState(false);
  const [emergencyTriggerSource, setEmergencyTriggerSource] = React.useState('MANUAL_SOS');
  const [isCheckinModalOpen, setIsCheckinModalOpen] = React.useState(false);
  const [checkinCountdownSeconds, setCheckinCountdownSeconds] = React.useState(900); // 15 mins default
  const [toastMessages, setToastMessages] = React.useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToastMessages(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => {
      setToastMessages(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Listen to Firebase Auth
  React.useEffect(() => {
    const unsubscribe = window.FirebaseService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthInitialized(true);

      if (user) {
        // Enforce backend-governed role
        const role = user.primaryRole || 'tourist';
        const perm = user.orgPermission || 'staff';
        setCurrentRole(role);
        setOrgPermission(perm);

        if (user.onboardingComplete === false) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } else {
        setShowOnboarding(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Motion Sensor 3-Shake Listener
  React.useEffect(() => {
    if (window.MotionService) {
      window.MotionService.initShakeDetector(() => {
        handleTriggerSos('DEVICE_MOTION_SHAKE_3X');
      });
    }
  }, []);

  // Compute Risk Engine Score Deterministically (v2.0 Point-to-Segment)
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

  // Check-in countdown timer
  React.useEffect(() => {
    let timer = null;
    if (isCheckinModalOpen && checkinCountdownSeconds > 0) {
      timer = setInterval(() => {
        setCheckinCountdownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Expired -> Trigger Emergency Escalation
            handleCheckinExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCheckinModalOpen, checkinCountdownSeconds]);

  // Handler: Check-in Expired
  const handleCheckinExpired = () => {
    setIsCheckinModalOpen(false);
    setJourneyState(prev => ({ ...prev, checkinStatus: 'EXPIRED', isSosActive: true }));
    setIsEmergencyOverlayOpen(true);
    setEmergencyTriggerSource('UNRESPONSIVE_CHECKIN_TIMEOUT');
    addToast('⚠️ Check-in window expired without response. Emergency Escalation Protocol activated!', 'emergency');
  };

  // Handler: Resolve Check-in ("I'm Safe")
  const handleResolveCheckin = () => {
    setIsCheckinModalOpen(false);
    setJourneyState(prev => ({ ...prev, checkinStatus: 'ACKNOWLEDGED' }));
    window.AudioService && window.AudioService.playSafeChime();
    addToast(`✓ Safety check-in acknowledged. Deviation logged as safe by ${activeScenario.travelerName}.`, 'success');
  };

  // Handler: Trigger Emergency SOS
  const handleTriggerSos = (source = 'MANUAL_SOS') => {
    setEmergencyTriggerSource(source);
    setIsEmergencyOverlayOpen(true);
    setJourneyState(prev => ({ ...prev, isSosActive: true }));

    const newAlert = {
      id: 'al-' + Date.now(),
      type: '🚨 EMERGENCY SOS PANIC',
      severity: 'emergency',
      travelerName: activeScenario.travelerName,
      message: `Active emergency panic triggered via ${source.replace('_', ' ')}. Coordinates broadcast to emergency network.`,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };
    const updated = window.StorageService.addAlert(newAlert);
    setAlerts(updated);

    addToast(`[Demo / Simulated] EMERGENCY ALERT: ${activeScenario.travelerName} has triggered an active SOS panic!`, 'emergency');
  };

  // Handler: Cancel Emergency
  const handleCancelEmergency = () => {
    setIsEmergencyOverlayOpen(false);
    setJourneyState(prev => ({ ...prev, isSosActive: false, checkinStatus: 'NOT_NEEDED' }));

    const cancelAlert = {
      id: 'al-' + Date.now(),
      type: '✓ EMERGENCY RESOLVED',
      severity: 'info',
      travelerName: activeScenario.travelerName,
      message: `Emergency protocol cancelled by traveler after 5s hold verification.`,
      timestamp: new Date().toISOString(),
      status: 'RESOLVED'
    };
    const updated = window.StorageService.addAlert(cancelAlert);
    setAlerts(updated);

    addToast(`Emergency protocol cancelled. Safety confirmation logged.`, 'success');
  };

  // Demo Step Controller
  const handleTriggerDemoStep = (stepKey) => {
    if (stepKey === 'SAFE_ON_ROUTE') {
      setCurrentPos(activeScenario.routeWaypoints[1]);
      setJourneyState(prev => ({ ...prev, timeOffRouteSeconds: 0, isMovingFarther: false, checkinStatus: 'NOT_NEEDED', isSosActive: false }));
      setIsCheckinModalOpen(false);
      addToast('Traveler positioned safely within designated corridor buffer.', 'success');
    } else if (stepKey === 'MINOR_DEVIATION') {
      // 140m off route
      const wp = activeScenario.routeWaypoints[1];
      setCurrentPos([wp[0] + 0.0012, wp[1] + 0.0012]);
      setJourneyState(prev => ({ ...prev, timeOffRouteSeconds: 45, isMovingFarther: false, checkinStatus: 'NOT_NEEDED' }));
      addToast('Minor deviation simulated (~140m outside corridor). Caution advice issued.', 'warning');
    } else if (stepKey === 'SEVERE_DEVIATION') {
      // 450m off route
      const wp = activeScenario.routeWaypoints[2];
      setCurrentPos([wp[0] + 0.0040, wp[1] + 0.0040]);
      setJourneyState(prev => ({ ...prev, timeOffRouteSeconds: 240, isMovingFarther: true, checkinStatus: 'PENDING' }));
      setIsCheckinModalOpen(true);
      setCheckinCountdownSeconds(activeScenario.escalationTimeoutMinutes * 60);
      window.AudioService && window.AudioService.playCheckinAlert();
      addToast('High Risk Drift simulated (~450m). "Are you safe?" check-in prompt triggered.', 'warning');
    } else if (stepKey === 'RETURN_TO_ROUTE') {
      const wp = activeScenario.routeWaypoints[2];
      setCurrentPos([wp[0] + 0.0004, wp[1] + 0.0004]);
      setJourneyState(prev => ({ ...prev, timeOffRouteSeconds: 15, isMovingFarther: false, checkinStatus: 'ACKNOWLEDGED' }));
      setIsCheckinModalOpen(false);
      addToast('Traveler heading vector returning toward approved corridor.', 'success');
    } else if (stepKey === 'FAST_FORWARD_TIMEOUT') {
      setIsCheckinModalOpen(true);
      setCheckinCountdownSeconds(20);
      addToast('⚡ Timeout accelerated to 20 seconds for presentation evaluation.', 'info');
    } else if (stepKey === 'SOS_TRIGGER') {
      handleTriggerSos('ADMIN_SIMULATION_TRIGGER');
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    await window.FirebaseService.signOutUser();
    setActiveTool('workspace');
    setIsRolePickerOpen(false);
    addToast('Signed out securely.', 'info');
  };

  if (!authInitialized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0A192F', color: '#94A3B8', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
        <h2 style={{ color: '#FFFFFF', margin: 0 }}>SafeRoute Guardian</h2>
        <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Initializing AI Safety Engine & Live Corridor Map...</p>
      </div>
    );
  }

  // Not Logged In -> Login Portal
  if (!currentUser) {
    return <window.LoginPortal onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // Render Authorized Views with Route Guards
  const renderActiveView = () => {
    if (isRolePickerOpen) {
      return (
        <window.LandingSection
          activeRole={currentRole}
          orgPermission={orgPermission}
          onSelectRole={(r) => { setCurrentRole(r); setIsRolePickerOpen(false); setActiveTool('workspace'); }}
          onSelectOrgPermission={(p) => setOrgPermission(p)}
          scenarios={scenarios}
          activeScenario={activeScenario}
          onSelectScenario={(s) => setActiveScenario(s)}
        />
      );
    }

    // 1. Tourist Mode
    if (currentRole === 'tourist') {
      if (activeTool === 'workspace') {
        return (
          <window.RoleWorkspace
            currentRole="tourist"
            onSelectFeature={(toolId) => setActiveTool(toolId)}
            activeScenario={activeScenario}
            riskData={riskData}
          />
        );
      }
      if (activeTool === 'tourist-explore') {
        return (
          <window.TouristExploreView
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={activeScenario}
            onOpenSafeSpots={() => setActiveTool('safe-spots')}
            onOpenCommunityReviews={() => setActiveTool('community-reviews')}
            onOpenLocalHelp={() => setActiveTool('local-help')}
            onStartLiveJourney={(routeType) => setActiveTool('user-view')}
          />
        );
      }
      if (activeTool === 'user-view') {
        return (
          <window.UserDashboard
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={activeScenario}
            riskData={riskData}
            currentPos={currentPos}
            journeyState={journeyState}
            isCheckinModalOpen={isCheckinModalOpen}
            onResolveCheckin={handleResolveCheckin}
            onTriggerSos={handleTriggerSos}
            onTestEmergency={() => handleTriggerSos('SILENT_TEST')}
            safeBeacon={safeBeacon}
          />
        );
      }
      if (activeTool === 'safe-spots') {
        return <window.TrustedSafeSpots onBackToWorkspace={() => setActiveTool('workspace')} />;
      }
      if (activeTool === 'community-reviews') {
        return <window.CommunityReviewsView onBackToWorkspace={() => setActiveTool('workspace')} />;
      }
      if (activeTool === 'local-help') {
        return <window.LocalHelpNetwork onBackToWorkspace={() => setActiveTool('workspace')} />;
      }
      if (activeTool === 'timeline') {
        return (
          <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setActiveTool('workspace')}>
              ← Back to Workspace
            </button>
            <window.JourneyTimeline timeline={journeyTimeline} activeScenario={activeScenario} safeBeacon={safeBeacon} />
          </div>
        );
      }
      // Access Denied for unauthorized tools in tourist mode
      return (
        <window.AccessDenied
          currentRole="tourist"
          attemptedTool={activeTool}
          onReturnToAllowedWorkspace={() => setActiveTool('workspace')}
        />
      );
    }

    // 2. Parent / Guardian Mode
    if (currentRole === 'parent') {
      if (activeTool === 'workspace') {
        return (
          <window.RoleWorkspace
            currentRole="parent"
            onSelectFeature={(toolId) => setActiveTool(toolId)}
            activeScenario={activeScenario}
            riskData={riskData}
          />
        );
      }
      if (activeTool === 'parent-dashboard' || activeTool === 'alerts' || activeTool === 'contacts' || activeTool === 'timeline') {
        return (
          <window.ParentDashboard
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={activeScenario}
            riskData={riskData}
            currentPos={currentPos}
            journeyState={journeyState}
            safeBeacon={safeBeacon}
            alerts={alerts}
            contacts={contacts}
            journeyTimeline={journeyTimeline}
            onTriggerSos={handleTriggerSos}
          />
        );
      }
      return (
        <window.AccessDenied
          currentRole="parent"
          attemptedTool={activeTool}
          onReturnToAllowedWorkspace={() => setActiveTool('workspace')}
        />
      );
    }

    // 3. Organization Mode
    if (currentRole === 'organization') {
      if (activeTool === 'workspace') {
        return (
          <window.RoleWorkspace
            currentRole="organization"
            orgPermission={orgPermission}
            onSelectFeature={(toolId) => setActiveTool(toolId)}
            activeScenario={activeScenario}
            riskData={riskData}
          />
        );
      }

      // Organization Staff
      if (orgPermission === 'staff') {
        if (activeTool === 'staff-dashboard' || activeTool === 'alerts' || activeTool === 'timeline') {
          return (
            <window.StaffDashboard
              onBackToWorkspace={() => setActiveTool('workspace')}
              activeScenario={activeScenario}
              scenarios={scenarios}
              onSelectScenario={(sc) => setActiveScenario(sc)}
              riskData={riskData}
              currentPos={currentPos}
              journeyState={journeyState}
              alerts={alerts}
              contacts={contacts}
              journeyTimeline={journeyTimeline}
              onTriggerSos={handleTriggerSos}
              safeBeacon={safeBeacon}
            />
          );
        }
        // Staff attempted admin tools -> Access Denied!
        return (
          <window.AccessDenied
            currentRole="organization"
            orgPermission="staff"
            attemptedTool={activeTool}
            onReturnToAllowedWorkspace={() => setActiveTool('workspace')}
          />
        );
      }

      // Organization Administrator
      if (orgPermission === 'admin') {
        return (
          <window.AdminDashboard
            initialTab={activeTool === 'admin-monitor' ? 'monitor' : activeTool}
            roleId="organization"
            orgPermission="admin"
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={activeScenario}
            scenarios={scenarios}
            onSelectScenario={(sc) => setActiveScenario(sc)}
            riskData={riskData}
            currentPos={currentPos}
            journeyState={journeyState}
            onTriggerDemoStep={handleTriggerDemoStep}
            alerts={alerts}
            onClearAlerts={() => { window.StorageService.clearAlerts(); setAlerts([]); }}
            contacts={contacts}
            onAddContact={(c) => { const updated = window.StorageService.addContact(c); setContacts(updated); }}
            onUpdateScenarioRoute={(id, updates) => {
              setActiveScenario(prev => ({ ...prev, ...updates }));
            }}
            onTestEmergency={() => handleTriggerSos('ADMIN_SILENT_TEST')}
            localHelpRequests={localHelpRequests}
            journeyTimeline={journeyTimeline}
            safeBeacon={safeBeacon}
          />
        );
      }
    }

    return (
      <window.AccessDenied
        currentRole={currentRole}
        attemptedTool={activeTool}
        onReturnToAllowedWorkspace={() => setActiveTool('workspace')}
      />
    );
  };

  return (
    <div className="srg-app-shell">
      {/* Global Header */}
      <window.Header
        currentRole={currentRole}
        orgPermission={orgPermission}
        safetyLevel={riskData ? riskData.level.key : 'SAFE'}
        onSignOut={handleSignOut}
        currentUser={currentUser}
        onOpenRoles={() => setIsRolePickerOpen(!isRolePickerOpen)}
      />

      {/* Main Workspace Layout with Sidebar & Content */}
      <div className="srg-main-layout">
        {!isRolePickerOpen && (
          <window.RoleNavigation
            currentRole={currentRole}
            orgPermission={orgPermission}
            activeTool={activeTool}
            onSelectTool={(toolId) => setActiveTool(toolId)}
            onOpenRoles={() => setIsRolePickerOpen(true)}
          />
        )}

        <main className="srg-content-area">
          {renderActiveView()}
        </main>
      </div>

      {/* Full-Screen Emergency Overlay */}
      <window.EmergencyOverlay
        isOpen={isEmergencyOverlayOpen}
        onCancelEmergency={handleCancelEmergency}
        activeScenario={activeScenario}
        currentPos={currentPos}
        riskData={riskData}
        triggerSource={emergencyTriggerSource}
      />

      {/* 15-Minute Deviation Check-in Modal */}
      <window.DeviationModal
        isOpen={isCheckinModalOpen}
        onResolveSafe={handleResolveCheckin}
        onTriggerEmergency={() => handleTriggerSos('CHECKIN_PROMPT_EMERGENCY')}
        countdownSeconds={checkinCountdownSeconds}
        travelerName={activeScenario.travelerName}
        distanceOffRouteMeters={riskData ? riskData.distanceOffCorridor : 140}
      />

      {/* Onboarding Modal for first login */}
      {showOnboarding && (
        <window.OnboardingModal
          currentUser={currentUser}
          onCompleteOnboarding={(role, perm) => {
            setCurrentRole(role);
            setOrgPermission(perm);
            setShowOnboarding(false);
            setActiveTool('workspace');
          }}
        />
      )}

      {/* Global Toast Notifications */}
      <window.ToastContainer toasts={toastMessages} />
    </div>
  );
};
