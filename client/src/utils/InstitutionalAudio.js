/**
 * Institutional Audio Engine v1.0
 * Synthesizes HUD sound effects using Web Audio API.
 */

class InstitutionalAudioEngine {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.debug = import.meta.env.VITE_DEBUG_AUDIO === 'true';
  }

  init() {
    if (this.context) return;
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      if (this.debug) {
        console.warn('Web Audio API not supported');
      }
      this.enabled = false;
    }
  }

  createOscillator(freq, type = 'sine', gainValue = 0.1) {
    if (!this.context || !this.enabled) return null;
    if (this.context.state === 'suspended') this.context.resume();

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    gain.gain.setValueAtTime(gainValue, this.context.currentTime);

    osc.connect(gain);
    gain.connect(this.context.destination);

    return { osc, gain };
  }

  playBeep(freq = 880, duration = 0.1) {
    const sound = this.createOscillator(freq, 'sine', 0.05);
    if (!sound) return;

    sound.osc.start();
    sound.gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    sound.osc.stop(this.context.currentTime + duration);
  }

  playScan() {
    const sound = this.createOscillator(440, 'sawtooth', 0.02);
    if (!sound) return;

    sound.osc.frequency.linearRampToValueAtTime(880, this.context.currentTime + 0.5);
    sound.osc.start();
    sound.gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.5);
    sound.osc.stop(this.context.currentTime + 0.5);
  }

  playSuccess() {
    this.playBeep(880, 0.1);
    setTimeout(() => this.playBeep(1100, 0.2), 100);
  }

  playWarning() {
    this.playBeep(220, 0.3);
  }

  playPulse(duration = 0.5) {
     const sound = this.createOscillator(110, 'sine', 0.03);
     if (!sound) return;
     sound.osc.start();
     sound.gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
     sound.osc.stop(this.context.currentTime + duration);
  }
}

export const institutionalAudio = new InstitutionalAudioEngine();
