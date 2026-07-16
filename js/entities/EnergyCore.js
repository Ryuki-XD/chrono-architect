/**
 * EnergyCore.js — Collectible pickup required to activate the exit portal.
 * Collected on overlap with the Player only (not clones).
 */

import { DEPTH, COLORS } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class EnergyCore {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX
   * @param {number} gridY
   */
  constructor(scene, gridX, gridY) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.collected = false;

    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    this.sprite = scene.add.sprite(pos.x, pos.y, 'energy_core');
    this.sprite.setDepth(DEPTH.ENERGY_CORE);
    this.sprite.setOrigin(0.5, 0.5);

    // Floating bob animation
    scene.tweens.add({
      targets: this.sprite,
      y: pos.y - 3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Slow rotation via scale flip
    scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 0.6 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Called by GameScene when player overlaps this core */
  collect() {
    if (this.collected) return false;
    this.collected = true;

    // Collect animation
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => { this.sprite.setVisible(false); },
    });

    this.scene.game.audioManager?.playCorePickup();
    return true;
  }

  reset() {
    this.collected = false;
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1);
    this.sprite.setScale(1);

    const pos = gridToPixel(this.gridX, this.gridY, this.scene.offsetX, this.scene.offsetY);
    this.sprite.setPosition(pos.x, pos.y);
  }

  destroy() {
    this.sprite.destroy();
  }
}
