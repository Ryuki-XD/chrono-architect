/**
 * TouchControls.js — On-screen D-pad and action buttons for touch devices.
 * Feeds the scene's InputManager exactly like keyboard input, so recording,
 * clones, and all game logic behave identically on mobile.
 */

import { ACTIONS, COLORS, DEPTH, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.js';

export default class TouchControls {
  /**
   * @param {Phaser.Scene} scene — the GameScene (must have .inputManager)
   */
  constructor(scene) {
    this.scene = scene;
    this._objects = [];

    // Allow D-pad + an action button to be held simultaneously
    scene.input.addPointer(2);

    // ── D-pad (bottom-left) ─────────────────────────────
    const dx = 118;
    const dy = GAME_HEIGHT - 148;
    const gap = 62;
    this._addDirButton(dx, dy - gap, '▲', ACTIONS.MOVE_UP);
    this._addDirButton(dx, dy + gap, '▼', ACTIONS.MOVE_DOWN);
    this._addDirButton(dx - gap, dy, '◀', ACTIONS.MOVE_LEFT);
    this._addDirButton(dx + gap, dy, '▶', ACTIONS.MOVE_RIGHT);

    // ── Action buttons (bottom-right) ───────────────────
    this._addActionButton(GAME_WIDTH - 92, GAME_HEIGHT - 118, 42, 'CLONE', 'record', COLORS.UI_ACCENT, '13px');
    this._addActionButton(GAME_WIDTH - 188, GAME_HEIGHT - 74, 30, 'E', 'interact', COLORS.UI_PRIMARY, '15px');

    // ── Utility row (top-right, below the HUD bar) ──────
    this._addActionButton(GAME_WIDTH - 132, 64, 20, 'R', 'restart', COLORS.UI_WARNING, '12px');
    this._addActionButton(GAME_WIDTH - 84, 64, 20, 'U', 'undo', COLORS.UI_TEXT_DIM, '12px');
    this._addActionButton(GAME_WIDTH - 36, 64, 20, '❚❚', 'pause', COLORS.UI_TEXT_DIM, '10px');
  }

  _makeCircle(x, y, r, label, color, fontSize) {
    const c = this.scene.add.circle(x, y, r, COLORS.UI_PANEL, 0.55);
    c.setStrokeStyle(2, color, 0.9);
    c.setDepth(DEPTH.TOAST);
    c.setInteractive(new Phaser.Geom.Circle(r, r, r + 8), Phaser.Geom.Circle.Contains);
    const t = this.scene.add.text(x, y, label, {
      fontFamily: FONTS.UI, fontSize, color: '#f0f6fc', resolution: 2,
    });
    t.setOrigin(0.5).setDepth(DEPTH.TOAST);
    this._objects.push(c, t);
    return c;
  }

  _addDirButton(x, y, label, action) {
    const c = this._makeCircle(x, y, 32, label, COLORS.UI_PRIMARY, '18px');
    c.on('pointerdown', () => {
      c.setFillStyle(COLORS.UI_PRIMARY, 0.35);
      this.scene.inputManager?.setTouchDirection(action);
    });
    const release = () => {
      c.setFillStyle(COLORS.UI_PANEL, 0.55);
      this.scene.inputManager?.setTouchDirection(null);
    };
    c.on('pointerup', release);
    c.on('pointerout', release);
  }

  _addActionButton(x, y, r, label, button, color, fontSize) {
    const c = this._makeCircle(x, y, r, label, color, fontSize);
    c.on('pointerdown', () => {
      c.setFillStyle(color, 0.3);
      this.scene.inputManager?.pressTouchButton(button);
    });
    const release = () => c.setFillStyle(COLORS.UI_PANEL, 0.55);
    c.on('pointerup', release);
    c.on('pointerout', release);
  }

  setVisible(visible) {
    this._objects.forEach(o => o.setVisible(visible));
  }

  destroy() {
    this._objects.forEach(o => o.destroy());
    this._objects = [];
  }
}
