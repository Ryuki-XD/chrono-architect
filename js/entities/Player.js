/**
 * Player.js — The player entity with grid-based movement and visual tweening.
 * Movement validation and crate pushing are handled by GameScene.
 */

import { TILE_SIZE, MOVE_DURATION, DEPTH, COLORS } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX
   * @param {number} gridY
   */
  constructor(scene, gridX, gridY) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.startX = gridX;
    this.startY = gridY;

    this.isMoving = false;
    this.alive = true;

    // Visual
    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    this.sprite = scene.add.sprite(pos.x, pos.y, 'player');
    this.sprite.setDepth(DEPTH.PLAYER);
    this.sprite.setOrigin(0.5, 0.5);

    // Subtle idle animation (breathing glow)
    scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 1, to: 0.85 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Recording indicator ring (hidden by default)
    this.recordRing = scene.add.circle(pos.x, pos.y, TILE_SIZE * 0.6, COLORS.UI_RECORDING, 0);
    this.recordRing.setDepth(DEPTH.PLAYER - 1);
    this.recordRing.setStrokeStyle(2, COLORS.UI_RECORDING, 0);
  }

  // ── Movement ──────────────────────────────────────────

  /**
   * Move to new grid position with smooth tween.
   * Grid position updates immediately; sprite tweens visually.
   */
  moveTo(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
    this.isMoving = true;

    const pos = gridToPixel(gx, gy, this.scene.offsetX, this.scene.offsetY);

    this.scene.tweens.add({
      targets: [this.sprite, this.recordRing],
      x: pos.x,
      y: pos.y,
      duration: MOVE_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => { this.isMoving = false; },
    });
  }

  // ── State ─────────────────────────────────────────────

  setRecording(active) {
    const alpha = active ? 0.35 : 0;
    this.scene.tweens.add({
      targets: this.recordRing,
      fillAlpha: alpha,
      duration: 200,
    });
    this.recordRing.setStrokeStyle(2, COLORS.UI_RECORDING, active ? 0.6 : 0);

    if (active) {
      if (!this._recordPulse) {
        this._recordPulse = this.scene.tweens.add({
          targets: this.recordRing,
          scaleX: { from: 1, to: 1.3 },
          scaleY: { from: 1, to: 1.3 },
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else if (this._recordPulse) {
      this._recordPulse.destroy();
      this._recordPulse = null;
      this.recordRing.setScale(1);
    }
  }

  die() {
    if (!this.alive) return;
    this.alive = false;

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Quad.easeOut',
    });
  }

  // ── Lifecycle ─────────────────────────────────────────

  reset() {
    this.gridX = this.startX;
    this.gridY = this.startY;
    this.alive = true;
    this.isMoving = false;

    const pos = gridToPixel(this.startX, this.startY, this.scene.offsetX, this.scene.offsetY);
    this.sprite.setPosition(pos.x, pos.y);
    this.sprite.setAlpha(1);
    this.sprite.setScale(1);
    this.recordRing.setPosition(pos.x, pos.y);
    this.setRecording(false);
  }

  destroy() {
    if (this._recordPulse) this._recordPulse.destroy();
    this.recordRing.destroy();
    this.sprite.destroy();
  }
}
