/**
 * HintPanel.js — Slide-in hint display for the current level.
 */

import { COLORS, DEPTH, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig.js';

export default class HintPanel {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;

    // Panel background
    this.panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, 500, 50, COLORS.UI_PANEL, 0.9);
    this.panel.setStrokeStyle(1, COLORS.UI_BORDER);
    this.panel.setDepth(DEPTH.TOAST);

    // Hint icon
    this.icon = scene.add.text(GAME_WIDTH / 2 - 220, GAME_HEIGHT - 60, '💡', {
      fontSize: '18px', resolution: 2,
    });
    this.icon.setOrigin(0.5).setDepth(DEPTH.TOAST + 1);

    // Hint text
    this.text = scene.add.text(GAME_WIDTH / 2 + 10, GAME_HEIGHT - 60, '', {
      fontFamily: FONTS.BODY, fontSize: '12px', color: '#f0f6fc',
      wordWrap: { width: 400 }, resolution: 2,
    });
    this.text.setOrigin(0.5).setDepth(DEPTH.TOAST + 1);

    this._allObjects = [this.panel, this.icon, this.text];
    this.hide();
  }

  show(hintText) {
    this.visible = true;
    this.text.setText(hintText);
    this._allObjects.forEach(o => o.setVisible(true));

    // Slide in from bottom
    const targetY = GAME_HEIGHT - 60;
    this.panel.y = GAME_HEIGHT + 30;
    this.icon.y = GAME_HEIGHT + 30;
    this.text.y = GAME_HEIGHT + 30;

    this.scene.tweens.add({
      targets: this._allObjects,
      y: targetY,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Auto-hide after 5 seconds
    this._hideTimer = this.scene.time.delayedCall(5000, () => this.hide());
  }

  hide() {
    if (this._hideTimer) { this._hideTimer.destroy(); this._hideTimer = null; }
    this.visible = false;

    this.scene.tweens.add({
      targets: this._allObjects,
      y: GAME_HEIGHT + 50,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this._allObjects.forEach(o => o.setVisible(false));
      },
    });
  }

  destroy() {
    if (this._hideTimer) this._hideTimer.destroy();
    this._allObjects.forEach(o => o.destroy());
  }
}
