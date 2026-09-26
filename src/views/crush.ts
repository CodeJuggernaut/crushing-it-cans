/**
 * The CRUSH! screen — a giant can you smash to log crushed cans.
 */

import { POINTS_PER_CAN } from '../config';
import { burst } from '../confetti';
import { clear, el, pulse } from '../dom';
import { earnedBadgeIds, formatMoney, moneyDollars } from '../game';
import { playCheer, playCrush } from '../sound';
import { addCans, getState, removeCans, resetCans, subscribe } from '../state';

export function mountCrush(root: HTMLElement): () => void {
  clear(root);

  const cansLabel = el('strong', { class: 'big-number' });
  const moneyLabel = el('strong', { class: 'big-number' });

  const can = el(
    'button',
    {
      class: 'crush-can',
      'aria-label': 'Crush a can',
      type: 'button',
    },
    ['🥫'],
  );

  function celebrateMilestone(total: number): void {
    // Party every 10 cans, bigger party every 100.
    if (total % 100 === 0) {
      burst(window.innerWidth / 2, window.innerHeight / 2, 160);
      playCheer();
    } else if (total % 10 === 0) {
      const rect = can.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 70);
      playCheer();
    }
  }

  function crush(count: number): void {
    const total = addCans(count, POINTS_PER_CAN);
    playCrush();
    pulse(can, 'crush-can--smash', 220);
    // Single taps celebrate on round numbers; batches always get a little party.
    if (count > 1) {
      const rect = can.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
      playCheer();
    }
    celebrateMilestone(total);
  }

  can.addEventListener('click', () => crush(1));

  const batchRow = el('div', { class: 'batch-row' }, [
    el('button', { class: 'batch-btn', type: 'button', onclick: () => crush(10) }, ['+10 cans']),
    el('button', { class: 'batch-btn', type: 'button', onclick: () => crush(25) }, ['+25 cans']),
    el('button', { class: 'batch-btn', type: 'button', onclick: () => crush(100) }, ['+100 cans']),
  ]);

  // Oops buttons: take back cans tapped by accident, or start over at 0.
  function undo(count: number): void {
    removeCans(count, POINTS_PER_CAN);
    pulse(can, 'crush-can--smash', 220);
  }

  function resetAll(): void {
    if (getState().cans === 0) return;
    if (!window.confirm('Start over at 0 cans? This clears the can count and money.')) return;
    resetCans(earnedBadgeIds);
  }

  const minusButtons = [1, 10, 100].map((n) =>
    el('button', { class: 'batch-btn batch-btn--minus', type: 'button', onclick: () => undo(n) }, [
      `−${n}`,
    ]),
  );
  const resetButton = el(
    'button',
    { class: 'batch-btn batch-btn--reset', type: 'button', onclick: resetAll },
    ['🔄 Reset to 0'],
  );

  const fixRow = el('div', { class: 'batch-row' }, [...minusButtons, resetButton]);

  const screen = el('section', { class: 'screen crush-screen' }, [
    el('h2', { class: 'screen-title' }, ['Tap the can to CRUSH it! 💥']),
    el('div', { class: 'crush-stats' }, [
      el('div', { class: 'stat-pill' }, ['🥫 ', cansLabel, ' cans']),
      el('div', { class: 'stat-pill stat-pill--money' }, ['💰 ', moneyLabel, ' saved']),
    ]),
    can,
    el('p', { class: 'crush-help' }, ['Crushed a whole bag? Use these:']),
    batchRow,
    el('p', { class: 'crush-help' }, ['Oops, too many? Take some away:']),
    fixRow,
  ]);

  root.append(screen);

  function update(): void {
    const { cans } = getState();
    cansLabel.textContent = cans.toLocaleString();
    moneyLabel.textContent = formatMoney(moneyDollars(cans));
    for (const button of [...minusButtons, resetButton]) button.disabled = cans === 0;
  }
  update();

  return subscribe(update);
}
