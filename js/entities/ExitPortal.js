/**
 * ExitPortal.js — Level exit that activates when all conditions are met.
 * Player must overlap while portal is active to complete the level.
 */

import { DEPTH, COLORS } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class ExitPortal {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX
   * @param {number} gridY
   * @param {number} [requiredCores=0] — cores needed to activate
   */
  constructor(scene, gridX, gridY, requiredCores = 0) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.requiredCores = requiredCores;
    this.active = requiredCores === 0; // active immediately if no cores needed

    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    const tex = this.active ? 'portal_active' : 'portal_inactive';
    this.sprite = scene.add.sprite(pos.x, pos.y, tex);
    this.sprite.setDepth(DEPTH.PORTAL);
    this.sprite.setOrigin(0.5, 0.5);

    // Spin animation
    this._spinTween = scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear',
    });

    // Pulse when active
    if (this.active) this._startPulse();

    // Particle emitter (created by GameScene if desired)
    this.particles = null;
  }

  /**
   * Update portal activation based on collected cores.
   * @param {number} collected
   */
  updateActivation(collected) {
    const wasActive = this.active;
    this.active = collected >= this.requiredCores;

    if (this.active && !wasActive) {
      this.sprite.setTexture('portal_active');
      this._startPulse();
      // Flash effect
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: { from: 1.5, to: 1 },
        scaleY: { from: 1.5, to: 1 },
        duration: 400,
        ease: 'Back.easeOut',
      });
    } else if (!this.active && wasActive) {
      this.sprite.setTexture('portal_inactive');
      this._stopPulse();
    }
  }

  _startPulse() {
    if (this._pulseTween) return;
    this._pulseTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 1, to: 0.6 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _stopPulse() {
    if (this._pulseTween) {
      this._pulseTween.destroy();
      this._pulseTween = null;
      this.sprite.setAlpha(1);
    }
  }

  reset() {
    this.active = this.requiredCores === 0;
    this.sprite.setTexture(this.active ? 'portal_active' : 'portal_inactive');
    this.sprite.setScale(1);
    this.sprite.setAlpha(1);
    this._stopPulse();
    if (this.active) this._startPulse();
  }

  destroy() {
    this._stopPulse();
    if (this._spinTween) this._spinTween.destroy();
    if (this.particles) this.particles.destroy();
    this.sprite.destroy();
  }
}
