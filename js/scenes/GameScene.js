/**
 * GameScene.js — Core gameplay scene.
 * Manages the tick-based game loop, entity interactions, recording/replay, and win conditions.
 */

import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, TICK_RATE,
         ACTIONS, DIRECTION_VECTORS, DEPTH } from '../config/GameConfig.js';
import { gridToPixel } from '../utils/MathUtils.js';
import LevelManager from '../managers/LevelManager.js';
import CloneManager from '../managers/CloneManager.js';
import InputManager from '../managers/InputManager.js';
import ParticleEffects from '../utils/ParticleEffects.js';
import Player from '../entities/Player.js';
import TouchControls from '../ui/TouchControls.js';
import LEVELS from '../data/LevelData.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  // ── Lifecycle ─────────────────────────────────────────

  init(data) {
    this.levelId = data.levelId || 1;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG_DARK);

    // Lookup level data
    this.levelData = LEVELS.find(l => l.id === this.levelId);
    if (!this.levelData) {
      console.error(`Level ${this.levelId} not found!`);
      this.scene.start(SCENES.LEVEL_SELECT);
      return;
    }

    // Managers
    this.particles = new ParticleEffects(this);
    this.levelManager = new LevelManager(this);
    this.levelManager.build(this.levelData);
    this.inputManager = new InputManager(this);

    // On-screen controls for touch devices (?touch=1 forces them for testing)
    const wantsTouch = this.sys.game.device.input.touch
      || new URLSearchParams(window.location.search).has('touch');
    this.touchControls = wantsTouch ? new TouchControls(this) : null;

    this.cloneManager = new CloneManager(
      this,
      this.levelManager.playerStartX,
      this.levelManager.playerStartY,
      this.levelData.maxClones
    );

    // Player
    this.player = new Player(this, this.levelManager.playerStartX, this.levelManager.playerStartY);

    // State
    this.isPaused = false;
    this.isComplete = false;
    this.isRecording = true;    // Always recording from round start
    this.tickAccumulator = 0;
    this.elapsedTime = 0;
    this.moveCount = 0;
    this.restartCount = 0;
    this.usedHint = false;

    // Indicate recording
    this.player.setRecording(true);

    // Initial laser calculation
    this.levelManager.recalculateLasers();

    // Launch the UI overlay scene
    if (!this.scene.isActive(SCENES.UI)) {
      this.scene.launch(SCENES.UI);
    }

    // Send initial HUD data
    this._emitHUD();

    // Listen for UI commands
    this.game.events.on('ui:resume', this._onResume, this);
    this.game.events.on('ui:restart', this._fullRestart, this);
    this.game.events.on('ui:levelSelect', () => this._goToLevelSelect(), this);
    this.game.events.on('ui:mainMenu', () => this._goToMainMenu(), this);
    this.game.events.on('ui:nextLevel', () => this._nextLevel(), this);
    this.game.events.on('ui:replay', () => this._fullRestart(), this);

    // Audio
    this.game.audioManager?.init();
    this.game.audioManager?.resume();
  }

  update(time, delta) {
    if (this.isPaused || this.isComplete) return;

    // Handle meta-keys (not tick-dependent)
    this._handleMetaInput();

    // Accumulate time for tick system
    this.tickAccumulator += delta;
    this.elapsedTime += delta;

    // Process ticks
    while (this.tickAccumulator >= TICK_RATE) {
      this.tickAccumulator -= TICK_RATE;
      this._processTick();
    }

    // Update HUD
    this._emitHUD();
  }

  // ── Tick Processing ───────────────────────────────────

  _processTick() {
    if (this.isComplete || !this.player.alive) return;

    const tick = this.cloneManager.tick();

    // 1. Get player input
    const playerAction = this.inputManager.getAction();

    // 2. Record player action
    this.cloneManager.recordAction(playerAction);

    // 3. Execute player action
    this._executeAction(this.player, playerAction);

    // 4. Execute clone actions
    const cloneActions = this.cloneManager.getCloneActions();
    for (const { clone, action } of cloneActions) {
      if (clone.alive) {
        this._executeAction(clone, action);
      }
    }

    // 5. Update moving platforms
    const platDeltas = this.levelManager.updatePlatforms(tick);
    for (const { platform, dx, dy, prevX, prevY } of platDeltas) {
      this._carryEntitiesOnPlatform(prevX, prevY, dx, dy);
    }

    // 6. Gather all entity positions for signal evaluation
    const allEntities = this._getAllEntityPositions();

    // 7. Evaluate signals (pressure plates, switches → doors, lasers)
    this.levelManager.evaluateSignals(allEntities);

    // 8. Recalculate laser beams
    this.levelManager.recalculateLasers();

    // 9. Check laser collisions
    this._checkLaserCollisions();

    // 10. Check energy core pickups (player only)
    this.levelManager.collectCoreAt(this.player.gridX, this.player.gridY);

    // 11. Check win condition
    this._checkWinCondition();
  }

  // ── Action Execution ──────────────────────────────────

  _executeAction(entity, action) {
    // Handle interaction
    if (action === ACTIONS.INTERACT) {
      const sw = this.levelManager.getSwitchAt(entity.gridX, entity.gridY);
      if (sw) {
        sw.toggle();
      }
      return;
    }

    // Handle movement
    const dir = DIRECTION_VECTORS[action];
    if (!dir) return; // WAIT

    const nx = entity.gridX + dir.x;
    const ny = entity.gridY + dir.y;

    // Check wall
    if (this.levelManager.isWall(nx, ny)) return;

    // Check closed door
    if (this.levelManager.getBlockingDoorAt(nx, ny)) return;

    // Check crate (try to push)
    const crate = this.levelManager.getCrateAt(nx, ny);
    if (crate) {
      const cx = nx + dir.x;
      const cy = ny + dir.y;
      // Can push if destination is clear
      if (!this.levelManager.isWall(cx, cy) &&
          !this.levelManager.getBlockingDoorAt(cx, cy) &&
          !this.levelManager.getCrateAt(cx, cy)) {
        crate.moveTo(cx, cy);
      } else {
        return; // Can't push
      }
    }

    // Move entity
    entity.moveTo(nx, ny);
    if (action !== ACTIONS.WAIT) {
      this.moveCount++;
      this.game.audioManager?.playFootstep();
    }
  }

  // ── Helpers ───────────────────────────────────────────

  _getAllEntityPositions() {
    const positions = [];

    // Player
    if (this.player.alive) {
      positions.push({ gridX: this.player.gridX, gridY: this.player.gridY });
    }

    // Clones
    for (const clone of this.cloneManager.clones) {
      if (clone.alive) {
        positions.push({ gridX: clone.gridX, gridY: clone.gridY });
      }
    }

    // Crates
    for (const crate of this.levelManager.crates) {
      positions.push({ gridX: crate.gridX, gridY: crate.gridY });
    }

    return positions;
  }

  _carryEntitiesOnPlatform(platPrevX, platPrevY, dx, dy) {
    // Move player if on the platform's previous position
    if (this.player.alive && this.player.gridX === platPrevX && this.player.gridY === platPrevY) {
      this.player.moveTo(this.player.gridX + dx, this.player.gridY + dy);
    }
    // Move clones
    for (const clone of this.cloneManager.clones) {
      if (clone.alive && clone.gridX === platPrevX && clone.gridY === platPrevY) {
        clone.moveTo(clone.gridX + dx, clone.gridY + dy);
      }
    }
    // Move crates
    for (const crate of this.levelManager.crates) {
      if (crate.gridX === platPrevX && crate.gridY === platPrevY) {
        crate.moveTo(crate.gridX + dx, crate.gridY + dy);
      }
    }
  }

  _checkLaserCollisions() {
    // Player
    if (this.player.alive && this.levelManager.isLaserAt(this.player.gridX, this.player.gridY)) {
      this._onPlayerDeath();
      return;
    }
    // Clones
    for (const clone of this.cloneManager.clones) {
      if (clone.alive && this.levelManager.isLaserAt(clone.gridX, clone.gridY)) {
        clone.die();
        this.particles.laserHit(clone.sprite.x, clone.sprite.y);
      }
    }
  }

  _onPlayerDeath() {
    this.player.die();
    this.game.audioManager?.playLaserDeath();
    this.particles.laserHit(this.player.sprite.x, this.player.sprite.y);

    // Restart round after short delay
    this.time.delayedCall(800, () => {
      this._restartRound();
    });
  }

  _checkWinCondition() {
    if (!this.player.alive) return;

    if (this.levelManager.isExitAt(this.player.gridX, this.player.gridY) &&
        this.levelManager.isExitActive()) {
      this._onLevelComplete();
    }
  }

  // ── Level Complete ────────────────────────────────────

  _onLevelComplete() {
    this.isComplete = true;
    this.inputManager.setEnabled(false);

    // Calculate stars
    const stars = this._calculateStars();

    const stats = {
      levelId: this.levelId,
      time: this.elapsedTime,
      moves: this.moveCount,
      clones: this.cloneManager.cloneCount,
      cores: this.levelManager.collectedCores,
      totalCores: this.levelManager.totalCores,
      stars,
      restarts: this.restartCount,
      usedHint: this.usedHint,
    };

    // Save progress
    const result = this.game.saveManager.completeLevel(this.levelId, stats);
    stats.isNewBest = result.newBest;

    // Update stats
    this.game.saveManager.addStats({
      totalClones: this.cloneManager.totalClonesCreated,
      totalMoves: this.moveCount,
      totalTime: this.elapsedTime,
    });

    // Check achievements
    this.game.achievementManager.checkOnLevelComplete(stats);

    // Audio
    this.game.audioManager?.playLevelComplete();

    // Emit to UI
    this.game.events.emit('game:levelComplete', stats);
  }

  _calculateStars() {
    let stars = 1; // Base: completed the level

    // Star 2: Under par time OR par moves
    if (this.elapsedTime <= this.levelData.parTime * 1000 ||
        this.moveCount <= this.levelData.parMoves) {
      stars = 2;
    }

    // Star 3: Under par time AND par moves AND par clones
    if (this.elapsedTime <= this.levelData.parTime * 1000 &&
        this.moveCount <= this.levelData.parMoves &&
        this.cloneManager.cloneCount <= this.levelData.parClones) {
      stars = 3;
    }

    return stars;
  }

  // ── Meta Input (not tick-dependent) ───────────────────

  _handleMetaInput() {
    // Pause
    if (this.inputManager.justPressedPause()) {
      this._togglePause();
      return;
    }

    if (this.isPaused) return;

    // Commit clone (SPACE)
    if (this.inputManager.justPressedRecord()) {
      this._commitClone();
    }

    // Restart level (R)
    if (this.inputManager.justPressedRestart()) {
      this._fullRestart();
    }

    // Undo last clone (U)
    if (this.inputManager.justPressedUndo()) {
      this._undoClone();
    }

    // Hint (H)
    if (this.inputManager.justPressedHint()) {
      this._showHint();
    }
  }

  // ── Clone Operations ──────────────────────────────────

  _commitClone() {
    if (!this.cloneManager.canCreateClone) return;
    if (this.cloneManager.currentRecording.length < 2) return; // too short

    const clone = this.cloneManager.commit();
    if (clone) {
      // Spawn effect
      const pos = gridToPixel(clone.startX, clone.startY, this.offsetX, this.offsetY);
      this.particles.cloneSpawn(pos.x, pos.y, COLORS.CLONE_TINTS[clone.colorIndex % COLORS.CLONE_TINTS.length]);
      this.game.audioManager?.playCloneCreate();

      // Achievement check
      this.game.saveManager.addStats({ totalClones: 1 });
      this.game.achievementManager.checkOnCloneCreate(this.cloneManager.cloneCount);

      // Restart round with new clone
      this._restartRound();
    }
  }

  _undoClone() {
    if (this.cloneManager.undo()) {
      this._restartRound();
    }
  }

  _restartRound() {
    // Reset level entities to initial state
    this.levelManager.resetEntities();

    // Reset player
    this.player.reset();
    this.player.setRecording(true);

    // Start new round (resets tick, resets clone positions)
    this.cloneManager.startRound();

    // Reset tick accumulator
    this.tickAccumulator = 0;

    // Recalculate lasers
    this.levelManager.recalculateLasers();

    // Keep timer and move count running across rounds
    this.isRecording = true;
  }

  _fullRestart() {
    this.restartCount++;
    this.game.saveManager.addStats({ restarts: 1 });

    // Destroy all clones
    this.cloneManager.destroyAll();

    // Reset everything
    this.levelManager.resetEntities();
    this.player.reset();
    this.player.setRecording(true);

    // Reset counters
    this.tickAccumulator = 0;
    this.elapsedTime = 0;
    this.moveCount = 0;
    this.isRecording = true;
    this.isComplete = false;
    this.isPaused = false;
    this.inputManager.setEnabled(true);

    // Reinit clone manager
    this.cloneManager = new CloneManager(
      this,
      this.levelManager.playerStartX,
      this.levelManager.playerStartY,
      this.levelData.maxClones
    );

    this.levelManager.recalculateLasers();
    this.game.events.emit('game:resumed');
  }

  // ── Pause ─────────────────────────────────────────────

  _togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.game.events.emit('game:paused');
    } else {
      this.game.events.emit('game:resumed');
    }
  }

  _onResume() {
    this.isPaused = false;
    this.game.events.emit('game:resumed');
  }

  // ── Navigation ────────────────────────────────────────

  _goToLevelSelect() {
    this._cleanup();
    this.scene.stop(SCENES.UI);
    this.scene.start(SCENES.LEVEL_SELECT);
  }

  _goToMainMenu() {
    this._cleanup();
    this.scene.stop(SCENES.UI);
    this.scene.start(SCENES.MAIN_MENU);
  }

  _nextLevel() {
    const nextId = this.levelId + 1;
    this._cleanup();
    if (nextId <= LEVELS.length) {
      this.scene.restart({ levelId: nextId });
    } else {
      this.scene.stop(SCENES.UI);
      this.scene.start(SCENES.MAIN_MENU);
    }
  }

  _showHint() {
    if (this.levelData.hint) {
      this.usedHint = true;
      this.game.saveManager.addStats({ hintsUsed: 1 });
      this.game.events.emit('game:showHint', this.levelData.hint);
    }
  }

  // ── HUD ───────────────────────────────────────────────

  _emitHUD() {
    this.game.events.emit('game:hudUpdate', {
      levelName: `${this.levelId}. ${this.levelData.name}`,
      time: this.elapsedTime,
      moves: this.moveCount,
      clones: this.cloneManager.cloneCount,
      maxClones: this.levelData.maxClones,
      cores: this.levelManager.collectedCores,
      totalCores: this.levelManager.totalCores,
      recording: this.isRecording,
    });
  }

  // ── Cleanup ───────────────────────────────────────────

  _cleanup() {
    this.game.events.off('ui:resume', this._onResume, this);
    this.game.events.off('ui:restart');
    this.game.events.off('ui:levelSelect');
    this.game.events.off('ui:mainMenu');
    this.game.events.off('ui:nextLevel');
    this.game.events.off('ui:replay');

    this.inputManager?.destroy();
    this.touchControls?.destroy();
    this.cloneManager?.destroy();
    this.levelManager?.destroy();
    this.player?.destroy();
  }

  shutdown() {
    this._cleanup();
  }
}
