/**
 * MathUtils.js — Pure-function helpers for grid maths, easing, and formatting.
 */

import { TILE_SIZE } from '../config/GameConfig.js';

// ── Grid ↔ Pixel Conversion ────────────────────────────────

/** Convert grid coordinates to pixel center, accounting for level offset */
export function gridToPixel(gridX, gridY, offsetX = 0, offsetY = 0) {
  return {
    x: offsetX + gridX * TILE_SIZE + TILE_SIZE / 2,
    y: offsetY + gridY * TILE_SIZE + TILE_SIZE / 2,
  };
}

/** Convert pixel position back to grid coordinates */
export function pixelToGrid(px, py, offsetX = 0, offsetY = 0) {
  return {
    x: Math.floor((px - offsetX) / TILE_SIZE),
    y: Math.floor((py - offsetY) / TILE_SIZE),
  };
}

// ── Basic Math ──────────────────────────────────────────────

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function manhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// ── Easing ──────────────────────────────────────────────────

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function easeInQuart(t) {
  return t * t * t * t;
}

// ── Random ──────────────────────────────────────────────────

export function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Color ───────────────────────────────────────────────────

/** 0xRRGGBB → '#RRGGBB' */
export function colorToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

/** 0xRRGGBB → { r, g, b } (0-255) */
export function hexToRgb(hex) {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  };
}

/** Blend two 0xRRGGBB colors, t ∈ [0,1] */
export function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return (r << 16) | (g << 8) | bl;
}

// ── Formatting ──────────────────────────────────────────────

/** Milliseconds → 'MM:SS' */
export function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** Milliseconds → 'M:SS.m' (with tenths) */
export function formatTimePrecise(ms) {
  const total = Math.floor(ms / 100);
  const tenths = total % 10;
  const secs = Math.floor(total / 10) % 60;
  const mins = Math.floor(total / 600);
  return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
}
