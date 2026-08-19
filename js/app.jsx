/**
 * SafeRoute Guardian - Main Application Orchestrator (v2.0)
 * Manages Firebase Authentication state, Backend-Governed RBAC,
 * Geospatial Risk Engine evaluation, Simulation Suite, Audio Sirens,
 * and Role-Isolated UI Views (Tourist, Parent, Staff, Admin).
 */

// Global React Error Boundary Component
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SafeRoute Guardian] React UI Error Boundary Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0A192F', color: '#CBD5E1', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '100%' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛡️</div>
            <h2 style={{ color: '#FFFFFF', margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>SafeRoute Guardian</h2>
            <h3 style={{ color: '#F59E0B', margin: '0 0 1rem 0', fontSize: '1.05rem' }}>We could not start the safety platform view.</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 1.2rem 0' }}>
              A view rendering error occurred. You can reload the application or return to your permitted workspace.
            </p>
            <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '0.6rem 0.8rem', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.76rem', color: '#F87171', marginBottom: '1.2rem', wordBreak: 'break-word' }}>
              {this.state.error ? this.state.error.message : 'Unknown component error'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: '700', cursor: 'pointer' }}
              >
                🔄 Reload Application
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{ background: 'transparent', color: '#94A3B8', border: '1px solid #475569', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer' }}
              >
                Dismiss & Retry
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // 3. Journey & Scenario State (Safely initialized with defensive fallbacks)
  const initialScenarios = (window.StorageService && typeof window.StorageService.getRoutes === 'function' ? window.StorageService.getRoutes() : null) ||
    (window.SRG_DATA && window.SRG_DATA.scenarios) ||
    (window.MockData && window.MockData.scenarios) ||
    [];

  const [scenarios, setScenarios] = React.useState(initialScenarios);
  const [activeScenario, setActiveScenario] = React.useState(() => {
    return (initialScenarios && initialScenarios.length > 0) ? initialScenarios[0] : null;
  });

  const defaultCoords = [37.7950, -122.4020];
  const [currentPos, setCurrentPos] = React.useState(() => {
    return (initialScenarios && initialScenarios[0] && initialScenarios[0].originCoords) ? initialScenarios[0].originCoords : defaultCoords;
  });

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
  const [alerts, setAlerts] = React.useState(() => {
    return (window.StorageService && typeof window.StorageService.getAlerts === 'function') ? window.StorageService.getAlerts() : [];
  });
  const [contacts, setContacts] = React.useState(() => {
    return (window.StorageService && typeof window.StorageService.getContacts === 'function') ? window.StorageService.getContacts() : [];
  });
  const [journeyTimeline, setJourneyTimeline] = React.useState(() => {
    return (window.StorageService && (window.StorageService.getTimeline ? window.StorageService.getTimeline() : (window.StorageService.getJourneyTimeline ? window.StorageService.getJourneyTimeline() : []))) || [];
  });
  const [localHelpRequests, setLocalHelpRequests] = React.useState(() => {
    return (window.StorageService && typeof window.StorageService.getLocalHelpRequests === 'function') ? window.StorageService.getLocalHelpRequests() : [];
  });
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

  // Listen to Firebase Auth state changes
  React.useEffect(() => {
    if (!window.FirebaseService) {
      setAuthInitialized(true);
      return;
    }

    const unsubscribe = window.FirebaseService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthInitialized(true);

      if (user) {
        // Enforce backend-governed role and access tier
        const role = user.primaryRole || 'tourist';
        const perm = user.orgPermission || (user.accessType === 'admin' ? 'admin' : 'staff');
        setCurrentRole(role);
        setOrgPermission(perm);

        // Returning users with onboardingComplete === true skip onboarding and go directly to authorized dashboard
        if (user.onboardingComplete === true) {
          setShowOnboarding(false);
          setIsRolePickerOpen(false);
          setActiveTool('workspace');
        } else {
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(false);
        setIsRolePickerOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Motion Sensor 3-Shake Listener
  React.useEffect(() => {
    if (window.MotionService) {
      if (typeof window.MotionService.initShakeDetector === 'function') {
        window.MotionService.initShakeDetector(() => {
          handleTriggerSos('DEVICE_MOTION_SHAKE_3X');
        });
      } else if (typeof window.MotionService.init === 'function') {
        window.MotionService.init({
          onEmergency: () => handleTriggerSos('DEVICE_MOTION_SHAKE_3X')
        });
      }
    }
  }, [activeScenario]);

  // Compute Risk Engine Score Deterministically (v2.0 Point-to-Segment)
  const riskData = React.useMemo(() => {
    if (!activeScenario || !window.RiskEngine || typeof window.RiskEngine.assessRisk !== 'function') {
      return {
        score: 0,
        level: { key: 'SAFE', label: 'Safe / Low Risk', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981' },
        isEmergency: false,
        distanceToRouteCenter: 0,
        distanceOffCorridor: 0,
        factors: [],
        primaryFactor: 'Normal On-Route Travel',
        plainExplanation: 'You are traveling safely along the designated corridor.',
        recommendedAction: 'Continue along the approved route.',
        summary: 'Safe (0/100) — On-route travel.'
      };
    }

    return window.RiskEngine.assessRisk({
      travelerName: activeScenario.travelerName || 'Traveler',
      currentPos: currentPos || (activeScenario.originCoords || defaultCoords),
      routeWaypoints: activeScenario.routeWaypoints || [],
      corridorWidthMeters: activeScenario.corridorWidthMeters || 100,
      timeOffRouteSeconds: journeyState.timeOffRouteSeconds || 0,
      isMovingFarther: journeyState.isMovingFarther || false,
      isNight: journeyState.isNight || false,
      checkinStatus: journeyState.checkinStatus || 'NOT_NEEDED',
      isSosActive: journeyState.isSosActive || false,
      destinationName: activeScenario.destinationName || 'Destination'
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
    if (window.AudioService) {
      if (typeof window.AudioService.playSafeChime === 'function') {
        window.AudioService.playSafeChime();
      } else if (typeof window.AudioService.playSafeConfirmation === 'function') {
        window.AudioService.playSafeConfirmation();
      }
    }
    const tName = activeScenario ? activeScenario.travelerName : 'Traveler';
    addToast(`✓ Safety check-in acknowledged. Deviation logged as safe by ${tName}.`, 'success');
  };

  // Handler: Trigger Emergency SOS
  const handleTriggerSos = (source = 'MANUAL_SOS') => {
    const tName = activeScenario ? activeScenario.travelerName : 'Traveler';
    setEmergencyTriggerSource(source);
    setIsEmergencyOverlayOpen(true);
    setJourneyState(prev => ({ ...prev, isSosActive: true }));

    const newAlert = {
      id: 'al-' + Date.now(),
      type: '🚨 EMERGENCY SOS PANIC',
      severity: 'emergency',
      travelerName: tName,
      message: `Active emergency panic triggered via ${source.replace(/_/g, ' ')}. Coordinates broadcast to emergency network.`,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };
    if (window.StorageService && typeof window.StorageService.addAlert === 'function') {
      window.StorageService.addAlert(newAlert);
      setAlerts(window.StorageService.getAlerts());
    }

    addToast(`[Demo / Simulated] EMERGENCY ALERT: ${tName} has triggered an active SOS panic!`, 'emergency');
  };

  // Handler: Cancel Emergency
  const handleCancelEmergency = () => {
    const tName = activeScenario ? activeScenario.travelerName : 'Traveler';
    setIsEmergencyOverlayOpen(false);
    setJourneyState(prev => ({ ...prev, isSosActive: false, checkinStatus: 'NOT_NEEDED' }));

    const cancelAlert = {
      id: 'al-' + Date.now(),
      type: '✓ EMERGENCY RESOLVED',
      severity: 'info',
      travelerName: tName,
      message: `Emergency protocol cancelled by traveler after 5s hold verification.`,
      timestamp: new Date().toISOString(),
      status: 'RESOLVED'
    };
    if (window.StorageService && typeof window.StorageService.addAlert === 'function') {
      window.StorageService.addAlert(cancelAlert);
      setAlerts(window.StorageService.getAlerts());
    }

    addToast(`Emergency protocol cancelled. Safety confirmation logged.`, 'success');
  };

  // Demo Step Controller
  const handleTriggerDemoStep = (stepKey) => {
    if (!activeScenario) return;

    if (stepKey === 'SAFE_ON_ROUTE') {
      if (activeScenario.routeWaypoints && activeScenario.routeWaypoints[1]) {
        setCurrentPos(activeScenario.routeWaypoints[1]);
      }
      setJourneyState(prev => ({ ...prev, timeOffRouteSeconds: 0, isMovingFarther: false, checkinStatus: 'NOT_NEEDED', isSosActive: false }));
      setIsCheckinModalOpen(false);
      addToast('Traveler positioned safely within designated corridor buffer.', 'success');
    } else if (stepKey === 'MINOR_DEVIATION') {
      const wp = (activeScenario.routeWaypoints && activeScenario.routeWaypoints[1]) ? activeScenario.routeWaypoints[1] : defaultCoords;
      setCurrentPos([wp[0] + 0.0012, wp[1] + 0.0012]);
      setJourneyState(prev => ({ ...prev, timeOffRouteSeconds: 45, isMovingFarther: false, checkinStatus: 'NOT_NEEDED' }));
      addToast('Minor deviation simulated (~140m outside corridor). Caution advice issued.', 'warning');
    } else if (stepKey === 'SEVERE_DEVIATION') {
      const wp = (activeScenario.routeWaypoints && activeScenario.routeWaypoints[2]) ? activeScenario.routeWaypoints[2] : defaultCoords;
      setCurrentPos([wp[0] + 0.0040, wp[1] + 0.0040]);
      setJourneyState(prev => ({ ...prev, timeOffRouteSeconds: 240, isMovingFarther: true, checkinStatus: 'PENDING' }));
      setIsCheckinModalOpen(true);
      const timeoutSec = (activeScenario.escalationTimeoutMinutes || 15) * 60;
      setCheckinCountdownSeconds(timeoutSec);
      if (window.AudioService && typeof window.AudioService.playCheckinAlert === 'function') {
        window.AudioService.playCheckinAlert();
      }
      addToast('High Risk Drift simulated (~450m). "Are you safe?" check-in prompt triggered.', 'warning');
    } else if (stepKey === 'RETURN_TO_ROUTE') {
      const wp = (activeScenario.routeWaypoints && activeScenario.routeWaypoints[2]) ? activeScenario.routeWaypoints[2] : defaultCoords;
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
    if (window.FirebaseService && typeof window.FirebaseService.signOutUser === 'function') {
      await window.FirebaseService.signOutUser();
    }
    setCurrentUser(null);
    setActiveTool('workspace');
    setIsRolePickerOpen(false);
    setShowOnboarding(false);
    addToast('Signed out securely.', 'info');
  };

  // Safe fallback if active scenario is null
  const safeActiveScenario = activeScenario || {
    id: 'default-tourist',
    travelerName: 'Elena Rostova',
    travelerRole: 'International Tourist',
    avatar: '🧭',
    routeName: 'Historic Plaza → Bayfront Promenade',
    originName: 'Historic Plaza',
    destinationName: 'Bayfront Promenade',
    corridorWidthMeters: 150,
    escalationTimeoutMinutes: 15,
    routeWaypoints: [[37.7950, -122.4020], [37.7980, -122.4035], [37.8010, -122.4050], [37.8050, -122.4080]],
    originCoords: [37.7950, -122.4020],
    destinationCoords: [37.8050, -122.4080]
  };

  // Allowed modes for current user
  const allowedModes = (currentUser && currentUser.allowedModes) ? currentUser.allowedModes : [currentRole];

  // Render Authorized Views with Route Guards
  const renderActiveView = () => {
    // Role & Workspace Switcher Page (Accessible only for authorized modes)
    if (isRolePickerOpen) {
      return (
        <window.LandingSection
          activeRole={currentRole}
          orgPermission={orgPermission}
          allowedModes={allowedModes}
          onSelectRole={(r) => {
            // Strict role guard: only allow switching to backend-authorized modes
            if (currentUser && currentUser.isDemoUser) {
              setCurrentRole(r);
              setIsRolePickerOpen(false);
              setActiveTool('workspace');
            } else if (allowedModes.includes(r)) {
              setCurrentRole(r);
              setIsRolePickerOpen(false);
              setActiveTool('workspace');
            } else {
              addToast(`Access restricted: Your account is not authorized for the ${r} role.`, 'warning');
            }
          }}
          onSelectOrgPermission={(p) => {
            if (currentRole === 'organization') {
              if (currentUser && currentUser.orgPermission === 'admin') {
                setOrgPermission(p);
              } else if (currentUser && currentUser.isDemoUser) {
                setOrgPermission(p);
              } else {
                addToast('Access restricted: Staff members cannot elevate permissions to Admin.', 'warning');
              }
            }
          }}
          scenarios={scenarios}
          activeScenario={safeActiveScenario}
          onSelectScenario={(s) => {
            setActiveScenario(s);
            if (s && s.originCoords) setCurrentPos(s.originCoords);
          }}
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
            activeScenario={safeActiveScenario}
            riskData={riskData}
          />
        );
      }
      if (activeTool === 'tourist-explore' || activeTool === 'explore-safely') {
        return (
          <window.TouristExploreView
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={safeActiveScenario}
            onOpenSafeSpots={() => setActiveTool('safe-spots')}
            onOpenCommunityReviews={() => setActiveTool('community-reviews')}
            onOpenLocalHelp={() => setActiveTool('local-help')}
            onStartLiveJourney={(routeType) => setActiveTool('user-view')}
          />
        );
      }
      if (activeTool === 'user-view' || activeTool === 'tourist-journey') {
        return (
          <window.UserDashboard
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={safeActiveScenario}
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
      if (activeTool === 'safe-spots' || activeTool === 'trusted-safe-spots') {
        return <window.TrustedSafeSpots onBackToWorkspace={() => setActiveTool('workspace')} riskData={riskData} />;
      }
      if (activeTool === 'community-reviews') {
        return <window.CommunityReviewsView onBackToWorkspace={() => setActiveTool('workspace')} onOpenExploreSafely={() => setActiveTool('tourist-explore')} />;
      }
      if (activeTool === 'local-help') {
        return <window.LocalHelpNetwork onBackToWorkspace={() => setActiveTool('workspace')} activeScenario={safeActiveScenario} onOpenExploreSafely={() => setActiveTool('tourist-explore')} onOpenCommunityReviews={() => setActiveTool('community-reviews')} />;
      }
      if (activeTool === 'timeline' || activeTool === 'journey-timeline') {
        return (
          <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <button type="button" className="srg-btn srg-btn-outline srg-btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setActiveTool('workspace')}>
              ← Back to Workspace
            </button>
            <window.JourneyTimeline timeline={journeyTimeline} activeScenario={safeActiveScenario} safeBeacon={safeBeacon} />
          </div>
        );
      }
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
            activeScenario={safeActiveScenario}
            riskData={riskData}
          />
        );
      }
      if (activeTool === 'parent-dashboard' || activeTool === 'guardian-home' || activeTool === 'live-map' || activeTool === 'traveler-status' || activeTool === 'alerts' || activeTool === 'alerts-feed' || activeTool === 'contacts' || activeTool === 'guardian-contacts' || activeTool === 'timeline' || activeTool === 'journey-timeline') {
        return (
          <window.ParentDashboard
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={safeActiveScenario}
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
            activeScenario={safeActiveScenario}
            riskData={riskData}
          />
        );
      }

      // Organization Staff Tier
      if (orgPermission === 'staff') {
        if (activeTool === 'staff-dashboard' || activeTool === 'org-home' || activeTool === 'org-monitor' || activeTool === 'alerts' || activeTool === 'org-incident-log' || activeTool === 'contacts' || activeTool === 'org-contacts' || activeTool === 'timeline' || activeTool === 'journey-timeline') {
          return (
            <window.StaffDashboard
              onBackToWorkspace={() => setActiveTool('workspace')}
              activeScenario={safeActiveScenario}
              scenarios={scenarios}
              onSelectScenario={(sc) => {
                setActiveScenario(sc);
                if (sc && sc.originCoords) setCurrentPos(sc.originCoords);
              }}
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
        return (
          <window.AccessDenied
            currentRole="organization"
            orgPermission="staff"
            attemptedTool={activeTool}
            onReturnToAllowedWorkspace={() => setActiveTool('workspace')}
          />
        );
      }

      // Organization Administrator Tier
      if (orgPermission === 'admin') {
        return (
          <window.AdminDashboard
            initialTab={activeTool === 'admin-monitor' || activeTool === 'org-monitor' ? 'monitor' : (activeTool === 'routes' || activeTool === 'admin-routes' ? 'routes' : (activeTool === 'members' || activeTool === 'admin-users' ? 'members' : (activeTool === 'ai-telemetry' || activeTool === 'admin-ai-engine' ? 'ai-engine' : (activeTool === 'local-help' || activeTool === 'local-help-monitor' ? 'local-help' : (activeTool === 'timeline' ? 'timeline' : 'monitor')))))}
            roleId="organization"
            orgPermission="admin"
            onBackToWorkspace={() => setActiveTool('workspace')}
            activeScenario={safeActiveScenario}
            scenarios={scenarios}
            onSelectScenario={(sc) => {
              setActiveScenario(sc);
              if (sc && sc.originCoords) setCurrentPos(sc.originCoords);
            }}
            riskData={riskData}
            currentPos={currentPos}
            journeyState={journeyState}
            onTriggerDemoStep={handleTriggerDemoStep}
            alerts={alerts}
            onClearAlerts={() => {
              if (window.StorageService && typeof window.StorageService.clearAlerts === 'function') {
                window.StorageService.clearAlerts();
              }
              setAlerts([]);
            }}
            contacts={contacts}
            onAddContact={(c) => {
              if (window.StorageService && typeof window.StorageService.addContact === 'function') {
                const updated = window.StorageService.addContact(c);
                setContacts(updated);
              }
            }}
            onUpdateScenarioRoute={(id, updates) => {
              setActiveScenario(prev => (prev ? { ...prev, ...updates } : updates));
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

  if (!authInitialized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0A192F', color: '#94A3B8', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
        <h2 style={{ color: '#FFFFFF', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SafeRoute Guardian</h2>
        <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Initializing AI Safety Engine & Live Corridor Map...</p>
      </div>
    );
  }

  // Not Logged In -> Login Portal
  if (!currentUser) {
    return <window.LoginPortal onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <AppErrorBoundary>
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
              allowedModes={allowedModes}
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
          activeScenario={safeActiveScenario}
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
          travelerName={safeActiveScenario.travelerName}
          distanceOffRouteMeters={riskData ? riskData.distanceOffCorridor : 140}
        />

        {/* First-Time User Onboarding Modal */}
        {showOnboarding && (
          <window.OnboardingModal
            currentUser={currentUser}
            onCompleteOnboarding={(role, perm, access) => {
              setCurrentRole(role);
              setOrgPermission(perm);
              setShowOnboarding(false);
              setActiveTool('workspace');
              setIsRolePickerOpen(false);
            }}
          />
        )}

        {/* Global Toast Notifications */}
        <window.ToastContainer toasts={toastMessages} />
      </div>
    </AppErrorBoundary>
  );
};
