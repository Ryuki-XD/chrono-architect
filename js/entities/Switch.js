/**
 * Switch.js — Toggleable switch that emits a signal.
 * Toggled when an entity performs INTERACT while on the same tile.
 */

import { DEPTH, COLORS } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class Switch {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX
   * @param {number} gridY
   * @param {string} signalId
   * @param {boolean} [startOn=false]
   */
  constructor(scene, gridX, gridY, signalId, startOn = false) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.signalId = signalId;
    this.isOn = startOn;
    this._defaultOn = startOn;

    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    const tex = this.isOn ? 'switch_on' : 'switch_off';
    this.sprite = scene.add.sprite(pos.x, pos.y, tex);
    this.sprite.setDepth(DEPTH.SWITCH);
    this.sprite.setOrigin(0.5, 0.5);
  }

  /** Toggle the switch state. Returns the new state. */
  toggle() {
    this.isOn = !this.isOn;
    this.sprite.setTexture(this.isOn ? 'switch_on' : 'switch_off');

    // Quick bounce
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: { from: 0.8, to: 1 },
      duration: 150,
      ease: 'Back.easeOut',
    });

    this.scene.game.audioManager?.playSwitchToggle();
    return this.isOn;
  }

  reset() {
    this.isOn = this._defaultOn;
    this.sprite.setTexture(this.isOn ? 'switch_on' : 'switch_off');
    this.sprite.setScale(1);
  }

  destroy() {
    this.sprite.destroy();
  }
}
