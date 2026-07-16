/**
 * AchievementToast.js — Pop-up notification for newly unlocked achievements.
 */

import { COLORS, DEPTH, FONTS, GAME_WIDTH } from '../config/GameConfig.js';

export default class AchievementToast {
  constructor(scene) {
    this.scene = scene;
    this._queue = [];
    this._showing = false;
  }

  /**
   * Queue a toast for an achievement.
   * @param {{ name: string, icon: string, description: string }} achievement
   */
  show(achievement) {
    this._queue.push(achievement);
    if (!this._showing) this._showNext();
  }

  _showNext() {
    if (this._queue.length === 0) {
      this._showing = false;
      return;
    }

    this._showing = true;
    const ach = this._queue.shift();

    const x = GAME_WIDTH - 20;
    const y = 50;

    // Background
    const bg = this.scene.add.rectangle(x, y, 260, 55, COLORS.UI_PANEL, 0.92);
    bg.setOrigin(1, 0.5);
    bg.setStrokeStyle(1, COLORS.STAR_FILLED, 0.6);
    bg.setDepth(DEPTH.TOAST);

    // Icon
    const icon = this.scene.add.text(x - 230, y, ach.icon, {
      fontSize: '22px', resolution: 2,
    });
    icon.setOrigin(0.5).setDepth(DEPTH.TOAST + 1);

    // Title
    const title = this.scene.add.text(x - 200, y - 10, 'Achievement Unlocked!', {
      fontFamily: FONTS.UI, fontSize: '9px', color: '#ffd740', resolution: 2,
    });
    title.setDepth(DEPTH.TOAST + 1);

    // Name
    const name = this.scene.add.text(x - 200, y + 6, ach.name, {
      fontFamily: FONTS.UI, fontSize: '12px', color: '#f0f6fc', resolution: 2,
    });
    name.setDepth(DEPTH.TOAST + 1);

    const objects = [bg, icon, title, name];

    // Slide in from right
    objects.forEach(o => o.x += 280);
    this.scene.tweens.add({
      targets: objects,
      x: '-=280',
      duration: 400,
      ease: 'Back.easeOut',
    });

    // Slide out after delay
    this.scene.time.delayedCall(3000, () => {
      this.scene.tweens.add({
        targets: objects,
        x: '+=280',
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeIn',
        onComplete: () => {
          objects.forEach(o => o.destroy());
          this._showNext();
        },
      });
    });
  }
}
