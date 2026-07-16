/**
 * ParticleEffects.js — Reusable particle-emitter presets.
 * Each method creates and returns a pre-configured emitter on the given scene.
 */

import { COLORS, DEPTH } from '../config/GameConfig.js';

export default class ParticleEffects {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  // ── Clone Spawn Burst ─────────────────────────────────

  cloneSpawn(x, y, tint = COLORS.UI_ACCENT) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 500,
      quantity: 16,
      tint: tint,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(DEPTH.PARTICLE);
    emitter.explode(16);
    this.scene.time.delayedCall(600, () => emitter.destroy());
    return emitter;
  }

  // ── Clone Ghost Trail ─────────────────────────────────

  cloneTrail(target, tint = COLORS.UI_ACCENT) {
    const emitter = this.scene.add.particles(0, 0, 'particle_soft', {
      speed: 5,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.25, end: 0 },
      lifespan: 350,
      frequency: 80,
      tint: tint,
      blendMode: 'ADD',
      follow: target,
    });
    emitter.setDepth(DEPTH.PARTICLE);
    return emitter;
  }

  // ── Energy Core Pickup ────────────────────────────────

  corePickup(x, y) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 60, max: 160 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 450,
      quantity: 12,
      tint: COLORS.ENERGY_CORE,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(DEPTH.PARTICLE);
    emitter.explode(12);
    this.scene.time.delayedCall(500, () => emitter.destroy());
    return emitter;
  }

  // ── Portal Swirl (persistent) ─────────────────────────

  portalSwirl(x, y) {
    const emitter = this.scene.add.particles(x, y, 'particle_soft', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 800,
      frequency: 120,
      tint: [COLORS.PORTAL_ACTIVE, COLORS.UI_ACCENT],
      blendMode: 'ADD',
      angle: { min: 0, max: 360 },
    });
    emitter.setDepth(DEPTH.PARTICLE);
    return emitter;
  }

  // ── Recording Pulse Rings ─────────────────────────────

  recordingPulse(target) {
    const emitter = this.scene.add.particles(0, 0, 'particle_soft', {
      speed: { min: 20, max: 50 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 600,
      frequency: 300,
      tint: COLORS.UI_RECORDING,
      blendMode: 'ADD',
      follow: target,
    });
    emitter.setDepth(DEPTH.PARTICLE);
    return emitter;
  }

  // ── Victory Confetti ──────────────────────────────────

  confetti(x, y, width = 400) {
    const colors = [0x00e5ff, 0xe040fb, 0x00e676, 0xffd740, 0xff5252];
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speedX: { min: -100, max: 100 },
      speedY: { min: -200, max: -50 },
      gravityY: 150,
      scale: { start: 0.7, end: 0.3 },
      alpha: { start: 1, end: 0.3 },
      lifespan: 2000,
      quantity: 3,
      frequency: 50,
      tint: colors,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-width / 2, 0, width, 10),
      },
    });
    emitter.setDepth(DEPTH.PARTICLE);
    return emitter;
  }

  // ── Laser Hit ─────────────────────────────────────────

  laserHit(x, y) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 20,
      tint: COLORS.LASER,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(DEPTH.PARTICLE);
    emitter.explode(20);
    this.scene.time.delayedCall(500, () => emitter.destroy());
    return emitter;
  }

  // ── Plate Activation ──────────────────────────────────

  plateActivate(x, y) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 20, max: 60 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 350,
      quantity: 8,
      tint: COLORS.PLATE_ACTIVE,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(DEPTH.PARTICLE);
    emitter.explode(8);
    this.scene.time.delayedCall(400, () => emitter.destroy());
    return emitter;
  }
}
