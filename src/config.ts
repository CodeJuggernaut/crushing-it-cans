/**
 * Crushing It Can Recycling — settings the grown-ups can change.
 *
 * This is the ONE file to edit to set things up. Everything else reads from here.
 */

/** The company name shown everywhere. */
export const COMPANY_NAME = 'Crushing It Can Recycling';

/** The bosses (the boys who own the company!). */
export const OWNERS = 'Franco & Clark';

/** How much money each can is worth, in cents. (5¢ = California CRV style.) */
export const CENT_PER_CAN = 5;

/** The big savings goal, in dollars, for their Roth account. */
export const SAVINGS_GOAL_DOLLARS = 100;

/**
 * Where the "I have cans!" form sends pickup requests.
 *
 * TO TURN ON REAL EMAILS:
 *   1. Make a free account at https://formspree.io
 *   2. Create a form, copy its endpoint (looks like https://formspree.io/f/abcdwxyz)
 *   3. Paste it below between the quotes.
 *
 * Until this is filled in, the form still works — requests are saved on the
 * device and show up on the Opportunities board, so nothing ever breaks.
 */
export const FORMSPREE_ENDPOINT = '';

/** Family contact shown to visitors (optional — leave '' to hide). */
export const CONTACT_EMAIL = '';

/** Points earned per can crushed (on top of the money). */
export const POINTS_PER_CAN = 10;

/**
 * Rank ladder, ordered low → high. A rank unlocks when total points reach
 * `minPoints`. The first rank should always be 0.
 */
export interface Rank {
  readonly name: string;
  readonly emoji: string;
  readonly minPoints: number;
}

export const RANKS: readonly Rank[] = [
  { name: 'Can Cadet', emoji: '🐣', minPoints: 0 },
  { name: 'Crush Captain', emoji: '💪', minPoints: 200 },
  { name: 'Recycle Ranger', emoji: '🦸', minPoints: 1000 },
  { name: 'Eco Hero', emoji: '🌍', minPoints: 3000 },
  { name: 'Crushing It CEO', emoji: '👑', minPoints: 10000 },
];

/** Rough can counts used when a visitor picks a pickup size. */
export const PICKUP_SIZE_CANS = {
  small: 10,
  medium: 30,
  lots: 75,
} as const;

export type PickupSize = keyof typeof PICKUP_SIZE_CANS;
