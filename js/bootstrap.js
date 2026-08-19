/**
 * SafeRoute Guardian - Application Bootstrap & Startup Coordinator
 * Reliably validates required globals, manages dependency polling, mounts the React root,
 * and attaches global runtime error handlers to prevent blank screens.
 */

(function() {
  'use strict';

  var REQUIRED_DEPENDENCIES = [
    { name: 'React', check: function() { return !!window.React; } },
    { name: 'ReactDOM', check: function() { return !!window.ReactDOM && typeof window.ReactDOM.createRoot === 'function'; } },
    { name: 'App', check: function() { return typeof window.App === 'function'; } },
    { name: 'SRG_DATA / MockData', check: function() { return !!(window.SRG_DATA || window.MockData); } },
    { name: 'StorageService', check: function() { return !!window.StorageService; } },
    { name: 'RiskEngine', check: function() { return !!window.RiskEngine && typeof window.RiskEngine.assessRisk === 'function'; } },
    { name: 'FirebaseService', check: function() { return !!window.FirebaseService; } },
    { name: 'ConfigService', check: function() { return !!window.ConfigService; } },
    { name: 'AudioService', check: function() { return !!window.AudioService; } },
    { name: 'MotionService', check: function() { return !!window.MotionService; } }
  ];

  var POLL_INTERVAL_MS = 75;
  var TIMEOUT_MS = 10000;
  var startTime = Date.now();
  var isMounted = false;
  var pollTimer = null;

  function getMissingDependencies() {
    var missing = [];
    for (var i = 0; i < REQUIRED_DEPENDENCIES.length; i++) {
      var dep = REQUIRED_DEPENDENCIES[i];
      try {
        if (!dep.check()) {
          missing.push(dep.name);
        }
      } catch (e) {
        missing.push(dep.name + ' (' + e.message + ')');
      }
    }
    return missing;
  }

  function renderFallbackErrorScreen(title, message, details) {
    var rootElement = document.getElementById('root');
    if (!rootElement) return;

    var detailHtml = '';
    if (details && details.length > 0) {
      detailHtml = '<div style="background:#0F172A; border:1px solid #334155; border-radius:8px; padding:0.85rem 1rem; margin:1.2rem 0; text-align:left; font-family:\'JetBrains Mono\', monospace; font-size:0.78rem; color:#F87171; max-width:540px; word-break:break-word;">' +
        '<strong>Diagnostic Details:</strong><ul style="margin:0.4rem 0 0 1.2rem; padding:0;">' +
        details.map(function(d) { return '<li>' + d + '</li>'; }).join('') +
        '</ul></div>';
    }

    rootElement.innerHTML = [
      '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; background:#0A192F; color:#CBD5E1; font-family:\'Plus Jakarta Sans\', sans-serif; text-align:center; padding:1.5rem; box-sizing:border-box;">',
        '<div style="background:#1E293B; border:1px solid #334155; border-radius:20px; padding:2rem 2.5rem; max-width:600px; width:100%; box-shadow:0 12px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center;">',
          '<div style="font-size:3rem; margin-bottom:0.75rem;">🛡️</div>',
          '<h1 style="color:#FFFFFF; font-size:1.5rem; font-weight:800; margin:0 0 0.5rem 0;">SafeRoute Guardian</h1>',
          '<h2 style="color:#F59E0B; font-size:1.05rem; font-weight:700; margin:0 0 0.75rem 0;">' + (title || 'We could not start the safety platform.') + '</h2>',
          '<p style="color:#94A3B8; font-size:0.88rem; line-height:1.5; margin:0 0 1rem 0; max-width:480px;">' + (message || 'Application resources could not load in time. This may be caused by network latency or a missing dependency.') + '</p>',
          detailHtml,
          '<div style="display:flex; gap:0.75rem; margin-top:0.5rem; flex-wrap:wrap; justify-content:center;">',
            '<button type="button" onclick="window.location.reload()" style="background:#2563EB; color:#FFFFFF; border:none; border-radius:8px; padding:0.65rem 1.4rem; font-size:0.88rem; font-weight:700; cursor:pointer; font-family:inherit; transition:background 0.2s;">🔄 Reload Application</button>',
            '<button type="button" onclick="localStorage.clear(); window.location.reload();" style="background:transparent; color:#94A3B8; border:1px solid #475569; border-radius:8px; padding:0.65rem 1.2rem; font-size:0.84rem; cursor:pointer; font-family:inherit;">Clear Cache & Reset</button>',
          '</div>',
          '<div style="margin-top:1.5rem; font-size:0.74rem; color:#64748B; border-top:1px solid #334155; padding-top:0.8rem; width:100%;">',
            'SafeRoute Guardian AI Corridor & Geofence Safety Platform • Demo & Security Support Active',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function attemptMount() {
    if (isMounted) return;

    var missing = getMissingDependencies();

    if (missing.length === 0) {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }

      var rootElement = document.getElementById('root');
      if (rootElement && window.App && window.ReactDOM && typeof window.ReactDOM.createRoot === 'function') {
        try {
          isMounted = true;
          var root = window.ReactDOM.createRoot(rootElement);
          root.render(window.React.createElement(window.App));
          console.info('[SafeRoute Guardian] Application successfully mounted.');
        } catch (err) {
          isMounted = false;
          console.error('[SafeRoute Guardian] Mount exception:', err);
          renderFallbackErrorScreen(
            'Application Runtime Initialization Failed',
            'An error occurred during component rendering.',
            [err.message || 'Unknown render error']
          );
        }
      }
      return;
    }

    var elapsed = Date.now() - startTime;
    if (elapsed >= TIMEOUT_MS) {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      console.error('[SafeRoute Guardian] Bootstrap timed out after ' + TIMEOUT_MS + 'ms. Missing dependencies:', missing);
      renderFallbackErrorScreen(
        'We could not start the safety platform.',
        'Required application modules did not finish loading before the timeout expired.',
        missing.map(function(m) { return 'Missing module: ' + m; })
      );
    }
  }

  // Attach global error and unhandled rejection listeners
  window.addEventListener('error', function(event) {
    console.error('[SafeRoute Guardian] Global Error Caught:', event.message, event.filename, event.lineno);
    if (!isMounted) {
      renderFallbackErrorScreen(
        'We could not start the safety platform.',
        'A runtime error prevented the application from starting.',
        [event.message ? ('Error: ' + event.message) : 'Script loading error']
      );
    }
  });

  window.addEventListener('unhandledrejection', function(event) {
    console.error('[SafeRoute Guardian] Unhandled Promise Rejection:', event.reason);
    if (!isMounted) {
      renderFallbackErrorScreen(
        'We could not start the safety platform.',
        'An unhandled asynchronous rejection occurred during initialization.',
        [event.reason ? (event.reason.message || String(event.reason)) : 'Promise rejection']
      );
    }
  });

  // Start polling
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      pollTimer = setInterval(attemptMount, POLL_INTERVAL_MS);
      attemptMount();
    });
  } else {
    pollTimer = setInterval(attemptMount, POLL_INTERVAL_MS);
    attemptMount();
  }

  window.SRG_Bootstrap = {
    isReady: function() { return isMounted; },
    getMissing: getMissingDependencies,
    renderError: renderFallbackErrorScreen
  };
})();
