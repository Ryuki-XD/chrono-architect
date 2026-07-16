/**
 * LevelSelectScene.js — Grid of 20 levels with lock / completion states.
 */

import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, FONTS, DEPTH } from '../config/GameConfig.js';
import LEVELS from '../data/LevelData.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEVEL_SELECT });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG_DARK);

    // Title
    this.add.text(GAME_WIDTH / 2, 50, 'SELECT LEVEL', {
      fontFamily: FONTS.TITLE, fontSize: '26px', color: '#00e5ff', resolution: 2,
    }).setOrigin(0.5);

    // Back button
    this._createButton(80, 50, '← Back', () => {
      this.game.audioManager?.playUIConfirm();
      this.scene.start(SCENES.MAIN_MENU);
    });

    // Level grid: 5 columns x 4 rows
    const cols = 5;
    const cellW = 140;
    const cellH = 120;
    const startX = (GAME_WIDTH - cols * cellW) / 2 + cellW / 2;
    const startY = 130;

    LEVELS.forEach((level, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      this._createLevelCard(x, y, level);
    });

    // Achievement summary at bottom
    const ach = this.game.achievementManager;
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, `🏆 Achievements: ${ach.unlockedCount} / ${ach.totalCount}`, {
      fontFamily: FONTS.UI, fontSize: '11px', color: '#6e7681', resolution: 2,
    }).setOrigin(0.5);
  }

  _createLevelCard(x, y, level) {
    const save = this.game.saveManager;
    const unlocked = save.isLevelUnlocked(level.id);
    const data = save.getLevelData(level.id);
    const completed = data?.completed;
    const stars = data?.stars || 0;

    // Card background
    const bg = this.add.rectangle(x, y, 120, 100, COLORS.UI_PANEL, unlocked ? 0.9 : 0.4);
    bg.setStrokeStyle(1, completed ? COLORS.UI_SUCCESS : (unlocked ? COLORS.UI_BORDER : 0x222222), completed ? 0.6 : 0.5);

    if (unlocked) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        bg.setFillStyle(COLORS.UI_PRIMARY, 0.12);
        bg.setStrokeStyle(1, COLORS.UI_PRIMARY, 0.5);
        this.game.audioManager?.playUIBlip();
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(COLORS.UI_PANEL, 0.9);
        bg.setStrokeStyle(1, completed ? COLORS.UI_SUCCESS : COLORS.UI_BORDER, completed ? 0.6 : 0.5);
      });
      bg.on('pointerdown', () => {
        this.game.audioManager?.playUIConfirm();
        this.scene.start(SCENES.GAME, { levelId: level.id });
      });
    }

    // Level number
    this.add.text(x, y - 25, String(level.id), {
      fontFamily: FONTS.UI, fontSize: '22px',
      color: unlocked ? '#f0f6fc' : '#484f58',
      fontStyle: 'bold', resolution: 2,
    }).setOrigin(0.5);

    // Level name
    this.add.text(x, y + 5, level.name, {
      fontFamily: FONTS.BODY, fontSize: '10px',
      color: unlocked ? '#8b949e' : '#363b42',
      resolution: 2,
    }).setOrigin(0.5);

    // Stars
    if (completed) {
      for (let s = 0; s < 3; s++) {
        const star = this.add.sprite(x - 15 + s * 15, y + 30, 'star');
        star.setScale(0.7);
        star.setTint(s < stars ? COLORS.STAR_FILLED : COLORS.STAR_EMPTY);
      }
    }

    // Lock icon
    if (!unlocked) {
      this.add.text(x, y - 5, '🔒', {
        fontSize: '20px', resolution: 2,
      }).setOrigin(0.5);
    }
  }

  _createButton(x, y, label, callback) {
    const txt = this.add.text(x, y, label, {
      fontFamily: FONTS.UI, fontSize: '13px', color: '#8b949e', resolution: 2,
    });
    txt.setOrigin(0.5);
    txt.setInteractive({ useHandCursor: true });
    txt.on('pointerover', () => txt.setColor('#00e5ff'));
    txt.on('pointerout', () => txt.setColor('#8b949e'));
    txt.on('pointerdown', callback);
    return txt;
  }
}
