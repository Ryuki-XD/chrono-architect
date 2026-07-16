/**
 * AchievementManager.js — Checks and unlocks achievements, fires toast events.
 */

import { ACHIEVEMENTS } from '../data/AchievementData.js';

export default class AchievementManager {
  /**
   * @param {Phaser.Game} game
   * @param {import('./SaveManager.js').default} saveManager
   */
  constructor(game, saveManager) {
    this.game = game;
    this.save = saveManager;
    this._queue = [];  // pending toast notifications
  }

  /**
   * Attempt to unlock an achievement by id.
   * @returns {boolean} true if newly unlocked
   */
  unlock(id) {
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return false;

    if (this.save.unlockAchievement(id)) {
      this._queue.push(def);
      // Emit event for UI toast
      this.game.events.emit('achievementUnlocked', def);
      return true;
    }
    return false;
  }

  /** Check if an achievement is already unlocked */
  isUnlocked(id) {
    return this.save.isAchievementUnlocked(id);
  }

  /** Get all achievement definitions with their unlock status */
  getAll() {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: this.save.isAchievementUnlocked(a.id),
    }));
  }

  /** Get count of unlocked achievements */
  get unlockedCount() {
    return this.save.saveData.achievements.length;
  }

  /** Get total achievement count */
  get totalCount() {
    return ACHIEVEMENTS.length;
  }

  // ── Contextual Checks ─────────────────────────────────

  /**
   * Run checks after a level is completed.
   * @param {object} stats — { levelId, time, moves, clones, cores, totalCores, stars, restarts, usedHint }
   */
  checkOnLevelComplete(stats) {
    const { levelId, time, moves, clones, stars, restarts, usedHint } = stats;
    const save = this.save.saveData;

    // First Steps
    if (levelId === 1) this.unlock('first_steps');

    // Three Stars
    if (stars >= 3) this.unlock('three_stars');

    // Perfect Run
    if (restarts === 0) this.unlock('perfect_run');

    // Speed Runner (under par time handled by caller via stars)
    if (stars >= 3) this.unlock('speed_runner');

    // Minimalist (used minimum clones for the level — 0 or par)
    if (clones === 0) this.unlock('minimalist');

    // Efficient
    if (moves <= 50) this.unlock('efficient');

    // Speedster
    if (time <= 20000) this.unlock('speedster');

    // Completionist (all cores in level)
    if (stats.cores === stats.totalCores && stats.totalCores > 0) {
      this.unlock('completionist');
    }

    // Halfway There
    const completedCount = Object.values(save.levels).filter(l => l.completed).length;
    if (completedCount >= 10) this.unlock('halfway');

    // The Architect
    if (completedCount >= 20) this.unlock('architect');

    // All Stars
    const allThreeStars = Object.values(save.levels).every(l => l.stars >= 3);
    if (completedCount >= 20 && allThreeStars) this.unlock('all_stars');

    // No Hints (check across all completed levels)
    if (completedCount >= 5 && save.stats.hintsUsed === 0) {
      this.unlock('no_hints');
    }
  }

  /**
   * Check clone-related achievements.
   * @param {number} activeClones — currently active clones
   */
  checkOnCloneCreate(activeClones) {
    this.unlock('time_traveler');

    if (activeClones >= 5) this.unlock('clone_army');

    const totalClones = this.save.saveData.stats.totalClones || 0;
    if (totalClones >= 10) this.unlock('temporal_paradox');
  }

  /** Dequeue pending notifications */
  popNotification() {
    return this._queue.shift() || null;
  }
}
