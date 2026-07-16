/**
 * SettingsPanel.js — Volume controls and settings overlay.
 */

import { COLORS, DEPTH, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.js';

export default class SettingsPanel {
  /**
   * @param {Phaser.Scene} scene
   * @param {Function} onClose
   */
  constructor(scene, onClose) {
    this.scene = scene;
    this.onClose = onClose;
    this.visible = false;

    // Overlay
    this.overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    this.overlay.setDepth(DEPTH.OVERLAY);

    // Panel
    this.panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 360, 320, COLORS.UI_PANEL, 0.95);
    this.panel.setStrokeStyle(1, COLORS.UI_BORDER);
    this.panel.setDepth(DEPTH.MODAL);

    // Title
    this.title = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 130, 'SETTINGS', {
      fontFamily: FONTS.TITLE, fontSize: '22px', color: '#00e5ff', resolution: 2,
    });
    this.title.setOrigin(0.5).setDepth(DEPTH.MODAL + 1);

    // Music volume slider
    this.musicSlider = this._createSlider(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'Music Volume',
      scene.game.audioManager?.musicVolume ?? 0.5,
      (val) => {
        scene.game.audioManager?.setMusicVolume(val);
        scene.game.saveManager?.updateSettings({ musicVolume: val });
      }
    );

    // SFX volume slider
    this.sfxSlider = this._createSlider(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'SFX Volume',
      scene.game.audioManager?.sfxVolume ?? 0.7,
      (val) => {
        scene.game.audioManager?.setSfxVolume(val);
        scene.game.saveManager?.updateSettings({ sfxVolume: val });
      }
    );

    // Close button
    this.closeBtn = this._createCloseButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 'Close');

    this._allObjects = [
      this.overlay, this.panel, this.title,
      ...this.musicSlider, ...this.sfxSlider, ...this.closeBtn,
    ];
    this.hide();
  }

  show() {
    this.visible = true;
    this._allObjects.forEach(o => o.setVisible(true));
  }

  hide() {
    this.visible = false;
    this._allObjects.forEach(o => o.setVisible(false));
  }

  _createSlider(x, y, label, initialValue, onChange) {
    const objects = [];

    const lbl = this.scene.add.text(x - 130, y - 8, label, {
      fontFamily: FONTS.BODY, fontSize: '13px', color: '#8b949e', resolution: 2,
    });
    lbl.setDepth(DEPTH.MODAL + 1);
    objects.push(lbl);

    // Track
    const trackW = 140;
    const track = this.scene.add.rectangle(x + 40, y, trackW, 6, COLORS.UI_BORDER);
    track.setDepth(DEPTH.MODAL + 1);
    objects.push(track);

    // Fill
    const fill = this.scene.add.rectangle(x + 40 - trackW / 2, y, trackW * initialValue, 6, COLORS.UI_PRIMARY);
    fill.setOrigin(0, 0.5);
    fill.setDepth(DEPTH.MODAL + 2);
    objects.push(fill);

    // Handle
    const handleX = x + 40 - trackW / 2 + trackW * initialValue;
    const handle = this.scene.add.circle(handleX, y, 8, COLORS.UI_PRIMARY);
    handle.setDepth(DEPTH.MODAL + 3);
    handle.setInteractive({ useHandCursor: true, draggable: true });
    objects.push(handle);

    // Value text
    const valText = this.scene.add.text(x + 130, y, Math.round(initialValue * 100) + '%', {
      fontFamily: FONTS.UI, fontSize: '11px', color: '#f0f6fc', resolution: 2,
    });
    valText.setOrigin(0.5).setDepth(DEPTH.MODAL + 1);
    objects.push(valText);

    // Drag handler
    const minX = x + 40 - trackW / 2;
    const maxX = x + 40 + trackW / 2;

    handle.on('drag', (_ptr, dragX) => {
      const clamped = Phaser.Math.Clamp(dragX, minX, maxX);
      handle.x = clamped;
      const val = (clamped - minX) / trackW;
      fill.width = trackW * val;
      valText.setText(Math.round(val * 100) + '%');
      onChange(val);
    });

    return objects;
  }

  _createCloseButton(x, y, label) {
    const bg = this.scene.add.rectangle(x, y, 160, 38, COLORS.UI_PANEL_LIGHT, 1);
    bg.setStrokeStyle(1, COLORS.UI_BORDER);
    bg.setDepth(DEPTH.MODAL + 1);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.scene.add.text(x, y, label, {
      fontFamily: FONTS.UI, fontSize: '13px', color: '#f0f6fc', resolution: 2,
    });
    txt.setOrigin(0.5).setDepth(DEPTH.MODAL + 2);

    bg.on('pointerover', () => { bg.setFillStyle(COLORS.UI_PRIMARY, 0.15); txt.setColor('#00e5ff'); });
    bg.on('pointerout', () => { bg.setFillStyle(COLORS.UI_PANEL_LIGHT, 1); txt.setColor('#f0f6fc'); });
    bg.on('pointerdown', () => {
      this.scene.game.audioManager?.playUIConfirm();
      this.onClose();
    });

    return [bg, txt];
  }

  destroy() {
    this._allObjects.forEach(o => o.destroy());
  }
}
