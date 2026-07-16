/**
 * HUD.js — Heads-up display overlay showing timer, moves, clones, cores, and recording state.
 */

import { COLORS, DEPTH, FONTS, GAME_WIDTH } from '../config/GameConfig.js';
import { formatTime } from '../utils/MathUtils.js';

export default class HUD {
  /**
   * @param {Phaser.Scene} scene — the UIScene
   */
  constructor(scene) {
    this.scene = scene;

    const y = 14;
    const style = { fontFamily: FONTS.UI, fontSize: '13px', color: '#f0f6fc', resolution: 2 };
    const dimStyle = { ...style, color: '#8b949e', fontSize: '10px' };

    // Top bar background
    this.topBar = scene.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 36, COLORS.UI_BG, 0.75);
    this.topBar.setOrigin(0.5, 0).setDepth(DEPTH.HUD_BG);

    // Level name (left)
    this.levelName = scene.add.text(16, y, '', { ...style, fontSize: '14px', fontStyle: 'bold' });
    this.levelName.setDepth(DEPTH.HUD);

    // Timer (center-left)
    this.timerLabel = scene.add.text(280, y - 2, '⏱', { ...dimStyle });
    this.timerLabel.setDepth(DEPTH.HUD);
    this.timerText = scene.add.text(296, y, '00:00', style);
    this.timerText.setDepth(DEPTH.HUD);

    // Move counter (center)
    this.moveLabel = scene.add.text(400, y - 2, '👣', { ...dimStyle });
    this.moveLabel.setDepth(DEPTH.HUD);
    this.moveText = scene.add.text(416, y, '0', style);
    this.moveText.setDepth(DEPTH.HUD);

    // Clone count (center-right)
    this.cloneLabel = scene.add.text(500, y - 2, '👥', { ...dimStyle });
    this.cloneLabel.setDepth(DEPTH.HUD);
    this.cloneText = scene.add.text(516, y, '0 / 0', style);
    this.cloneText.setDepth(DEPTH.HUD);

    // Core count (right)
    this.coreLabel = scene.add.text(630, y - 2, '💎', { ...dimStyle });
    this.coreLabel.setDepth(DEPTH.HUD);
    this.coreText = scene.add.text(646, y, '0 / 0', style);
    this.coreText.setDepth(DEPTH.HUD);

    // Recording indicator (far right)
    this.recordDot = scene.add.circle(780, y + 4, 5, COLORS.UI_RECORDING);
    this.recordDot.setDepth(DEPTH.HUD);
    this.recordDot.setAlpha(0);
    this.recordLabel = scene.add.text(792, y, 'REC', {
      ...style, color: '#ff1744', fontSize: '11px', fontStyle: 'bold'
    });
    this.recordLabel.setDepth(DEPTH.HUD);
    this.recordLabel.setAlpha(0);

    // Controls hint (bottom)
    this.controlsHint = scene.add.text(GAME_WIDTH / 2, 754, 'WASD Move  |  SPACE Clone  |  E Interact  |  R Restart  |  U Undo  |  H Hint  |  ESC Pause', {
      fontFamily: FONTS.BODY, fontSize: '10px', color: '#6e7681', resolution: 2,
    });
    this.controlsHint.setOrigin(0.5, 0.5).setDepth(DEPTH.HUD);

    this._recordPulse = null;
  }

  /**
   * Update all HUD elements.
   */
  update(data) {
    if (data.levelName !== undefined) this.levelName.setText(data.levelName);
    if (data.time !== undefined) this.timerText.setText(formatTime(data.time));
    if (data.moves !== undefined) this.moveText.setText(String(data.moves));
    if (data.clones !== undefined && data.maxClones !== undefined) {
      this.cloneText.setText(`${data.clones} / ${data.maxClones}`);
    }
    if (data.cores !== undefined && data.totalCores !== undefined) {
      this.coreText.setText(`${data.cores} / ${data.totalCores}`);
    }
    if (data.recording !== undefined) {
      this._setRecording(data.recording);
    }
  }

  _setRecording(active) {
    const alpha = active ? 1 : 0;
    this.recordDot.setAlpha(alpha);
    this.recordLabel.setAlpha(alpha);

    if (active && !this._recordPulse) {
      this._recordPulse = this.scene.tweens.add({
        targets: this.recordDot,
        alpha: { from: 1, to: 0.2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    } else if (!active && this._recordPulse) {
      this._recordPulse.destroy();
      this._recordPulse = null;
    }
  }

  setVisible(visible) {
    const alpha = visible ? 1 : 0;
    [this.topBar, this.levelName, this.timerLabel, this.timerText,
     this.moveLabel, this.moveText, this.cloneLabel, this.cloneText,
     this.coreLabel, this.coreText, this.controlsHint].forEach(o => o.setAlpha(alpha));
    if (!visible) {
      this.recordDot.setAlpha(0);
      this.recordLabel.setAlpha(0);
    }
  }

  destroy() {
    if (this._recordPulse) this._recordPulse.destroy();
    [this.topBar, this.levelName, this.timerLabel, this.timerText,
     this.moveLabel, this.moveText, this.cloneLabel, this.cloneText,
     this.coreLabel, this.coreText, this.recordDot, this.recordLabel,
     this.controlsHint].forEach(o => o.destroy());
  }
}
