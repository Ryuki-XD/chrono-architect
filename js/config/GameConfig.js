/**
 * GameConfig.js — Central configuration constants for Chrono Architect.
 * All shared values (sizes, colors, timing, enums) live here.
 */

// ── Dimensions ──────────────────────────────────────────────
export const TILE_SIZE = 32;
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// ── Timing ──────────────────────────────────────────────────
/** Duration (ms) of the smooth tween between grid tiles */
export const MOVE_DURATION = 140;
/** Interval (ms) between game-logic ticks — one action per tick */
export const TICK_RATE = 200;

// ── Actions (recorded per tick) ─────────────────────────────
export const ACTIONS = Object.freeze({
  WAIT:       'WAIT',
  MOVE_UP:    'MOVE_UP',
  MOVE_DOWN:  'MOVE_DOWN',
  MOVE_LEFT:  'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  INTERACT:   'INTERACT',
});

/** Grid offset vectors keyed by movement action */
export const DIRECTION_VECTORS = Object.freeze({
  [ACTIONS.MOVE_UP]:    { x:  0, y: -1 },
  [ACTIONS.MOVE_DOWN]:  { x:  0, y:  1 },
  [ACTIONS.MOVE_LEFT]:  { x: -1, y:  0 },
  [ACTIONS.MOVE_RIGHT]: { x:  1, y:  0 },
});

// ── Color Palette ───────────────────────────────────────────
export const COLORS = Object.freeze({
  // Environment
  BG_DARK:        0x080c18,
  WALL:           0x1c2244,
  WALL_EDGE:      0x2a3366,
  WALL_TOP:       0x232850,
  FLOOR:          0x0e1228,
  FLOOR_GRID:     0x161c36,

  // Player & Clones
  PLAYER:         0x00e5ff,
  PLAYER_DARK:    0x0088aa,
  PLAYER_TRAIL:   0x00e5ff,
  CLONE_TINTS:    [0xe040fb, 0x00e676, 0xffab40, 0xff5252, 0x7c4dff],

  // Entities
  CRATE:          0xf57c00,
  CRATE_EDGE:     0xbf5f00,
  LASER:          0xff1744,
  LASER_GLOW:     0xff5577,
  SWITCH_ON:      0x00e676,
  SWITCH_OFF:     0x5d4037,
  ENERGY_CORE:    0xffd740,
  ENERGY_GLOW:    0xffab00,
  PORTAL_ACTIVE:  0x00e5ff,
  PORTAL_INACTIVE:0x37474f,
  PLATE_ACTIVE:   0x00e676,
  PLATE_INACTIVE: 0x1b5e20,
  DOOR_CLOSED:    0xef6c00,
  DOOR_OPEN:      0x2e7d32,
  PLATFORM:       0x5c6bc0,
  PLATFORM_EDGE:  0x3949ab,

  // UI
  UI_PRIMARY:     0x00e5ff,
  UI_ACCENT:      0xe040fb,
  UI_BG:          0x0d1117,
  UI_PANEL:       0x161b22,
  UI_PANEL_LIGHT: 0x1c2333,
  UI_BORDER:      0x30363d,
  UI_TEXT:        0xf0f6fc,
  UI_TEXT_DIM:    0x8b949e,
  UI_RECORDING:   0xff1744,
  UI_SUCCESS:     0x00e676,
  UI_WARNING:     0xffab40,
  UI_DANGER:      0xff5252,

  // Stars
  STAR_FILLED:    0xffd740,
  STAR_EMPTY:     0x37474f,
});

// ── Depth Layers (z-order) ──────────────────────────────────
export const DEPTH = Object.freeze({
  BG:             -1,
  FLOOR:           0,
  FLOOR_DETAIL:    1,
  PRESSURE_PLATE:  2,
  PLATFORM:        3,
  CRATE:           5,
  SWITCH:          6,
  ENERGY_CORE:     7,
  PORTAL:          8,
  CLONE:           9,
  PLAYER:         10,
  LASER_BEAM:     11,
  DOOR:           12,
  WALL:           13,
  PARTICLE:       15,
  HUD_BG:         20,
  HUD:            25,
  OVERLAY:        30,
  MODAL:          35,
  TOAST:          40,
});

// ── Entity Type Keys ────────────────────────────────────────
export const ENTITY_TYPES = Object.freeze({
  PRESSURE_PLATE:  'pressure_plate',
  DOOR:            'door',
  MOVING_PLATFORM: 'moving_platform',
  CRATE:           'crate',
  LASER:           'laser',
  SWITCH:          'switch',
  ENERGY_CORE:     'energy_core',
  EXIT_PORTAL:     'exit_portal',
});

// ── Tile Legend (used in grid strings) ───────────────────────
export const TILE_TYPES = Object.freeze({
  EMPTY:  ' ',
  WALL:   'W',
  FLOOR:  '.',
  PLAYER: 'P',
  EXIT:   'X',
});

// ── Persistence ─────────────────────────────────────────────
export const SAVE_KEY = 'chrono_architect_v1';
export const MAX_CLONES = 5;

// ── Signal Wiring Colors ────────────────────────────────────
export const SIGNAL_COLORS = Object.freeze([
  0x66bb6a, // green
  0x42a5f5, // blue
  0xef5350, // red
  0xffee58, // yellow
  0xab47bc, // purple
  0xff7043, // orange
]);

// ── Font Families ───────────────────────────────────────────
export const FONTS = Object.freeze({
  TITLE: 'Orbitron',
  UI:    'Orbitron',
  BODY:  'Inter',
});

// ── Scene Keys ──────────────────────────────────────────────
export const SCENES = Object.freeze({
  BOOT:         'BootScene',
  PRELOAD:      'PreloadScene',
  MAIN_MENU:    'MainMenuScene',
  LEVEL_SELECT: 'LevelSelectScene',
  GAME:         'GameScene',
  UI:           'UIScene',
});
