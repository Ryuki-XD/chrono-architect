/**
 * SaveManager.js — LocalStorage persistence layer.
 * Handles save/load of level progress, settings, and achievement flags.
 */

import { SAVE_KEY } from '../config/GameConfig.js';

/** Default save-data shape */
function createDefaultSave() {
  return {
    version: 1,
    levels: {},          // { [levelId]: { completed, stars, bestTime, bestMoves, bestClones, coresCollected } }
    achievements: [],    // array of unlocked achievement ids
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      musicMuted: false,
      sfxMuted: false,
    },
    stats: {
      totalClones: 0,
      totalMoves: 0,
      totalTime: 0,
      levelsCompleted: 0,
      hintsUsed: 0,
      restarts: 0,
    },
    highestUnlocked: 1,
  };
}

export default class SaveManager {
  constructor() {
    this.data = this._load();
  }

  // ── Public API ──────────────────────────────────────────

  /** Full save-data object (read-only reference — mutate via helper methods) */
  get saveData() {
    return this.data;
  }

  /** Persist current data to localStorage */
  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[SaveManager] Could not write to localStorage:', e);
    }
  }

  /** Wipe all progress and reset to defaults */
  reset() {
    this.data = createDefaultSave();
    this.save();
  }

  // ── Level Progress ────────────────────────────────────

  isLevelUnlocked(levelId) {
    return levelId <= this.data.highestUnlocked;
  }

  getLevelData(levelId) {
    return this.data.levels[levelId] || null;
  }

  /**
   * Record a level completion. Only overwrites bests if the new run is better.
   * @returns {{ newBest: boolean, starsEarned: number }}
   */
  completeLevel(levelId, { time, moves, clones, cores, totalCores, stars }) {
    const prev = this.data.levels[levelId] || {};
    const newBest = !prev.completed
      || stars > (prev.stars || 0)
      || time < (prev.bestTime || Infinity);

    this.data.levels[levelId] = {
      completed: true,
      stars: Math.max(stars, prev.stars || 0),
      bestTime: Math.min(time, prev.bestTime || Infinity),
      bestMoves: Math.min(moves, prev.bestMoves || Infinity),
      bestClones: Math.min(clones, prev.bestClones || Infinity),
      coresCollected: Math.max(cores, prev.coresCollected || 0),
      totalCores: totalCores,
    };

    // Unlock next level
    if (levelId + 1 > this.data.highestUnlocked) {
      this.data.highestUnlocked = levelId + 1;
    }

    // Global stats
    this.data.stats.levelsCompleted = Object.keys(this.data.levels)
      .filter(k => this.data.levels[k].completed).length;

    this.save();
    return { newBest, starsEarned: stars };
  }

  // ── Achievements ──────────────────────────────────────

  isAchievementUnlocked(id) {
    return this.data.achievements.includes(id);
  }

  unlockAchievement(id) {
    if (!this.data.achievements.includes(id)) {
      this.data.achievements.push(id);
      this.save();
      return true; // newly unlocked
    }
    return false;
  }

  // ── Settings ──────────────────────────────────────────

  getSettings() {
    return { ...this.data.settings };
  }

  updateSettings(patch) {
    Object.assign(this.data.settings, patch);
    this.save();
  }

  // ── Stats ─────────────────────────────────────────────

  addStats(patch) {
    for (const [key, value] of Object.entries(patch)) {
      if (typeof this.data.stats[key] === 'number') {
        this.data.stats[key] += value;
      }
    }
    this.save();
  }

  // ── Internal ──────────────────────────────────────────

  _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with defaults to handle schema additions
        const def = createDefaultSave();
        return {
          ...def,
          ...parsed,
          settings: { ...def.settings, ...(parsed.settings || {}) },
          stats: { ...def.stats, ...(parsed.stats || {}) },
        };
      }
    } catch (e) {
      console.warn('[SaveManager] Corrupted save, resetting:', e);
    }
    return createDefaultSave();
  }
}
