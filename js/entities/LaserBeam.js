/**
 * LaserBeam.js — Laser emitter + beam that kills on contact.
 * Beam extends from emitter in a direction until hitting a wall, closed door, or crate.
 * Togglable via signal.
 */

import { DEPTH, COLORS, TILE_SIZE } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class LaserBeam {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} gridX       — emitter grid X
   * @param {number} gridY       — emitter grid Y
   * @param {'right'|'down'|'left'|'up'} direction
   * @param {string} [signalId]  — signal that toggles this laser
   * @param {boolean} [startOn]  — default on/off state
   */
  constructor(scene, gridX, gridY, direction, signalId = null, startOn = true) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.direction = direction;
    this.signalId = signalId;
    this.on = startOn;
    this._defaultOn = startOn;

    // Direction vector
    this.dx = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
    this.dy = direction === 'down'  ? 1 : direction === 'up'   ? -1 : 0;

    // Beam texture key depends on orientation
    this.beamKey = (this.dx !== 0) ? 'laser_beam_h' : 'laser_beam_v';

    // Emitter sprite
    const pos = gridToPixel(gridX, gridY, scene.offsetX, scene.offsetY);
    this.emitter = scene.add.sprite(pos.x, pos.y, 'laser_emitter');
    this.emitter.setDepth(DEPTH.LASER_BEAM);

    // Beam segments (sprites for each tile the beam passes through)
    this.beamSprites = [];

    // Tiles the beam currently occupies (for collision checks)
    this.beamTiles = [];
  }

  /**
   * Recalculate the beam path. Called each tick by GameScene after entities move.
   * @param {Function} isBlocked — (gx, gy) => boolean — returns true if tile blocks the beam
   */
  recalculate(isBlocked) {
    // Clear old beam
    this.beamSprites.forEach(s => s.destroy());
    this.beamSprites = [];
    this.beamTiles = [];

    if (!this.on) return;

    // Trace beam from emitter in direction until blocked
    let cx = this.gridX + this.dx;
    let cy = this.gridY + this.dy;

    while (!isBlocked(cx, cy)) {
      this.beamTiles.push({ x: cx, y: cy });

      const pos = gridToPixel(cx, cy, this.scene.offsetX, this.scene.offsetY);
      const seg = this.scene.add.sprite(pos.x, pos.y, this.beamKey);
      seg.setDepth(DEPTH.LASER_BEAM);
      seg.setAlpha(0.85);

      // Subtle pulse
      this.scene.tweens.add({
        targets: seg,
        alpha: { from: 0.85, to: 0.5 },
        duration: 400 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.beamSprites.push(seg);

      cx += this.dx;
      cy += this.dy;
    }
  }

  /**
   * Check if a grid position is inside this laser beam.
   */
  hitsPosition(gx, gy) {
    if (!this.on) return false;
    return this.beamTiles.some(t => t.x === gx && t.y === gy);
  }

  onSignal(active) {
    // Signal toggles laser: if signal active, laser is OFF (signal disables laser)
    this.on = !active;
  }

  setOn(state) {
    this.on = state;
  }

  reset() {
    this.on = this._defaultOn;
    this.beamSprites.forEach(s => s.destroy());
    this.beamSprites = [];
    this.beamTiles = [];
  }

  destroy() {
    this.beamSprites.forEach(s => s.destroy());
    this.emitter.destroy();
  }
}
