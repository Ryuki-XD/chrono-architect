/**
 * MovingPlatform.js — Platform that follows a waypoint path, carrying entities.
 * Can be always-moving or activated via signal.
 */

import { DEPTH, MOVE_DURATION, TILE_SIZE } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';

export default class MovingPlatform {
  /**
   * @param {Phaser.Scene} scene
   * @param {Array<{x:number, y:number}>} waypoints — grid positions to follow
   * @param {string} [signalId]  — if set, platform moves only when signal active
   * @param {boolean} [autoMove] — if true, starts moving immediately
   */
  constructor(scene, waypoints, signalId = null, autoMove = true) {
    this.scene = scene;
    this.waypoints = waypoints;
    this.signalId = signalId;
    this.autoMove = autoMove;

    this.waypointIndex = 0;
    this.direction = 1;  // 1 = forward, -1 = backward (ping-pong)
    this.gridX = waypoints[0].x;
    this.gridY = waypoints[0].y;
    this.startWaypointIndex = 0;
    this.isMoving = false;
    this.active = autoMove;

    const pos = gridToPixel(this.gridX, this.gridY, scene.offsetX, scene.offsetY);
    this.sprite = scene.add.sprite(pos.x, pos.y, 'platform');
    this.sprite.setDepth(DEPTH.PLATFORM);
    this.sprite.setOrigin(0.5, 0.5);
  }

  /**
   * Called each tick by GameScene.
   * Returns {dx, dy} delta if the platform moved (so entities on it can be carried).
   */
  update(tick) {
    if (!this.active || this.isMoving) return null;
    if (this.waypoints.length < 2) return null;

    // Only move every other tick for a more measured pace
    if (tick % 2 !== 0) return null;

    // Determine next waypoint
    let nextIdx = this.waypointIndex + this.direction;
    if (nextIdx >= this.waypoints.length || nextIdx < 0) {
      this.direction *= -1; // reverse at endpoints
      nextIdx = this.waypointIndex + this.direction;
    }

    const wp = this.waypoints[nextIdx];
    const dx = wp.x - this.gridX;
    const dy = wp.y - this.gridY;

    this.waypointIndex = nextIdx;
    this.gridX = wp.x;
    this.gridY = wp.y;
    this.isMoving = true;

    const pos = gridToPixel(wp.x, wp.y, this.scene.offsetX, this.scene.offsetY);
    this.scene.tweens.add({
      targets: this.sprite,
      x: pos.x,
      y: pos.y,
      duration: MOVE_DURATION * 1.5,
      ease: 'Sine.easeInOut',
      onComplete: () => { this.isMoving = false; },
    });

    return { dx, dy };
  }

  onSignal(active) {
    this.active = active;
  }

  reset() {
    this.waypointIndex = this.startWaypointIndex;
    this.direction = 1;
    this.gridX = this.waypoints[0].x;
    this.gridY = this.waypoints[0].y;
    this.isMoving = false;
    this.active = this.autoMove;

    const pos = gridToPixel(this.gridX, this.gridY, this.scene.offsetX, this.scene.offsetY);
    this.sprite.setPosition(pos.x, pos.y);
  }

  destroy() {
    this.sprite.destroy();
  }
}
