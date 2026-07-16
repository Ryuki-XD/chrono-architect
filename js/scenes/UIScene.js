/**
 * UIScene.js — HUD overlay that runs parallel to GameScene.
 * Manages: HUD, PauseMenu, VictoryScreen, SettingsPanel, HintPanel, AchievementToast.
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.js';
import HUD from '../ui/HUD.js';
import PauseMenu from '../ui/PauseMenu.js';
import VictoryScreen from '../ui/VictoryScreen.js';
import SettingsPanel from '../ui/SettingsPanel.js';
import HintPanel from '../ui/HintPanel.js';
import AchievementToast from '../ui/AchievementToast.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI });
  }

  create() {
    // HUD
    this.hud = new HUD(this);

    // Pause Menu
    this.pauseMenu = new PauseMenu(this, {
      onResume: () => {
        this.pauseMenu.hide();
        this.game.events.emit('ui:resume');
      },
      onRestart: () => {
        this.pauseMenu.hide();
        this.game.events.emit('ui:restart');
      },
      onSettings: () => {
        this.pauseMenu.hide();
        this.settingsPanel.show();
      },
      onLevelSelect: () => {
        this.pauseMenu.hide();
        this.game.events.emit('ui:levelSelect');
      },
      onMainMenu: () => {
        this.pauseMenu.hide();
        this.game.events.emit('ui:mainMenu');
      },
    });

    // Victory Screen
    this.victoryScreen = new VictoryScreen(this, {
      onNext: () => {
        this.victoryScreen.hide();
        this.game.events.emit('ui:nextLevel');
      },
      onReplay: () => {
        this.victoryScreen.hide();
        this.game.events.emit('ui:replay');
      },
      onLevelSelect: () => {
        this.victoryScreen.hide();
        this.game.events.emit('ui:levelSelect');
      },
    });

    // Settings Panel
    this.settingsPanel = new SettingsPanel(this, () => {
      this.settingsPanel.hide();
      // If game is paused, show pause menu again
      if (this._wasPaused) {
        this.pauseMenu.show();
      }
    });

    // Hint Panel
    this.hintPanel = new HintPanel(this);

    // Achievement Toast
    this.toast = new AchievementToast(this);

    // Confetti emitter reference
    this._confetti = null;

    // ── Event Listeners ─────────────────────────────────

    this.game.events.on('game:hudUpdate', (data) => {
      this.hud.update(data);
    });

    this.game.events.on('game:paused', () => {
      this._wasPaused = true;
      this.pauseMenu.show();
    });

    this.game.events.on('game:resumed', () => {
      this._wasPaused = false;
      this.pauseMenu.hide();
      this.victoryScreen.hide();
      this.settingsPanel.hide();
    });

    this.game.events.on('game:levelComplete', (stats) => {
      this.victoryScreen.show(stats);
      // Confetti!
      if (this.textures.exists('particle')) {
        const { ParticleEffects: PE } = this;
        this._confetti = this.add.particles(GAME_WIDTH / 2, 0, 'particle', {
          speedX: { min: -120, max: 120 },
          speedY: { min: 50, max: 200 },
          gravityY: 80,
          scale: { start: 0.6, end: 0.2 },
          alpha: { start: 1, end: 0.4 },
          lifespan: 2500,
          quantity: 2,
          frequency: 60,
          tint: [0x00e5ff, 0xe040fb, 0x00e676, 0xffd740, 0xff5252],
        });
        this._confetti.setDepth(50);
        // Stop after 3 seconds
        this.time.delayedCall(3000, () => {
          if (this._confetti) { this._confetti.stop(); }
        });
      }
    });

    this.game.events.on('game:showHint', (text) => {
      this.hintPanel.show(text);
    });

    this.game.events.on('achievementUnlocked', (ach) => {
      this.toast.show(ach);
    });
  }

  shutdown() {
    // Remove event listeners
    this.game.events.off('game:hudUpdate');
    this.game.events.off('game:paused');
    this.game.events.off('game:resumed');
    this.game.events.off('game:levelComplete');
    this.game.events.off('game:showHint');
    this.game.events.off('achievementUnlocked');

    // Cleanup
    this.hud?.destroy();
    this.pauseMenu?.destroy();
    this.victoryScreen?.destroy();
    this.settingsPanel?.destroy();
    this.hintPanel?.destroy();
    if (this._confetti) this._confetti.destroy();
  }
}
