/**
 * CloneManager.js — Manages the recording / replay lifecycle.
 *
 * Flow:
 *   1. Round starts → tick counter resets to 0, all clones replay from tick 0.
 *   2. Player actions are always captured into `currentRecording`.
 *   3. Player presses SPACE (commit) → recording saved, new Clone created, round restarts.
 *   4. Player presses U (undo) → last clone removed, round restarts.
 *   5. Player reaches exit → level complete.
 */

import Clone from '../entities/Clone.js';
import { COLORS } from '../config/GameConfig.js';

export default class CloneManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} startX — player start grid X
   * @param {number} startY — player start grid Y
   * @param {number} maxClones — max clones allowed for this level
   */
  constructor(scene, startX, startY, maxClones) {
    this.scene = scene;
    this.startX = startX;
    this.startY = startY;
    this.maxClones = maxClones;

    /** @type {string[][]} All committed recordings */
    this.recordings = [];

    /** @type {Clone[]} Active clone entities */
    this.clones = [];

    /** @type {string[]} Current (uncommitted) recording — one action per tick */
    this.currentRecording = [];

    /** Current game tick */
    this.currentTick = -1;

    this.totalClonesCreated = 0;
  }

  // ── Tick ──────────────────────────────────────────────

  /** Advance to next tick. Returns the tick number. */
  tick() {
    this.currentTick++;
    return this.currentTick;
  }

  /** Record the player's action for the current tick */
  recordAction(action) {
    this.currentRecording.push(action);
  }

  /** Get the action each clone should perform this tick */
  getCloneActions() {
    return this.clones.map(clone => ({
      clone,
      action: clone.getAction(this.currentTick),
    }));
  }

  // ── Commit / Undo / Reset ─────────────────────────────

  /**
   * Commit the current recording as a new clone.
   * @returns {Clone|null} The newly created clone, or null if at max
   */
  commit() {
    if (this.recordings.length >= this.maxClones) return null;
    if (this.currentRecording.length === 0) return null;

    // Save recording
    const recording = [...this.currentRecording];
    this.recordings.push(recording);

    // Create clone entity
    const idx = this.recordings.length - 1;
    const clone = new Clone(
      this.scene,
      this.startX,
      this.startY,
      recording,
      idx
    );
    this.clones.push(clone);
    this.totalClonesCreated++;

    // Create trail particle
    const tint = COLORS.CLONE_TINTS[idx % COLORS.CLONE_TINTS.length];
    if (this.scene.particles) {
      clone.trail = this.scene.particles.cloneTrail(clone.sprite, tint);
    }

    return clone;
  }

  /**
   * Remove the most recently committed clone.
   * @returns {boolean} true if a clone was removed
   */
  undo() {
    if (this.recordings.length === 0) return false;

    this.recordings.pop();
    const clone = this.clones.pop();
    if (clone) clone.destroy();

    return true;
  }

  /**
   * Start a new round — reset tick counter, reset all clone positions,
   * clear current recording.
   */
  startRound() {
    this.currentTick = -1;
    this.currentRecording = [];

    // Reset all existing clones to their start positions
    for (const clone of this.clones) {
      clone.reset();
    }
  }

  /** Get the number of active clones */
  get cloneCount() {
    return this.clones.length;
  }

  /** Can the player create more clones? */
  get canCreateClone() {
    return this.clones.length < this.maxClones;
  }

  /** Get the longest recording length (in ticks) */
  get longestRecording() {
    if (this.recordings.length === 0) return 0;
    return Math.max(...this.recordings.map(r => r.length));
  }

  // ── Cleanup ───────────────────────────────────────────

  /** Destroy all clones and clear all recordings */
  destroyAll() {
    for (const clone of this.clones) {
      clone.destroy();
    }
    this.clones = [];
    this.recordings = [];
    this.currentRecording = [];
    this.currentTick = -1;
  }

  destroy() {
    this.destroyAll();
  }
}
