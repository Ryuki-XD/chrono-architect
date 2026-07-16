/**
 * VictoryScreen.js — Level completion overlay with stats and star rating.
 */

import { COLORS, DEPTH, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.js';
import { formatTime } from '../utils/MathUtils.js';

export default class VictoryScreen {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} callbacks — { onNext, onReplay, onLevelSelect }
   */
  constructor(scene, callbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.visible = false;

    // Overlay
    this.overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);
    this.overlay.setDepth(DEPTH.OVERLAY);

    // Panel
    this.panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 400, 440, COLORS.UI_PANEL, 0.95);
    this.panel.setStrokeStyle(1, COLORS.UI_BORDER);
    this.panel.setDepth(DEPTH.MODAL);

    // Title
    this.title = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 180, 'LEVEL COMPLETE', {
      fontFamily: FONTS.TITLE, fontSize: '22px', color: '#00e676', resolution: 2,
    });
    this.title.setOrigin(0.5).setDepth(DEPTH.MODAL + 1);

    // Stars container
    this.stars = [];
    for (let i = 0; i < 3; i++) {
      const star = scene.add.sprite(GAME_WIDTH / 2 - 30 + i * 30, GAME_HEIGHT / 2 - 145, 'star');
      star.setDepth(DEPTH.MODAL + 1);
      star.setScale(1.2);
      star.setTint(COLORS.STAR_EMPTY);
      this.stars.push(star);
    }

    // Stats texts
    const statY = GAME_HEIGHT / 2 - 100;
    const statStyle = { fontFamily: FONTS.BODY, fontSize: '15px', color: '#f0f6fc', resolution: 2 };
    const labelStyle = { ...statStyle, color: '#8b949e' };

    this.statLabels = [];
    this.statValues = [];
    const labels = ['Time', 'Moves', 'Clones Used', 'Cores'];
    labels.forEach((label, i) => {
      const y = statY + i * 32;
      const lbl = scene.add.text(GAME_WIDTH / 2 - 120, y, label, labelStyle);
      lbl.setDepth(DEPTH.MODAL + 1);
      const val = scene.add.text(GAME_WIDTH / 2 + 120, y, '', { ...statStyle, fontFamily: FONTS.UI });
      val.setOrigin(1, 0).setDepth(DEPTH.MODAL + 1);
      this.statLabels.push(lbl);
      this.statValues.push(val);
    });

    // New best indicator
    this.newBest = scene.add.text(GAME_WIDTH / 2, statY + 135, '⭐ NEW BEST! ⭐', {
      fontFamily: FONTS.UI, fontSize: '14px', color: '#ffd740', resolution: 2,
    });
    this.newBest.setOrigin(0.5).setDepth(DEPTH.MODAL + 1);

    // Buttons
    const btnY = GAME_HEIGHT / 2 + 140;
    this.nextBtn = this._createButton(GAME_WIDTH / 2 - 100, btnY, 'Next Level', () => callbacks.onNext?.());
    this.replayBtn = this._createButton(GAME_WIDTH / 2 + 100, btnY, 'Replay', () => callbacks.onReplay?.());
    this.selectBtn = this._createButton(GAME_WIDTH / 2, btnY + 50, 'Level Select', () => callbacks.onLevelSelect?.());

    // Gather all objects
    this._allObjects = [
      this.overlay, this.panel, this.title, this.newBest,
      ...this.stars, ...this.statLabels, ...this.statValues,
      ...this.nextBtn, ...this.replayBtn, ...this.selectBtn,
    ];
    this.hide();
  }

  /**
   * Show victory screen with stats.
   * @param {object} stats — { time, moves, clones, cores, totalCores, stars, isNewBest }
   */
  show(stats) {
    this.visible = true;
    this._allObjects.forEach(o => o.setVisible(true));

    // Populate stats
    this.statValues[0].setText(formatTime(stats.time));
    this.statValues[1].setText(String(stats.moves));
    this.statValues[2].setText(String(stats.clones));
    this.statValues[3].setText(`${stats.cores} / ${stats.totalCores}`);

    // Stars
    for (let i = 0; i < 3; i++) {
      const earned = i < stats.stars;
      this.stars[i].setTint(earned ? COLORS.STAR_FILLED : COLORS.STAR_EMPTY);

      if (earned) {
        this.stars[i].setScale(0);
        this.scene.tweens.add({
          targets: this.stars[i],
          scaleX: 1.2, scaleY: 1.2,
          duration: 300,
          delay: 200 + i * 200,
          ease: 'Back.easeOut',
        });
      }
    }

    // New best
    this.newBest.setVisible(!!stats.isNewBest);

    // Panel animation
    this.panel.setScale(0.7);
    this.panel.setAlpha(0);
    this.scene.tweens.add({
      targets: this.panel,
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  hide() {
    this.visible = false;
    this._allObjects.forEach(o => o.setVisible(false));
  }

  _createButton(x, y, label, callback) {
    const bg = this.scene.add.rectangle(x, y, 160, 38, COLORS.UI_PANEL_LIGHT, 1);
    bg.setStrokeStyle(1, COLORS.UI_BORDER);
    bg.setDepth(DEPTH.MODAL + 1);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.scene.add.text(x, y, label, {
      fontFamily: FONTS.UI, fontSize: '12px', color: '#f0f6fc', resolution: 2,
    });
    txt.setOrigin(0.5).setDepth(DEPTH.MODAL + 2);

    bg.on('pointerover', () => {
      bg.setFillStyle(COLORS.UI_PRIMARY, 0.15);
      txt.setColor('#00e5ff');
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(COLORS.UI_PANEL_LIGHT, 1);
      txt.setColor('#f0f6fc');
    });
    bg.on('pointerdown', () => {
      this.scene.game.audioManager?.playUIConfirm();
      callback();
    });

    return [bg, txt];
  }

  destroy() {
    this._allObjects.forEach(o => o.destroy());
  }
}
