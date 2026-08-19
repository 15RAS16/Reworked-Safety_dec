/**
 * SafeRoute Guardian - Web Audio API Siren & Sound Synthesizer
 * Provides synthesized emergency sirens, check-in beeps, and audio feedback.
 */

window.AudioService = (function() {
  let audioCtx = null;
  let isMuted = false;
  let sirenOsc1 = null;
  let sirenOsc2 = null;
  let sirenGain = null;
  let sirenLfo = null;
  let isSirenPlaying = false;

  function initContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  return {
    isMuted: function() {
      return isMuted;
    },

    toggleMute: function() {
      isMuted = !isMuted;
      if (isMuted && isSirenPlaying) {
        this.stopSiren();
      }
      return isMuted;
    },

    setMuted: function(muted) {
      isMuted = muted;
      if (isMuted && isSirenPlaying) {
        this.stopSiren();
      }
    },

    /**
     * Start high-priority oscillating emergency siren (dual frequency modulation)
     */
    startSiren: function() {
      if (isMuted) return;
      initContext();
      if (!audioCtx) return;

      if (isSirenPlaying) return;

      try {
        // Master Siren Gain
        sirenGain = audioCtx.createGain();
        sirenGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        sirenGain.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 0.3);
        sirenGain.connect(audioCtx.destination);

        // Low-Frequency Oscillator (LFO) for sweeping siren pitch up and down
        sirenLfo = audioCtx.createOscillator();
        sirenLfo.frequency.setValueAtTime(0.8, audioCtx.currentTime); // 0.8 Hz sweep cycle

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(280, audioCtx.currentTime); // Pitch swing depth

        sirenLfo.connect(lfoGain);

        // Primary Siren Tone
        sirenOsc1 = audioCtx.createOscillator();
        sirenOsc1.type = 'sawtooth';
        sirenOsc1.frequency.setValueAtTime(650, audioCtx.currentTime); // Base 650 Hz
        lfoGain.connect(sirenOsc1.frequency);
        sirenOsc1.connect(sirenGain);

        // Harmonic High-Intensity Tone
        sirenOsc2 = audioCtx.createOscillator();
        sirenOsc2.type = 'square';
        sirenOsc2.frequency.setValueAtTime(880, audioCtx.currentTime); // Base 880 Hz
        lfoGain.connect(sirenOsc2.frequency);
        sirenOsc2.connect(sirenGain);

        sirenLfo.start();
        sirenOsc1.start();
        sirenOsc2.start();
        isSirenPlaying = true;
      } catch (err) {
        console.warn('AudioContext siren error:', err);
      }
    },

    /**
     * Stop emergency siren
     */
    stopSiren: function() {
      if (!isSirenPlaying) return;
      try {
        if (sirenGain && audioCtx) {
          sirenGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        }
        setTimeout(() => {
          if (sirenOsc1) { sirenOsc1.stop(); sirenOsc1.disconnect(); sirenOsc1 = null; }
          if (sirenOsc2) { sirenOsc2.stop(); sirenOsc2.disconnect(); sirenOsc2 = null; }
          if (sirenLfo) { sirenLfo.stop(); sirenLfo.disconnect(); sirenLfo = null; }
          if (sirenGain) { sirenGain.disconnect(); sirenGain = null; }
          isSirenPlaying = false;
        }, 220);
      } catch (e) {
        isSirenPlaying = false;
      }
    },

    isSirenActive: function() {
      return isSirenPlaying;
    },

    /**
     * Play check-in alert chime
     */
    playCheckinAlert: function() {
      if (isMuted) return;
      initContext();
      if (!audioCtx) return;

      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch (e) {}
    },

    /**
     * Play safe confirmation tone
     */
    playSafeConfirmation: function() {
      if (isMuted) return;
      initContext();
      if (!audioCtx) return;

      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch (e) {}
    },

    playSafeChime: function() {
      this.playSafeConfirmation();
    },

    /**
     * Play short tick sound during countdowns or holding SOS
     */
    playTick: function() {
      if (isMuted) return;
      initContext();
      if (!audioCtx) return;

      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.06);
      } catch (e) {}
    }
  };
})();
