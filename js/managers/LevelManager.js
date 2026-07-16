/**
 * LevelManager.js — Builds and manages a level from data definitions.
 * Handles: tilemap rendering, entity spawning, grid queries, signal wiring.
 */

import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTH, TILE_TYPES, SIGNAL_COLORS } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';
import PressurePlate from '../entities/PressurePlate.js';
import Door from '../entities/Door.js';
import Crate from '../entities/Crate.js';
import MovingPlatform from '../entities/MovingPlatform.js';
import LaserBeam from '../entities/LaserBeam.js';
import Switch from '../entities/Switch.js';
import EnergyCore from '../entities/EnergyCore.js';
import ExitPortal from '../entities/ExitPortal.js';

export default class LevelManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;

    // Grid data
    this.grid = [];        // 2D array of tile characters
    this.width = 0;        // grid columns
    this.height = 0;       // grid rows

    // Pixel offset to center the level in the viewport
    this.offsetX = 0;
    this.offsetY = 0;

    // Entity arrays
    this.plates = [];
    this.doors = [];
    this.crates = [];
    this.platforms = [];
    this.lasers = [];
    this.switches = [];
    this.cores = [];
    this.portal = null;

    // Player start position
    this.playerStartX = 0;
    this.playerStartY = 0;

    // Signal wiring: signalId → { sources: [], listeners: [] }
    this.signals = {};

    // Static tilemap render texture
    this._bgTexture = null;
  }

  // ── Building ──────────────────────────────────────────

  /**
   * Build the level from a level-data object.
   * @param {object} levelData — from LevelData.js
   */
  build(levelData) {
    this.grid = levelData.grid.map(row => row.split(''));
    this.height = this.grid.length;
    this.width = this.grid[0].length;

    // Doors are drawn on wall cells in the grid art; carve those cells into
    // floor so the door entity alone decides whether the tile blocks.
    for (const ent of levelData.entities || []) {
      if (ent.type === 'door' && this.grid[ent.y]?.[ent.x] === TILE_TYPES.WALL) {
        this.grid[ent.y][ent.x] = TILE_TYPES.FLOOR;
      }
    }

    // Center the level in the viewport
    this.offsetX = Math.floor((GAME_WIDTH  - this.width  * TILE_SIZE) / 2);
    this.offsetY = Math.floor((GAME_HEIGHT - this.height * TILE_SIZE) / 2);
    this.scene.offsetX = this.offsetX;
    this.scene.offsetY = this.offsetY;

    // Render static tiles
    this._renderBackground();

    // Find player start and exit from grid
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.grid[y][x];
        if (tile === TILE_TYPES.PLAYER) {
          this.playerStartX = x;
          this.playerStartY = y;
          this.grid[y][x] = TILE_TYPES.FLOOR; // clear marker
        }
      }
    }

    // Build signal registry
    this._buildSignals(levelData);

    // Spawn entities from levelData.entities
    this._spawnEntities(levelData);
  }

  // ── Grid Queries ──────────────────────────────────────

  /** Is (gx,gy) inside the grid? */
  inBounds(gx, gy) {
    return gx >= 0 && gx < this.width && gy >= 0 && gy < this.height;
  }

  /** Is (gx,gy) a wall tile? */
  isWall(gx, gy) {
    if (!this.inBounds(gx, gy)) return true;
    return this.grid[gy][gx] === TILE_TYPES.WALL;
  }

  /** Find a crate at (gx,gy) or null */
  getCrateAt(gx, gy) {
    return this.crates.find(c => c.gridX === gx && c.gridY === gy) || null;
  }

  /** Find a closed door at (gx,gy) or null */
  getBlockingDoorAt(gx, gy) {
    return this.doors.find(d => d.gridX === gx && d.gridY === gy && d.isBlocking()) || null;
  }

  /** Find a switch at (gx,gy) or null */
  getSwitchAt(gx, gy) {
    return this.switches.find(s => s.gridX === gx && s.gridY === gy) || null;
  }

  /** Is (gx,gy) blocked by a wall, closed door, or crate? */
  isBlocked(gx, gy) {
    if (this.isWall(gx, gy)) return true;
    if (this.getBlockingDoorAt(gx, gy)) return true;
    return false;
  }

  /** Check if a tile blocks laser beams (wall, closed door, or crate) */
  blocksLaser(gx, gy) {
    if (this.isWall(gx, gy)) return true;
    if (this.getBlockingDoorAt(gx, gy)) return true;
    if (this.getCrateAt(gx, gy)) return true;
    return false;
  }

  /** Is (gx,gy) occupied by a crate? */
  hasCrate(gx, gy) {
    return this.getCrateAt(gx, gy) !== null;
  }

  // ── Signal System ─────────────────────────────────────

  /**
   * Evaluate all signals based on current plate/switch states.
   * Called once per tick after entity positions update.
   * @param {Array} allEntities — [{gridX, gridY}] — player + clones + crates
   */
  evaluateSignals(allEntities) {
    // First: update pressure plates
    for (const plate of this.plates) {
      const occupied = allEntities.some(e => e.gridX === plate.gridX && e.gridY === plate.gridY);
      const changed = plate.updateState(occupied);
      if (changed && occupied) {
        this.scene.particles?.plateActivate(plate.sprite.x, plate.sprite.y);
        this.scene.game.audioManager?.playPlatePress();
      }
    }

    // Compute signal values: OR over all sources
    const signalValues = {};
    for (const plate of this.plates) {
      if (!signalValues[plate.signalId]) signalValues[plate.signalId] = false;
      if (plate.pressed) signalValues[plate.signalId] = true;
    }
    for (const sw of this.switches) {
      if (!signalValues[sw.signalId]) signalValues[sw.signalId] = false;
      if (sw.isOn) signalValues[sw.signalId] = true;
    }

    // Notify listeners
    for (const door of this.doors) {
      if (door.signalId && signalValues[door.signalId] !== undefined) {
        door.onSignal(signalValues[door.signalId]);
      }
    }
    for (const laser of this.lasers) {
      if (laser.signalId && signalValues[laser.signalId] !== undefined) {
        laser.onSignal(signalValues[laser.signalId]);
      }
    }
    for (const plat of this.platforms) {
      if (plat.signalId && signalValues[plat.signalId] !== undefined) {
        plat.onSignal(signalValues[plat.signalId]);
      }
    }
  }

  /** Recalculate all laser beams */
  recalculateLasers() {
    for (const laser of this.lasers) {
      laser.recalculate((gx, gy) => this.blocksLaser(gx, gy));
    }
  }

  /** Check if any laser hits position (gx,gy) */
  isLaserAt(gx, gy) {
    return this.lasers.some(l => l.hitsPosition(gx, gy));
  }

  // ── Core Tracking ─────────────────────────────────────

  get totalCores() {
    return this.cores.length;
  }

  get collectedCores() {
    return this.cores.filter(c => c.collected).length;
  }

  collectCoreAt(gx, gy) {
    const core = this.cores.find(c => !c.collected && c.gridX === gx && c.gridY === gy);
    if (core) {
      core.collect();
      if (this.scene.particles) {
        this.scene.particles.corePickup(core.sprite.x, core.sprite.y);
      }
      // Update portal
      if (this.portal) {
        this.portal.updateActivation(this.collectedCores);
      }
      return true;
    }
    return false;
  }

  // ── Exit Portal ───────────────────────────────────────

  isExitAt(gx, gy) {
    return this.portal && this.portal.gridX === gx && this.portal.gridY === gy;
  }

  isExitActive() {
    return this.portal && this.portal.active;
  }

  // ── Platform Updates ──────────────────────────────────

  updatePlatforms(tick) {
    const deltas = [];
    for (const plat of this.platforms) {
      const delta = plat.update(tick);
      if (delta) {
        deltas.push({ platform: plat, dx: delta.dx, dy: delta.dy, prevX: plat.gridX - delta.dx, prevY: plat.gridY - delta.dy });
      }
    }
    return deltas;
  }

  // ── Reset All Entities ────────────────────────────────

  resetEntities() {
    this.plates.forEach(p => p.reset());
    this.doors.forEach(d => d.reset());
    this.crates.forEach(c => c.reset());
    this.platforms.forEach(p => p.reset());
    this.lasers.forEach(l => l.reset());
    this.switches.forEach(s => s.reset());
    this.cores.forEach(c => c.reset());
    if (this.portal) this.portal.reset();
  }

  // ── Cleanup ───────────────────────────────────────────

  destroy() {
    this.plates.forEach(p => p.destroy());
    this.doors.forEach(d => d.destroy());
    this.crates.forEach(c => c.destroy());
    this.platforms.forEach(p => p.destroy());
    this.lasers.forEach(l => l.destroy());
    this.switches.forEach(s => s.destroy());
    this.cores.forEach(c => c.destroy());
    if (this.portal) this.portal.destroy();
    if (this._bgTexture) this._bgTexture.destroy();
    if (this._bgBorder) this._bgBorder.destroy();
  }

  // ── Internal ──────────────────────────────────────────

  _renderBackground() {
    // Render all static tiles into a single render texture for performance
    const w = this.width * TILE_SIZE;
    const h = this.height * TILE_SIZE;

    const rt = this.scene.add.renderTexture(this.offsetX, this.offsetY, w, h);
    rt.setOrigin(0, 0);
    rt.setDepth(DEPTH.FLOOR);

    const floorSprite = this.scene.make.sprite({ key: 'floor', add: false });
    const wallSprite  = this.scene.make.sprite({ key: 'wall', add: false });

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.grid[y][x];
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;

        if (tile === TILE_TYPES.WALL) {
          rt.draw(wallSprite, px, py);
        } else if (tile === TILE_TYPES.FLOOR || tile === TILE_TYPES.PLAYER || tile === TILE_TYPES.EXIT) {
          rt.draw(floorSprite, px, py);
        }
      }
    }

    floorSprite.destroy();
    wallSprite.destroy();
    this._bgTexture = rt;

    // Border glow around the level
    const border = this.scene.add.rectangle(
      this.offsetX + w / 2, this.offsetY + h / 2,
      w + 4, h + 4
    );
    border.setStrokeStyle(1, COLORS.WALL_EDGE, 0.4);
    border.setFillStyle(0x000000, 0);
    border.setDepth(DEPTH.FLOOR - 1);
    this._bgBorder = border;
  }

  _buildSignals(levelData) {
    this.signals = {};
    // Signals will be auto-discovered from entity signalIds
  }

  _spawnEntities(levelData) {
    const entities = levelData.entities || [];
    let signalIdx = 0;

    // Find exit position from grid
    let exitX = -1, exitY = -1;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (levelData.grid[y][x] === 'X') {
          exitX = x;
          exitY = y;
        }
      }
    }

    for (const ent of entities) {
      const sc = this._signalColor(ent.signalId);

      switch (ent.type) {
        case 'pressure_plate':
          this.plates.push(new PressurePlate(this.scene, ent.x, ent.y, ent.signalId, sc));
          break;

        case 'door':
          this.doors.push(new Door(this.scene, ent.x, ent.y, ent.signalId, sc));
          break;

        case 'crate':
          this.crates.push(new Crate(this.scene, ent.x, ent.y));
          break;

        case 'laser':
          this.lasers.push(new LaserBeam(
            this.scene, ent.x, ent.y,
            ent.direction || 'right',
            ent.signalId || null,
            ent.startOn !== undefined ? ent.startOn : true
          ));
          break;

        case 'switch':
          this.switches.push(new Switch(
            this.scene, ent.x, ent.y,
            ent.signalId,
            ent.startOn || false
          ));
          break;

        case 'energy_core':
          this.cores.push(new EnergyCore(this.scene, ent.x, ent.y));
          break;

        case 'moving_platform':
          this.platforms.push(new MovingPlatform(
            this.scene,
            ent.waypoints,
            ent.signalId || null,
            ent.autoMove !== undefined ? ent.autoMove : true
          ));
          break;

        default:
          console.warn(`[LevelManager] Unknown entity type: ${ent.type}`);
      }
    }

    // Spawn exit portal
    const requiredCores = levelData.requiredCores ?? this.cores.length;
    if (exitX >= 0) {
      this.portal = new ExitPortal(this.scene, exitX, exitY, requiredCores);
    }
  }

  /** Assign a consistent color to a signal ID */
  _signalColor(signalId) {
    if (!signalId) return null;
    if (!this._signalColorMap) this._signalColorMap = {};
    if (!(signalId in this._signalColorMap)) {
      const idx = Object.keys(this._signalColorMap).length;
      this._signalColorMap[signalId] = SIGNAL_COLORS[idx % SIGNAL_COLORS.length];
    }
    return this._signalColorMap[signalId];
  }
}
