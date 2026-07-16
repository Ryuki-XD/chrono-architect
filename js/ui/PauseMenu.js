/**
 * PauseMenu.js — Overlay menu shown when the game is paused.
 */

import { COLORS, DEPTH, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.js';

export default class PauseMenu {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} callbacks — { onResume, onRestart, onSettings, onLevelSelect, onMainMenu }
   */
  constructor(scene, callbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.visible = false;

    // Darkened overlay
    this.overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    this.overlay.setDepth(DEPTH.OVERLAY);

    // Panel
    this.panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 320, 380, COLORS.UI_PANEL, 0.95);
    this.panel.setStrokeStyle(1, COLORS.UI_BORDER);
    this.panel.setDepth(DEPTH.MODAL);

    // Title
    this.title = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, 'PAUSED', {
      fontFamily: FONTS.TITLE, fontSize: '28px', color: '#00e5ff', resolution: 2,
    });
    this.title.setOrigin(0.5).setDepth(DEPTH.MODAL + 1);

    // Buttons
    const buttonData = [
      { label: 'Resume', cb: 'onResume' },
      { label: 'Restart Level', cb: 'onRestart' },
      { label: 'Settings', cb: 'onSettings' },
      { label: 'Level Select', cb: 'onLevelSelect' },
      { label: 'Main Menu', cb: 'onMainMenu' },
    ];

    this.buttons = [];
    buttonData.forEach((bd, i) => {
      const y = GAME_HEIGHT / 2 - 80 + i * 52;
      const btn = this._createButton(GAME_WIDTH / 2, y, bd.label, () => {
        if (this.callbacks[bd.cb]) this.callbacks[bd.cb]();
      });
      this.buttons.push(btn);
    });

    this._allObjects = [this.overlay, this.panel, this.title, ...this.buttons.flat()];
    this.hide();
  }

  show() {
    this.visible = true;
    this._allObjects.forEach(o => o.setVisible(true));

    // Animate in
    this.panel.setScale(0.8);
    this.scene.tweens.add({
      targets: this.panel,
      scaleX: 1, scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  hide() {
    this.visible = false;
    this._allObjects.forEach(o => o.setVisible(false));
  }

  _createButton(x, y, label, callback) {
    const bg = this.scene.add.rectangle(x, y, 240, 40, COLORS.UI_PANEL_LIGHT, 1);
    bg.setStrokeStyle(1, COLORS.UI_BORDER);
    bg.setDepth(DEPTH.MODAL + 1);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.scene.add.text(x, y, label, {
      fontFamily: FONTS.UI, fontSize: '14px', color: '#f0f6fc', resolution: 2,
    });
    txt.setOrigin(0.5).setDepth(DEPTH.MODAL + 2);

    bg.on('pointerover', () => {
      bg.setFillStyle(COLORS.UI_PRIMARY, 0.15);
      txt.setColor('#00e5ff');
      this.scene.game.audioManager?.playUIBlip();
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
