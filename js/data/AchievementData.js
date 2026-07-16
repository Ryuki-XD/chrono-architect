/**
 * AchievementData.js — Definitions for all unlockable achievements.
 * Each entry has an id (persistence key), display info, and an optional
 * `check` function that evaluates against the save-data snapshot.
 */

export const ACHIEVEMENTS = Object.freeze([
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete Level 1',
    icon: '👟',
  },
  {
    id: 'time_traveler',
    name: 'Time Traveler',
    description: 'Create your first clone',
    icon: '⏳',
  },
  {
    id: 'clone_army',
    name: 'Clone Army',
    description: 'Have 5 clones active at once',
    icon: '👥',
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Beat any level under par time',
    icon: '⚡',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Beat a level with minimum clones',
    icon: '🎯',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Collect every energy core in a level',
    icon: '💎',
  },
  {
    id: 'no_hints',
    name: 'Self Reliant',
    description: 'Complete 5 levels without using hints',
    icon: '🧠',
  },
  {
    id: 'perfect_run',
    name: 'Perfect Run',
    description: 'Complete a level with zero restarts',
    icon: '✨',
  },
  {
    id: 'halfway',
    name: 'Halfway There',
    description: 'Complete 10 levels',
    icon: '🏔️',
  },
  {
    id: 'architect',
    name: 'The Architect',
    description: 'Complete all 20 levels',
    icon: '🏛️',
  },
  {
    id: 'three_stars',
    name: 'Perfectionist',
    description: 'Earn 3 stars on any level',
    icon: '⭐',
  },
  {
    id: 'all_stars',
    name: 'Stellar',
    description: 'Earn 3 stars on every level',
    icon: '🌟',
  },
  {
    id: 'temporal_paradox',
    name: 'Temporal Paradox',
    description: 'Create 10 total clones across all plays',
    icon: '🌀',
  },
  {
    id: 'efficient',
    name: 'Efficient',
    description: 'Beat any level in under 50 moves',
    icon: '📐',
  },
  {
    id: 'speedster',
    name: 'Speedster',
    description: 'Beat any level in under 20 seconds',
    icon: '🚀',
  },
]);
