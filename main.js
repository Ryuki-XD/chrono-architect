/**
 * main.js — Phaser 3 game bootstrap for Chrono Architect.
 */

import BootScene from './js/scenes/BootScene.js';
import PreloadScene from './js/scenes/PreloadScene.js';
import MainMenuScene from './js/scenes/MainMenuScene.js';
import LevelSelectScene from './js/scenes/LevelSelectScene.js';
import GameScene from './js/scenes/GameScene.js';
import UIScene from './js/scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#080c18',
  pixelArt: false,
  antialias: true,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },

  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    LevelSelectScene,
    GameScene,
    UIScene,
  ],

  // Performance
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },

  input: {
    keyboard: true,
    mouse: true,
    touch: true,
  },

  render: {
    transparent: false,
    clearBeforeRender: true,
    premultipliedAlpha: true,
  },
};

// Launch
const game = new Phaser.Game(config);

// Animate the HTML loading bar while Phaser initialises
const loadingBar = document.getElementById('loading-bar');
if (loadingBar) {
  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + 8, 90);
    loadingBar.style.width = progress + '%';
    if (progress >= 90) clearInterval(interval);
  }, 100);
}
