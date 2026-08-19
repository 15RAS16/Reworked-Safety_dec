/**
 * SafeRoute Guardian - DeviceMotion Shake Detection Service
 * Detects 3 forceful shakes within 5 seconds to trigger Emergency Protocol.
 */

window.MotionService = (function() {
  let isSupported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  let isListening = false;
  let permissionStatus = 'unknown'; // 'granted' | 'denied' | 'not_requested' | 'unsupported'
  let shakeCount = 0;
  let lastShakeTime = 0;
  let shakeHistory = [];
  let onEmergencyCallback = null;
  let onStatusChangeCallback = null;

  // Sensitivity thresholds
  const SHAKE_THRESHOLD = 18.0; // Acceleration threshold (m/s^2)
  const SHAKE_WINDOW_MS = 5000; // 5 seconds window
  const REQUIRED_SHAKES = 3;

  function handleMotionEvent(event) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // Calculate magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    // Check if acceleration exceeds threshold (subtracting standard gravity ~9.8 if including gravity)
    const netForce = Math.abs(magnitude - 9.8);

    if (netForce > SHAKE_THRESHOLD) {
      if (now - lastShakeTime > 400) { // Debounce individual peaks
        lastShakeTime = now;
        shakeHistory.push(now);

        // Filter shakes within 5s window
        shakeHistory = shakeHistory.filter(t => (now - t) <= SHAKE_WINDOW_MS);
        shakeCount = shakeHistory.length;

        if (onStatusChangeCallback) {
          onStatusChangeCallback({
            permissionStatus,
            isListening,
            shakeCount,
            requiredShakes: REQUIRED_SHAKES
          });
        }

        if (shakeCount >= REQUIRED_SHAKES) {
          shakeHistory = [];
          shakeCount = 0;
          if (onEmergencyCallback) {
            onEmergencyCallback('SHAKE_GESTURE');
          }
        }
      }
    }
  }

  return {
    init: function(callbacks) {
      if (callbacks.onEmergency) onEmergencyCallback = callbacks.onEmergency;
      if (callbacks.onStatusChange) onStatusChangeCallback = callbacks.onStatusChange;

      if (!isSupported) {
        permissionStatus = 'unsupported';
      } else if (typeof DeviceMotionEvent.requestPermission !== 'function') {
        // Standard Android / Desktop modern browsers don't require explicit prompt
        permissionStatus = 'granted';
        this.startListening();
      } else {
        permissionStatus = 'not_requested';
      }

      this.notifyStatus();
    },

    requestPermission: function() {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(res => {
            if (res === 'granted') {
              permissionStatus = 'granted';
              this.startListening();
            } else {
              permissionStatus = 'denied';
            }
            this.notifyStatus();
          })
          .catch(err => {
            console.warn('Motion permission error:', err);
            permissionStatus = 'denied';
            this.notifyStatus();
          });
      } else {
        permissionStatus = 'granted';
        this.startListening();
        this.notifyStatus();
      }
    },

    startListening: function() {
      if (isListening) return;
      try {
        window.addEventListener('devicemotion', handleMotionEvent, false);
        isListening = true;
      } catch (e) {
        console.warn('Cannot attach motion listener', e);
      }
    },

    stopListening: function() {
      if (!isListening) return;
      window.removeEventListener('devicemotion', handleMotionEvent, false);
      isListening = false;
    },

    notifyStatus: function() {
      if (onStatusChangeCallback) {
        onStatusChangeCallback({
          isSupported: isSupported,
          permissionStatus: permissionStatus,
          isListening: isListening,
          shakeCount: shakeCount,
          requiredShakes: REQUIRED_SHAKES
        });
      }
    },

    getStatus: function() {
      return {
        isSupported: isSupported,
        permissionStatus: permissionStatus,
        isListening: isListening,
        shakeCount: shakeCount,
        requiredShakes: REQUIRED_SHAKES
      };
    },

    /**
     * Simulation tool for demo/desktop testing
     */
    simulateShake: function() {
      const now = Date.now();
      shakeHistory.push(now);
      shakeHistory = shakeHistory.filter(t => (now - t) <= SHAKE_WINDOW_MS);
      shakeCount = shakeHistory.length;

      this.notifyStatus();

      if (shakeCount >= REQUIRED_SHAKES) {
        shakeHistory = [];
        shakeCount = 0;
        if (onEmergencyCallback) {
          onEmergencyCallback('SHAKE_GESTURE');
        }
      }
    }
  };
})();
