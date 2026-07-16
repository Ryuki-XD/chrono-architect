/**
 * Clone.js — A time-clone that replays a recorded action sequence.
 * Visually distinguished by color tint and semi-transparency.
 */

import { MOVE_DURATION, DEPTH, COLORS, ACTIONS } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class Clone {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX      — starting grid X (usually same as player start)
   * @param {number} gridY      — starting grid Y
   * @param {string[]} recording — array of action strings indexed by tick
   * @param {number} colorIndex — index into COLORS.CLONE_TINTS
   */
  constructor(scene, gridX, gridY, recording, colorIndex) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.startX = gridX;
    this.startY = gridY;
    this.recording = recording;
    this.colorIndex = colorIndex;
    this.isMoving = false;
    this.alive = true;

    const tint = COLORS.CLONE_TINTS[colorIndex % COLORS.CLONE_TINTS.length];
    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);

    this.sprite = scene.add.sprite(pos.x, pos.y, 'clone');
    this.sprite.setDepth(DEPTH.CLONE);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setTint(tint);

    // Trail emitter (optional, created externally by ParticleEffects)
    this.trail = null;
  }

  // ── Replay ────────────────────────────────────────────

  /** Get the recorded action for a given tick, or WAIT if past the end */
  getAction(tick) {
    if (!this.alive) return ACTIONS.WAIT;
    if (tick >= 0 && tick < this.recording.length) {
      return this.recording[tick];
    }
    return ACTIONS.WAIT;
  }

  /** Total ticks in this clone's recording */
  get length() {
    return this.recording.length;
  }

  // ── Movement ──────────────────────────────────────────

  moveTo(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
    this.isMoving = true;

    const pos = gridToPixel(gx, gy, this.scene.offsetX, this.scene.offsetY);

    this.scene.tweens.add({
      targets: this.sprite,
      x: pos.x,
      y: pos.y,
      duration: MOVE_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => { this.isMoving = false; },
    });
  }

  /** Snap to grid position without tween (used on reset) */
  snapTo(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
    const pos = gridToPixel(gx, gy, this.scene.offsetX, this.scene.offsetY);
    this.sprite.setPosition(pos.x, pos.y);
  }

  // ── State ─────────────────────────────────────────────

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.sprite.setVisible(false);
    if (this.trail) this.trail.stop();
  }

  reset() {
    this.gridX = this.startX;
    this.gridY = this.startY;
    this.alive = true;
    this.isMoving = false;
    this.snapTo(this.startX, this.startY);
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1);
  }

  destroy() {
    if (this.trail) { this.trail.destroy(); this.trail = null; }
    this.sprite.destroy();
  }
}
