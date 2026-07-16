/**
 * AudioManager.js — Procedural audio synthesis using Web Audio API.
 * Generates all game sounds programmatically — no external audio files.
 */

export default class AudioManager {
  constructor() {
    this.ctx = null;           // AudioContext (created on first user gesture)
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.musicMuted = false;
    this.sfxMuted = false;

    this._musicNodes = [];     // active music oscillators
    this._musicPlaying = false;
  }

  // ── Initialisation ────────────────────────────────────

  /** Must be called from a user-gesture handler (click / keydown) */
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicMuted ? 0 : this.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxMuted ? 0 : this.sfxVolume;
    this.sfxGain.connect(this.masterGain);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ── Volume Controls ───────────────────────────────────

  setMusicVolume(v) {
    this.musicVolume = v;
    if (this.musicGain) this.musicGain.gain.value = this.musicMuted ? 0 : v;
  }

  setSfxVolume(v) {
    this.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxMuted ? 0 : v;
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    if (this.musicGain) this.musicGain.gain.value = this.musicMuted ? 0 : this.musicVolume;
  }

  toggleSfxMute() {
    this.sfxMuted = !this.sfxMuted;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxMuted ? 0 : this.sfxVolume;
  }

  applySettings(settings) {
    this.musicVolume = settings.musicVolume ?? this.musicVolume;
    this.sfxVolume = settings.sfxVolume ?? this.sfxVolume;
    this.musicMuted = settings.musicMuted ?? this.musicMuted;
    this.sfxMuted = settings.sfxMuted ?? this.sfxMuted;
    if (this.musicGain) this.musicGain.gain.value = this.musicMuted ? 0 : this.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxMuted ? 0 : this.sfxVolume;
  }

  // ── SFX ───────────────────────────────────────────────

  /** Short noise burst — footstep */
  playFootstep() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.06;

    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filt = this.ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    src.connect(filt).connect(gain).connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur);
  }

  /** Sliding tone sweep — door open */
  playDoorOpen() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /** Reverse sweep — door close */
  playDoorClose() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /** Shimmer chord — clone creation */
  playCloneCreate() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, t + i * 0.05 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(t + i * 0.05);
      osc.stop(t + 0.7);
    });
  }

  /** Ascending arpeggio — level complete */
  playLevelComplete() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;

      const gain = this.ctx.createGain();
      const start = t + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.connect(gain).connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  }

  /** Bright bell — energy core pickup */
  playCorePickup() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 2400;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain).connect(this.sfxGain);
    osc2.connect(gain);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  /** Click — switch toggle */
  playSwitchToggle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** Plate press */
  playPlatePress() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Crate push thud */
  playCratePush() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.1;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 400;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    src.connect(filt).connect(gain).connect(this.sfxGain);
    src.start(t);
  }

  /** Zap — laser death */
  playLaserDeath() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  /** UI blip — menu hover / select */
  playUIBlip() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /** UI confirm */
  playUIConfirm() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    [880, 1100].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.12);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.15);
    });
  }

  // ── Background Music (Generative Ambient) ─────────────

  startMusic() {
    if (!this.ctx || this._musicPlaying) return;
    this._musicPlaying = true;

    // Pad layer: slow-evolving filtered drones
    const notes = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow LFO for subtle frequency wobble
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.15 + i * 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain).connect(osc.frequency);

      // Volume envelope with LFO
      const volLfo = this.ctx.createOscillator();
      volLfo.type = 'sine';
      volLfo.frequency.value = 0.08 + i * 0.03;
      const volLfoGain = this.ctx.createGain();
      volLfoGain.gain.value = 0.02;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.035;
      volLfo.connect(volLfoGain).connect(gain.gain);

      // Low-pass filter for warmth
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 600 + i * 100;
      filt.Q.value = 0.5;

      osc.connect(filt).connect(gain).connect(this.musicGain);
      osc.start();
      lfo.start();
      volLfo.start();

      this._musicNodes.push(osc, lfo, volLfo);
    });
  }

  stopMusic() {
    this._musicNodes.forEach(n => { try { n.stop(); } catch (_) {} });
    this._musicNodes = [];
    this._musicPlaying = false;
  }

  // ── Cleanup ───────────────────────────────────────────

  destroy() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
