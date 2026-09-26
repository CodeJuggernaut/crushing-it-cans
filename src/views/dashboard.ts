/**
 * The Dashboard — where the boys see their money, their rank, and their badges.
 * This is the "learn business" screen: real dollars toward the Roth goal.
 */

import { SAVINGS_GOAL_DOLLARS } from '../config';
import { clear, el } from '../dom';
import {
  BADGES,
  currentRank,
  earnedBadgeIds,
  formatMoney,
  goalProgress,
  moneyDollars,
  nextRank,
  rankProgress,
} from '../game';
import { getState, subscribe } from '../state';

function progressBar(fillClass: string): { wrap: HTMLElement; fill: HTMLElement } {
  const fill = el('div', { class: `bar-fill ${fillClass}` });
  const wrap = el('div', { class: 'bar', role: 'progressbar' }, [fill]);
  return { wrap, fill };
}

export function mountDashboard(root: HTMLElement): () => void {
  clear(root);

  // --- Money / goal card ---
  const moneyBig = el('div', { class: 'money-big' });
  const goalText = el('p', { class: 'goal-text' });
  const goal = progressBar('bar-fill--money');

  // --- Rank card ---
  const rankBig = el('div', { class: 'rank-big' });
  const rankText = el('p', { class: 'rank-text' });
  const rankBar = progressBar('bar-fill--rank');

  // --- Badges grid ---
  const badgeGrid = el('div', { class: 'badge-grid' });

  const screen = el('section', { class: 'screen dashboard-screen' }, [
    el('h2', { class: 'screen-title' }, ['Your Business 📈']),

    el('div', { class: 'card card--money' }, [
      el('div', { class: 'card-label' }, ['💰 Money saved for your Roth account']),
      moneyBig,
      goal.wrap,
      goalText,
    ]),

    el('div', { class: 'card card--rank' }, [
      el('div', { class: 'card-label' }, ['⭐ Your rank']),
      rankBig,
      rankBar.wrap,
      rankText,
    ]),

    el('div', { class: 'card card--badges' }, [
      el('div', { class: 'card-label' }, ['🏅 Badges']),
      badgeGrid,
    ]),
  ]);

  root.append(screen);

  function update(): void {
    const state = getState();
    const dollars = moneyDollars(state.cans);

    // Money
    moneyBig.textContent = formatMoney(dollars);
    const gp = goalProgress(state.cans);
    goal.fill.style.width = `${Math.round(gp * 100)}%`;
    goal.wrap.setAttribute('aria-valuenow', String(Math.round(gp * 100)));
    goalText.textContent =
      gp >= 1
        ? `🎉 GOAL CRUSHED! You saved more than ${formatMoney(SAVINGS_GOAL_DOLLARS)}!`
        : `${Math.round(gp * 100)}% of the way to ${formatMoney(SAVINGS_GOAL_DOLLARS)}. Keep crushing!`;

    // Rank
    const rank = currentRank(state.points);
    rankBig.textContent = `${rank.emoji} ${rank.name}`;
    const rp = rankProgress(state.points);
    rankBar.fill.style.width = `${Math.round(rp * 100)}%`;
    rankBar.wrap.setAttribute('aria-valuenow', String(Math.round(rp * 100)));
    const next = nextRank(state.points);
    rankText.textContent = next
      ? `${state.points.toLocaleString()} points — ${(next.minPoints - state.points).toLocaleString()} more to ${next.emoji} ${next.name}!`
      : `${state.points.toLocaleString()} points — you reached the TOP rank! 👑`;

    // Badges
    const earned = new Set(earnedBadgeIds(state));
    clear(badgeGrid);
    for (const badge of BADGES) {
      const got = earned.has(badge.id);
      badgeGrid.append(
        el('div', { class: `badge ${got ? 'badge--earned' : 'badge--locked'}`, title: badge.hint }, [
          el('div', { class: 'badge-emoji' }, [got ? badge.emoji : '🔒']),
          el('div', { class: 'badge-name' }, [badge.name]),
          el('div', { class: 'badge-hint' }, [got ? 'Unlocked!' : badge.hint]),
        ]),
      );
    }
  }
  update();

  return subscribe(update);
}
