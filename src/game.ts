/**
 * Game rules: turning the raw numbers into money, ranks, and badges.
 * Pure functions only — easy to reason about and to test later.
 */

import {
  CENT_PER_CAN,
  RANKS,
  SAVINGS_GOAL_DOLLARS,
  type Rank,
} from './config';
import type { AppState } from './state';

/** Money earned so far, in dollars. */
export function moneyDollars(cans: number): number {
  return (cans * CENT_PER_CAN) / 100;
}

/** Format dollars like "$12.35". */
export function formatMoney(dollars: number): string {
  return `$${dollars.toFixed(2)}`;
}

/** How far toward the savings goal, 0–1. */
export function goalProgress(cans: number): number {
  if (SAVINGS_GOAL_DOLLARS <= 0) return 1;
  return Math.min(1, moneyDollars(cans) / SAVINGS_GOAL_DOLLARS);
}

/** The highest rank reached for a given point total. */
export function currentRank(points: number): Rank {
  let rank: Rank = RANKS[0]!;
  for (const r of RANKS) {
    if (points >= r.minPoints) rank = r;
  }
  return rank;
}

/** The next rank up, or null if you're already at the top. */
export function nextRank(points: number): Rank | null {
  for (const r of RANKS) {
    if (points < r.minPoints) return r;
  }
  return null;
}

/** Progress toward the next rank, 0–1 (1 if maxed out). */
export function rankProgress(points: number): number {
  const next = nextRank(points);
  if (!next) return 1;
  const current = currentRank(points);
  const span = next.minPoints - current.minPoints;
  if (span <= 0) return 1;
  return Math.min(1, (points - current.minPoints) / span);
}

export interface BadgeDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly hint: string;
  /** Returns true when this badge should be unlocked for the given state. */
  readonly earned: (state: AppState) => boolean;
}

/** All the badges, in display order. */
export const BADGES: readonly BadgeDef[] = [
  {
    id: 'first-can',
    name: 'First Can!',
    emoji: '🥫',
    hint: 'Crush your very first can',
    earned: (s) => s.cans >= 1,
  },
  {
    id: 'ten-cans',
    name: 'Ten Crushers',
    emoji: '🔟',
    hint: 'Crush 10 cans',
    earned: (s) => s.cans >= 10,
  },
  {
    id: 'hundred-cans',
    name: 'Century Crush',
    emoji: '💯',
    hint: 'Crush 100 cans',
    earned: (s) => s.cans >= 100,
  },
  {
    id: 'thousand-cans',
    name: 'Mega Crusher',
    emoji: '🚀',
    hint: 'Crush 1,000 cans',
    earned: (s) => s.cans >= 1000,
  },
  {
    id: 'first-pickup',
    name: 'First Job',
    emoji: '📦',
    hint: 'Get your first pickup request',
    earned: (s) => s.opportunities.length >= 1,
  },
  {
    id: 'job-done',
    name: 'Job Done',
    emoji: '✅',
    hint: 'Finish a pickup',
    earned: (s) => s.opportunities.some((o) => o.pickedUp),
  },
  {
    id: 'goal-crusher',
    name: 'Goal Crusher',
    emoji: '🏆',
    hint: `Save ${formatMoney(SAVINGS_GOAL_DOLLARS)}`,
    earned: (s) => moneyDollars(s.cans) >= SAVINGS_GOAL_DOLLARS,
  },
];

/** Which badge ids are currently earned by the state. */
export function earnedBadgeIds(state: AppState): string[] {
  return BADGES.filter((b) => b.earned(state)).map((b) => b.id);
}
