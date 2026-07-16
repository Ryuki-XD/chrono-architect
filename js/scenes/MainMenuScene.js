/**
 * MainMenuScene.js — Animated title screen with menu buttons.
 */

import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, FONTS, DEPTH } from '../config/GameConfig.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MAIN_MENU });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG_DARK);

    // Initialise audio context on first interaction
    this.input.once('pointerdown', () => {
      this.game.audioManager.init();
      this.game.audioManager.resume();
      this.game.audioManager.startMusic();
    });
    this.input.keyboard.once('keydown', () => {
      this.game.audioManager.init();
      this.game.audioManager.resume();
      this.game.audioManager.startMusic();
    });

    // Background particles
    this._createBgParticles();

    // Title
    this.title = this.add.text(GAME_WIDTH / 2, 200, 'CHRONO', {
      fontFamily: FONTS.TITLE, fontSize: '56px', fontStyle: 'bold',
      color: '#00e5ff', resolution: 2,
    });
    this.title.setOrigin(0.5).setAlpha(0);

    this.subtitle = this.add.text(GAME_WIDTH / 2, 260, 'ARCHITECT', {
      fontFamily: FONTS.TITLE, fontSize: '32px', fontStyle: '600',
      color: '#e040fb', resolution: 2,
    });
    this.subtitle.setOrigin(0.5).setAlpha(0);

    // Tagline
    this.tagline = this.add.text(GAME_WIDTH / 2, 310, 'Cooperate with your past selves', {
      fontFamily: FONTS.BODY, fontSize: '14px', color: '#8b949e', resolution: 2,
    });
    this.tagline.setOrigin(0.5).setAlpha(0);

    // Animate title in
    this.tweens.add({ targets: this.title, alpha: 1, y: 190, duration: 800, delay: 200, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: this.subtitle, alpha: 1, y: 250, duration: 800, delay: 400, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: this.tagline, alpha: 1, duration: 600, delay: 800 });

    // Title glow pulse
    this.tweens.add({
      targets: this.title,
      alpha: { from: 1, to: 0.75 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1200,
    });

    // Menu buttons
    const buttons = [
      { label: 'Play', action: () => this._startGame() },
      { label: 'Level Select', action: () => this.scene.start(SCENES.LEVEL_SELECT) },
      { label: 'Settings', action: () => this._showSettings() },
    ];

    buttons.forEach((btn, i) => {
      this._createMenuButton(GAME_WIDTH / 2, 420 + i * 60, btn.label, btn.action, 1000 + i * 150);
    });

    // Version / credits
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'v1.0.0  •  Built with Phaser 3', {
      fontFamily: FONTS.BODY, fontSize: '10px', color: '#484f58', resolution: 2,
    }).setOrigin(0.5);

    // Achievement count
    const achMgr = this.game.achievementManager;
    this.add.text(20, GAME_HEIGHT - 30, `🏆 ${achMgr.unlockedCount} / ${achMgr.totalCount}`, {
      fontFamily: FONTS.UI, fontSize: '11px', color: '#6e7681', resolution: 2,
    });
  }

  _startGame() {
    this.game.audioManager?.playUIConfirm();
    // Start at the highest unlocked level (or level 1)
    const levelId = this.game.saveManager.saveData.highestUnlocked;
    const startLevel = Math.min(levelId, 20);
    this.scene.start(SCENES.GAME, { levelId: startLevel });
  }

  _showSettings() {
    // Quick inline settings — reuses the pattern from SettingsPanel
    // For simplicity, go to level select which has settings access
    this.game.audioManager?.playUIConfirm();
    this.scene.start(SCENES.LEVEL_SELECT);
  }

  _createMenuButton(x, y, label, callback, delay) {
    const bg = this.add.rectangle(x, y, 240, 44, COLORS.UI_PANEL, 0.8);
    bg.setStrokeStyle(1, COLORS.UI_BORDER);
    bg.setInteractive({ useHandCursor: true });
    bg.setAlpha(0);

    const txt = this.add.text(x, y, label, {
      fontFamily: FONTS.UI, fontSize: '16px', color: '#f0f6fc', resolution: 2,
    });
    txt.setOrigin(0.5).setAlpha(0);

    // Fade in
    this.tweens.add({ targets: [bg, txt], alpha: 1, duration: 400, delay });

    bg.on('pointerover', () => {
      bg.setFillStyle(COLORS.UI_PRIMARY, 0.12);
      bg.setStrokeStyle(1, COLORS.UI_PRIMARY, 0.5);
      txt.setColor('#00e5ff');
      this.game.audioManager?.playUIBlip();
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(COLORS.UI_PANEL, 0.8);
      bg.setStrokeStyle(1, COLORS.UI_BORDER);
      txt.setColor('#f0f6fc');
    });
    bg.on('pointerdown', callback);
  }

  _createBgParticles() {
    // Floating ambient particles
    if (!this.textures.exists('particle')) return;

    this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'particle_soft', {
      x: { min: -GAME_WIDTH / 2, max: GAME_WIDTH / 2 },
      y: { min: -GAME_HEIGHT / 2, max: GAME_HEIGHT / 2 },
      speed: { min: 5, max: 15 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.2, end: 0 },
      lifespan: 4000,
      frequency: 200,
      tint: [COLORS.UI_PRIMARY, COLORS.UI_ACCENT],
      blendMode: 'ADD',
    });
  }
}
