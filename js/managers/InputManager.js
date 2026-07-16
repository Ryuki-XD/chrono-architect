/**
 * InputManager.js — Grid-aligned input handling.
 * Buffers directional + action keys and provides one action per game tick.
 */

import { ACTIONS } from '../config/GameConfig.js';

export default class InputManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this._bufferedAction = ACTIONS.WAIT;
    this._interactPressed = false;
    this._enabled = true;

    // Touch input state (set by TouchControls)
    this._touchDirection = null;
    this._touchFlags = { record: false, restart: false, undo: false, hint: false, pause: false };

    // Key objects
    const kb = scene.input.keyboard;
    this.keys = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up2:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down2:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left2:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right2: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      interact: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      record:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      restart:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      undo:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      hint:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.H),
      pause:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };

    // Prevent keys from propagating to browser
    kb.addCapture([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.E,
      Phaser.Input.Keyboard.KeyCodes.R,
      Phaser.Input.Keyboard.KeyCodes.U,
      Phaser.Input.Keyboard.KeyCodes.H,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.ESC,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ]);

    // One-shot key listeners
    this.keys.interact.on('down', () => { this._interactPressed = true; });
  }

  // ── Public ────────────────────────────────────────────

  setEnabled(flag) {
    this._enabled = flag;
  }

  /** Hold/release a directional action from the on-screen D-pad. */
  setTouchDirection(action) {
    this._touchDirection = action || null;
  }

  /** One-shot press from an on-screen button: 'interact', 'record', 'restart', 'undo', 'hint', 'pause'. */
  pressTouchButton(name) {
    if (name === 'interact') {
      this._interactPressed = true;
    } else if (name in this._touchFlags) {
      this._touchFlags[name] = true;
    }
  }

  _consumeTouch(name) {
    if (this._touchFlags[name]) {
      this._touchFlags[name] = false;
      return true;
    }
    return false;
  }

  /**
   * Poll current directional / interact input and return a single action.
   * Called once per game tick. Resets single-press flags after reading.
   */
  getAction() {
    if (!this._enabled) return ACTIONS.WAIT;

    // Interact takes priority
    if (this._interactPressed) {
      this._interactPressed = false;
      return ACTIONS.INTERACT;
    }

    // Directional — last pressed wins (no diagonal)
    if (this.keys.up.isDown || this.keys.up2.isDown)       return ACTIONS.MOVE_UP;
    if (this.keys.down.isDown || this.keys.down2.isDown)   return ACTIONS.MOVE_DOWN;
    if (this.keys.left.isDown || this.keys.left2.isDown)   return ACTIONS.MOVE_LEFT;
    if (this.keys.right.isDown || this.keys.right2.isDown) return ACTIONS.MOVE_RIGHT;

    // On-screen D-pad (held)
    if (this._touchDirection) return this._touchDirection;

    return ACTIONS.WAIT;
  }

  /** Was SPACE just pressed this frame? (single-shot) */
  justPressedRecord() {
    return Phaser.Input.Keyboard.JustDown(this.keys.record) || this._consumeTouch('record');
  }

  justPressedRestart() {
    return Phaser.Input.Keyboard.JustDown(this.keys.restart) || this._consumeTouch('restart');
  }

  justPressedUndo() {
    return Phaser.Input.Keyboard.JustDown(this.keys.undo) || this._consumeTouch('undo');
  }

  justPressedHint() {
    return Phaser.Input.Keyboard.JustDown(this.keys.hint) || this._consumeTouch('hint');
  }

  justPressedPause() {
    return Phaser.Input.Keyboard.JustDown(this.keys.pause) || this._consumeTouch('pause');
  }

  destroy() {
    this.scene.input.keyboard.removeAllKeys(true);
  }
}
