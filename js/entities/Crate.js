/**
 * Crate.js — Pushable box that can block lasers and activate pressure plates.
 * Pushed one tile at a time by Player or Clone. Cannot be pulled.
 */

import { DEPTH, MOVE_DURATION } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class Crate {
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

    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    this.sprite = scene.add.sprite(pos.x, pos.y, 'crate');
    this.sprite.setDepth(DEPTH.CRATE);
    this.sprite.setOrigin(0.5, 0.5);
  }

  /**
   * Push the crate to a new tile with a smooth tween.
   * Collision validation is done by GameScene before calling this.
   */
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
      ease: 'Cubic.easeOut',
      onComplete: () => { this.isMoving = false; },
    });

    this.scene.game.audioManager?.playCratePush();
  }

  /** Snap to position without animation (for reset) */
  snapTo(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
    const pos = gridToPixel(gx, gy, this.scene.offsetX, this.scene.offsetY);
    this.sprite.setPosition(pos.x, pos.y);
  }

  reset() {
    this.isMoving = false;
    this.snapTo(this.startX, this.startY);
  }

  destroy() {
    this.sprite.destroy();
  }
}
