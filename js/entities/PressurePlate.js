/**
 * PressurePlate.js — Floor plate that activates while an entity stands on it.
 * Connected to doors / lasers / platforms via signalId.
 */

import { DEPTH } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class PressurePlate {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX
   * @param {number} gridY
   * @param {string} signalId  — signal group this plate belongs to
   * @param {number} [color]   — optional tint override for visual matching
   */
  constructor(scene, gridX, gridY, signalId, color) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.signalId = signalId;
    this.pressed = false;
    this._wasPressed = false;

    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    this.sprite = scene.add.sprite(pos.x, pos.y, 'pressure_plate');
    this.sprite.setDepth(DEPTH.PRESSURE_PLATE);
    this.sprite.setOrigin(0.5, 0.5);
    if (color) this.sprite.setTint(color);
  }

  /**
   * Called every tick by GameScene. Checks if any entity occupies this tile.
   * @param {boolean} occupied — whether player/clone/crate is on this tile
   * @returns {boolean} true if state changed
   */
  updateState(occupied) {
    this.pressed = occupied;

    if (this.pressed !== this._wasPressed) {
      this._wasPressed = this.pressed;
      this.sprite.setTexture(this.pressed ? 'pressure_plate_active' : 'pressure_plate');
      return true; // state changed
    }
    return false;
  }

  reset() {
    this.pressed = false;
    this._wasPressed = false;
    this.sprite.setTexture('pressure_plate');
  }

  destroy() {
    this.sprite.destroy();
  }
}
