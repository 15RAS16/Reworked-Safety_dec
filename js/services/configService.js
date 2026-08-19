/**
 * SafeRoute Guardian - Safe Configuration Service (v2.0)
 * Reads public frontend configuration safely from window environment variables or meta tags.
 * Controls isolated Demo Mode (VITE_ENABLE_DEMO_MODE) and ensures no secrets or fake auth are exposed in production.
 * 
 * SECURITY RULES:
 * - Never log secret keys or tokens.
 * - Never store private keys or service account credentials in frontend files.
 */

window.ConfigService = (function() {
  const env = window.__ENV__ || window.FIREBASE_CONFIG || {};

  const PLACEHOLDER_STRINGS = [
    'your_public_firebase_web_api_key',
    'your_project_id',
    'your_messaging_sender_id',
    'your_firebase_app_id',
    'your_measurement_id',
    'YOUR_API_KEY_HERE',
    'PLACEHOLDER'
  ];

  function isPlaceholder(value) {
    if (!value || typeof value !== 'string') return true;
    const trimmed = value.trim();
    if (trimmed.length < 6) return true;
    return PLACEHOLDER_STRINGS.some(p => trimmed.toLowerCase().includes(p.toLowerCase()));
  }

  const apiKey = env.VITE_FIREBASE_API_KEY || env.apiKey || '';
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN || env.authDomain || '';
  const projectId = env.VITE_FIREBASE_PROJECT_ID || env.projectId || '';
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || env.storageBucket || '';
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.messagingSenderId || '';
  const appId = env.VITE_FIREBASE_APP_ID || env.appId || '';
  const measurementId = env.VITE_FIREBASE_MEASUREMENT_ID || env.measurementId || '';

  // Demo mode is explicitly controlled by build-time variable VITE_ENABLE_DEMO_MODE or default true for development evaluation
  const enableDemoMode = env.VITE_ENABLE_DEMO_MODE === 'true' || env.enableDemoMode === true || env.VITE_ENABLE_DEMO_MODE === undefined;

  const isConfigured =
    apiKey && !isPlaceholder(apiKey) &&
    projectId && !isPlaceholder(projectId) &&
    appId && !isPlaceholder(appId);

  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId
  };

  return {
    isConfigured: function() {
      return !!isConfigured;
    },

    getFirebaseConfig: function() {
      return firebaseConfig;
    },

    isDemoModeEnabled: function() {
      return !!enableDemoMode;
    },

    isSetupRequired: function() {
      return !isConfigured && !enableDemoMode;
    },

    getStatusLabel: function() {
      if (isConfigured) {
        return '🔥 Firebase Production Auth Active';
      }
      if (enableDemoMode) {
        return '⚡ Demo / Simulated Mode Active (Isolated)';
      }
      return '⚠️ Firebase Setup Required';
    }
  };
})();
