/**
 * The brain of the app: holds all the numbers and saves them so they're still
 * there next time you open the page. A tiny observable store — views call
 * `subscribe()` and re-draw whenever anything changes.
 */

import { PICKUP_SIZE_CANS, type PickupSize } from './config';

export interface Opportunity {
  readonly id: string;
  readonly name: string;
  readonly where: string;
  readonly size: PickupSize;
  readonly cans: number;
  readonly contact: string;
  readonly message: string;
  /** ISO date string of when it was requested. */
  readonly createdAt: string;
  /** Has someone gone and picked these cans up yet? */
  pickedUp: boolean;
}

export interface AppState {
  /** Total cans crushed all-time. */
  cans: number;
  /** Total game points all-time. */
  points: number;
  /** Badge ids that have been unlocked. */
  badges: string[];
  /** Pickup requests / "jobs". */
  opportunities: Opportunity[];
  /** Are sounds on? */
  soundOn: boolean;
}

const STORAGE_KEY = 'crushing-it-state-v1';

function freshState(): AppState {
  return {
    cans: 0,
    points: 0,
    badges: [],
    opportunities: [],
    soundOn: true,
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Merge over a fresh state so missing/old fields get safe defaults.
    return {
      ...freshState(),
      ...parsed,
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
    };
  } catch {
    return freshState();
  }
}

let state: AppState = load();

type Listener = (state: AppState) => void;
const listeners = new Set<Listener>();

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be full or blocked (private mode); the app still runs
    // for this session, we just can't save. Nothing to do.
  }
}

function emit(): void {
  persist();
  for (const listener of listeners) listener(state);
}

/** Get a read-only-ish snapshot of the current state. */
export function getState(): AppState {
  return state;
}

/** Subscribe to changes. Returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Generate a simple unique id without external deps. */
function makeId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/** Add crushed cans (and the matching points). Returns the new can total. */
export function addCans(count: number, pointsPerCan: number): number {
  if (count <= 0) return state.cans;
  state = {
    ...state,
    cans: state.cans + count,
    points: state.points + count * pointsPerCan,
  };
  emit();
  return state.cans;
}

/** Take back cans logged by mistake (never goes below 0). Returns the new can total. */
export function removeCans(count: number, pointsPerCan: number): number {
  const removed = Math.min(count, state.cans);
  if (removed <= 0) return state.cans;
  state = {
    ...state,
    cans: state.cans - removed,
    points: Math.max(0, state.points - removed * pointsPerCan),
  };
  emit();
  return state.cans;
}

/**
 * Start the can count over at 0. Pickup jobs and settings are kept; badges are
 * trimmed to the ones `stillEarned` says the reset state has actually earned.
 */
export function resetCans(stillEarned: (state: AppState) => readonly string[]): void {
  const reset: AppState = { ...state, cans: 0, points: 0 };
  const earned = stillEarned(reset);
  state = { ...reset, badges: reset.badges.filter((id) => earned.includes(id)) };
  emit();
}

/** Record a brand-new pickup request. Returns the created opportunity. */
export function addOpportunity(input: {
  name: string;
  where: string;
  size: PickupSize;
  contact: string;
  message: string;
}): Opportunity {
  const opportunity: Opportunity = {
    id: makeId(),
    name: input.name,
    where: input.where,
    size: input.size,
    cans: PICKUP_SIZE_CANS[input.size],
    contact: input.contact,
    message: input.message,
    createdAt: new Date().toISOString(),
    pickedUp: false,
  };
  state = { ...state, opportunities: [opportunity, ...state.opportunities] };
  emit();
  return opportunity;
}

/**
 * Mark an opportunity as picked up. If `creditCans` is true, the estimated cans
 * get added to the crushed totals (teaching lead → work → reward).
 * Returns how many cans were credited (0 if none).
 */
export function markPickedUp(id: string, creditCans: boolean, pointsPerCan: number): number {
  const opp = state.opportunities.find((o) => o.id === id);
  if (!opp || opp.pickedUp) return 0;
  opp.pickedUp = true;
  state = { ...state, opportunities: [...state.opportunities] };
  emit();
  if (creditCans && opp.cans > 0) {
    return addCans(opp.cans, pointsPerCan);
  }
  return 0;
}

/** Add a badge if it isn't already unlocked. Returns true if newly unlocked. */
export function unlockBadge(id: string): boolean {
  if (state.badges.includes(id)) return false;
  state = { ...state, badges: [...state.badges, id] };
  emit();
  return true;
}

/** Turn sounds on/off. */
export function setSound(on: boolean): void {
  state = { ...state, soundOn: on };
  emit();
}
