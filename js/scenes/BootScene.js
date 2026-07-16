/**
 * BootScene.js — Minimal bootstrap: initialise global managers, configure scaling.
 */

import { SCENES, COLORS } from '../config/GameConfig.js';
import SaveManager from '../managers/SaveManager.js';
import AudioManager from '../managers/AudioManager.js';
import AchievementManager from '../managers/AchievementManager.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  create() {
    // Attach global managers to the game instance
    this.game.saveManager = new SaveManager();
    this.game.audioManager = new AudioManager();
    this.game.achievementManager = new AchievementManager(this.game, this.game.saveManager);

    // Apply saved settings
    const settings = this.game.saveManager.getSettings();
    this.game.audioManager.applySettings(settings);

    // Set background color
    this.cameras.main.setBackgroundColor(COLORS.BG_DARK);

    // Proceed to preload
    this.scene.start(SCENES.PRELOAD);
  }
}
