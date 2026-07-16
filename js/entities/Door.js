/**
 * Door.js — Barrier that opens/closes based on signal state.
 * Blocks movement when closed; passable when open.
 */

import { DEPTH, COLORS, TILE_SIZE } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class Door {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX
   * @param {number} gridY
   * @param {string} signalId — signal that controls this door
   * @param {number} [color]  — optional tint
   */
  constructor(scene, gridX, gridY, signalId, color) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.signalId = signalId;
    this.isOpen = false;

    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    this.sprite = scene.add.sprite(pos.x, pos.y, 'door_closed');
    this.sprite.setDepth(DEPTH.DOOR);
    this.sprite.setOrigin(0.5, 0.5);
    if (color) this.sprite.setTint(color);

    this._color = color || null;
  }

  /**
   * Called when the signal state changes.
   * @param {boolean} active
   */
  onSignal(active) {
    if (active && !this.isOpen) {
      this._open();
    } else if (!active && this.isOpen) {
      this._close();
    }
  }

  /** Is this door currently blocking movement? */
  isBlocking() {
    return !this.isOpen;
  }

  // ── Internal ──────────────────────────────────────────

  _open() {
    this.isOpen = true;
    this.sprite.setTexture('door_open');

    // Quick scale animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 0.3 },
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.sprite.setScale(1);
      }
    });

    this.scene.game.audioManager?.playDoorOpen();
  }

  _close() {
    this.isOpen = false;
    this.sprite.setTexture('door_closed');

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 0.3, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
    });

    this.scene.game.audioManager?.playDoorClose();
  }

  reset() {
    this.isOpen = false;
    this.sprite.setTexture('door_closed');
    this.sprite.setScale(1);
  }

  destroy() {
    this.sprite.destroy();
  }
}
