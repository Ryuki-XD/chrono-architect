/**
 * AssetGenerator.js — Procedural texture generation.
 * Creates all game sprites via Phaser Graphics at load-time.
 * No external image files required.
 */

import { TILE_SIZE, COLORS } from '../config/GameConfig.js';

const T = TILE_SIZE;
const H = T / 2;

export default class AssetGenerator {
  /**
   * @param {Phaser.Scene} scene — the PreloadScene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /** Generate every texture the game needs */
  generateAll() {
    this._wall();
    this._floor();
    this._player();
    this._clone();
    this._pressurePlate();
    this._door();
    this._crate();
    this._laserEmitter();
    this._laserBeam();
    this._switchObj();
    this._energyCore();
    this._portal();
    this._platform();
    this._particle();
    this._star();
  }

  // ── Individual Generators ─────────────────────────────

  _wall() {
    const g = this.scene.make.graphics({ add: false });
    // Main fill
    g.fillStyle(COLORS.WALL, 1);
    g.fillRect(0, 0, T, T);
    // Top edge highlight
    g.fillStyle(COLORS.WALL_EDGE, 1);
    g.fillRect(0, 0, T, 3);
    // Inner bevel
    g.fillStyle(COLORS.WALL_TOP, 0.3);
    g.fillRect(2, 2, T - 4, T - 4);
    // Grid line
    g.lineStyle(1, 0x2a3366, 0.15);
    g.strokeRect(0, 0, T, T);
    g.generateTexture('wall', T, T);
    g.destroy();
  }

  _floor() {
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(COLORS.FLOOR, 1);
    g.fillRect(0, 0, T, T);
    // Subtle grid dots
    g.fillStyle(COLORS.FLOOR_GRID, 0.4);
    g.fillCircle(0, 0, 1);
    g.fillCircle(T, 0, 1);
    g.fillCircle(0, T, 1);
    g.fillCircle(T, T, 1);
    g.generateTexture('floor', T, T);
    g.destroy();
  }

  _player() {
    const g = this.scene.make.graphics({ add: false });
    const s = T - 4;
    // Glow
    g.fillStyle(COLORS.PLAYER, 0.15);
    g.fillCircle(H, H, H);
    // Body
    g.fillStyle(COLORS.PLAYER, 1);
    g.fillRoundedRect(6, 4, s - 8, s, 4);
    // Visor
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(10, 9, s - 16, 5);
    // Core dot
    g.fillStyle(COLORS.PLAYER, 1);
    g.fillCircle(H, 22, 3);
    g.generateTexture('player', T, T);
    g.destroy();
  }

  _clone() {
    const g = this.scene.make.graphics({ add: false });
    const s = T - 4;
    // Ghost glow
    g.fillStyle(0xffffff, 0.08);
    g.fillCircle(H, H, H);
    // Body (white — tinted per-clone at runtime)
    g.fillStyle(0xffffff, 0.55);
    g.fillRoundedRect(6, 4, s - 8, s, 4);
    // Visor
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(10, 9, s - 16, 5);
    // Core
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(H, 22, 3);
    g.generateTexture('clone', T, T);
    g.destroy();
  }

  _pressurePlate() {
    const g = this.scene.make.graphics({ add: false });
    // Base depression
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(4, 12, T - 8, T - 16, 2);
    // Plate surface
    g.fillStyle(COLORS.PLATE_INACTIVE, 0.8);
    g.fillRoundedRect(5, 13, T - 10, T - 18, 2);
    // Indicator stripe
    g.fillStyle(COLORS.PLATE_ACTIVE, 0.4);
    g.fillRect(10, 15, T - 20, 2);
    g.generateTexture('pressure_plate', T, T);
    g.destroy();

    // Active state
    const g2 = this.scene.make.graphics({ add: false });
    g2.fillStyle(0x000000, 0.3);
    g2.fillRoundedRect(4, 14, T - 8, T - 18, 2);
    g2.fillStyle(COLORS.PLATE_ACTIVE, 0.9);
    g2.fillRoundedRect(5, 15, T - 10, T - 19, 2);
    g2.fillStyle(0xffffff, 0.5);
    g2.fillRect(10, 17, T - 20, 2);
    g2.generateTexture('pressure_plate_active', T, T);
    g2.destroy();
  }

  _door() {
    // Closed
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(COLORS.DOOR_CLOSED, 1);
    g.fillRect(2, 0, T - 4, T);
    // Segments
    for (let y = 0; y < T; y += 8) {
      g.fillStyle(0x000000, 0.25);
      g.fillRect(2, y, T - 4, 1);
    }
    // Edge glow
    g.fillStyle(COLORS.DOOR_CLOSED, 0.5);
    g.fillRect(0, 0, 2, T);
    g.fillRect(T - 2, 0, 2, T);
    g.generateTexture('door_closed', T, T);
    g.destroy();

    // Open
    const g2 = this.scene.make.graphics({ add: false });
    g2.fillStyle(COLORS.DOOR_OPEN, 0.3);
    g2.fillRect(0, 0, 4, T);
    g2.fillRect(T - 4, 0, 4, T);
    g2.generateTexture('door_open', T, T);
    g2.destroy();
  }

  _crate() {
    const g = this.scene.make.graphics({ add: false });
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillRect(3, 3, T - 4, T - 4);
    // Body
    g.fillStyle(COLORS.CRATE, 1);
    g.fillRect(1, 1, T - 4, T - 4);
    // Edge
    g.lineStyle(1, COLORS.CRATE_EDGE, 0.8);
    g.strokeRect(1, 1, T - 4, T - 4);
    // Cross detail
    g.lineStyle(1, COLORS.CRATE_EDGE, 0.4);
    g.lineBetween(1, 1, T - 3, T - 3);
    g.lineBetween(T - 3, 1, 1, T - 3);
    g.generateTexture('crate', T, T);
    g.destroy();
  }

  _laserEmitter() {
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(0x333333, 1);
    g.fillRect(4, 4, T - 8, T - 8);
    g.fillStyle(COLORS.LASER, 0.9);
    g.fillCircle(H, H, 5);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(H, H, 2);
    g.generateTexture('laser_emitter', T, T);
    g.destroy();
  }

  _laserBeam() {
    // Horizontal beam segment (1 tile wide)
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(COLORS.LASER, 0.3);
    g.fillRect(0, H - 4, T, 8);
    g.fillStyle(COLORS.LASER, 0.7);
    g.fillRect(0, H - 2, T, 4);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(0, H - 1, T, 2);
    g.generateTexture('laser_beam_h', T, T);
    g.destroy();

    // Vertical beam segment
    const g2 = this.scene.make.graphics({ add: false });
    g2.fillStyle(COLORS.LASER, 0.3);
    g2.fillRect(H - 4, 0, 8, T);
    g2.fillStyle(COLORS.LASER, 0.7);
    g2.fillRect(H - 2, 0, 4, T);
    g2.fillStyle(0xffffff, 0.5);
    g2.fillRect(H - 1, 0, 2, T);
    g2.generateTexture('laser_beam_v', T, T);
    g2.destroy();
  }

  _switchObj() {
    // Off
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(0x333333, 1);
    g.fillRoundedRect(8, 6, T - 16, T - 12, 3);
    g.fillStyle(COLORS.SWITCH_OFF, 1);
    g.fillCircle(H, H, 6);
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(H, H, 3);
    g.generateTexture('switch_off', T, T);
    g.destroy();

    // On
    const g2 = this.scene.make.graphics({ add: false });
    g2.fillStyle(0x333333, 1);
    g2.fillRoundedRect(8, 6, T - 16, T - 12, 3);
    g2.fillStyle(COLORS.SWITCH_ON, 1);
    g2.fillCircle(H, H, 6);
    g2.fillStyle(0xffffff, 0.6);
    g2.fillCircle(H, H, 3);
    g2.generateTexture('switch_on', T, T);
    g2.destroy();
  }

  _energyCore() {
    const g = this.scene.make.graphics({ add: false });
    // Glow
    g.fillStyle(COLORS.ENERGY_GLOW, 0.15);
    g.fillCircle(H, H, 12);
    // Outer ring
    g.lineStyle(2, COLORS.ENERGY_CORE, 0.7);
    g.strokeCircle(H, H, 8);
    // Inner fill
    g.fillStyle(COLORS.ENERGY_CORE, 0.9);
    g.fillCircle(H, H, 5);
    // Highlight
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(H - 2, H - 2, 2);
    g.generateTexture('energy_core', T, T);
    g.destroy();
  }

  _portal() {
    // Inactive
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(COLORS.PORTAL_INACTIVE, 0.4);
    g.fillCircle(H, H, 12);
    g.lineStyle(2, COLORS.PORTAL_INACTIVE, 0.6);
    g.strokeCircle(H, H, 12);
    g.fillStyle(COLORS.PORTAL_INACTIVE, 0.2);
    g.fillCircle(H, H, 6);
    g.generateTexture('portal_inactive', T, T);
    g.destroy();

    // Active
    const g2 = this.scene.make.graphics({ add: false });
    g2.fillStyle(COLORS.PORTAL_ACTIVE, 0.2);
    g2.fillCircle(H, H, 14);
    g2.lineStyle(2, COLORS.PORTAL_ACTIVE, 0.8);
    g2.strokeCircle(H, H, 12);
    g2.fillStyle(COLORS.PORTAL_ACTIVE, 0.6);
    g2.fillCircle(H, H, 7);
    g2.fillStyle(0xffffff, 0.5);
    g2.fillCircle(H, H, 3);
    g2.generateTexture('portal_active', T, T);
    g2.destroy();
  }

  _platform() {
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(COLORS.PLATFORM, 0.9);
    g.fillRect(1, 1, T - 2, T - 2);
    g.lineStyle(1, COLORS.PLATFORM_EDGE, 0.8);
    g.strokeRect(1, 1, T - 2, T - 2);
    // Arrow indicators
    g.fillStyle(0xffffff, 0.2);
    g.fillTriangle(H, 6, H - 4, 12, H + 4, 12);
    g.fillTriangle(H, T - 6, H - 4, T - 12, H + 4, T - 12);
    g.generateTexture('platform', T, T);
    g.destroy();
  }

  _particle() {
    // Generic small particle
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();

    // Soft glow particle
    const g2 = this.scene.make.graphics({ add: false });
    g2.fillStyle(0xffffff, 0.3);
    g2.fillCircle(8, 8, 8);
    g2.fillStyle(0xffffff, 0.7);
    g2.fillCircle(8, 8, 4);
    g2.generateTexture('particle_soft', 16, 16);
    g2.destroy();
  }

  _star() {
    // 5-pointed star for ratings
    const size = 20;
    const g = this.scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    const cx = size / 2, cy = size / 2, r = size / 2 - 1, ir = r * 0.4;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
      const radius = i % 2 === 0 ? r : ir;
      pts.push(cx + Math.cos(angle) * radius);
      pts.push(cy + Math.sin(angle) * radius);
    }
    g.beginPath();
    g.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) {
      g.lineTo(pts[i], pts[i + 1]);
    }
    g.closePath();
    g.fillPath();
    g.generateTexture('star', size, size);
    g.destroy();
  }
}
