/**
 * PreloadScene.js — Generates all procedural textures and shows a loading bar.
 */

import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, FONTS } from '../config/GameConfig.js';
import AssetGenerator from '../utils/AssetGenerator.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG_DARK);

    // Loading text
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'CHRONO ARCHITECT', {
      fontFamily: FONTS.TITLE, fontSize: '24px', color: '#00e5ff', resolution: 2,
    });
    title.setOrigin(0.5);

    const status = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'Generating assets...', {
      fontFamily: FONTS.BODY, fontSize: '12px', color: '#8b949e', resolution: 2,
    });
    status.setOrigin(0.5);

    // Loading bar
    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 280, 4, COLORS.UI_BORDER);
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - 140, GAME_HEIGHT / 2 + 50, 0, 4, COLORS.UI_PRIMARY);
    barFill.setOrigin(0, 0.5);

    // Generate all assets
    this.time.delayedCall(100, () => {
      const gen = new AssetGenerator(this);
      gen.generateAll();

      // Animate bar to full
      this.tweens.add({
        targets: barFill,
        width: 280,
        duration: 600,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          status.setText('Ready');

          // Hide the HTML loading screen if present
          const loadingEl = document.getElementById('loading-screen');
          if (loadingEl) {
            loadingEl.classList.add('fade-out');
            setTimeout(() => loadingEl.remove(), 700);
          }

          // Short delay then go to main menu
          this.time.delayedCall(400, () => {
            this.scene.start(SCENES.MAIN_MENU);
          });
        },
      });
    });
  }
}
