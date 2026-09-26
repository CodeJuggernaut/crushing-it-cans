/**
 * The Opportunities board — the boys' "jobs". Every pickup request shows up
 * here as a card they can mark "Picked up!" to teach lead → work → reward.
 */

import { POINTS_PER_CAN } from '../config';
import { burst } from '../confetti';
import { clear, el } from '../dom';
import { playCheer } from '../sound';
import { getState, markPickedUp, subscribe, type Opportunity } from '../state';

const SIZE_EMOJI: Record<Opportunity['size'], string> = {
  small: '🛍️',
  medium: '📦',
  lots: '🚛',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function card(opp: Opportunity): HTMLElement {
  const children: (HTMLElement | string)[] = [
    el('div', { class: 'opp-top' }, [
      el('span', { class: 'opp-size' }, [SIZE_EMOJI[opp.size]]),
      el('span', { class: 'opp-name' }, [opp.name]),
      el('span', { class: 'opp-date' }, [formatDate(opp.createdAt)]),
    ]),
    el('div', { class: 'opp-where' }, [`📍 ${opp.where}`]),
    el('div', { class: 'opp-cans' }, [`About ${opp.cans} cans`]),
  ];

  if (opp.contact) {
    children.push(el('div', { class: 'opp-contact' }, [`☎️ ${opp.contact}`]));
  }
  if (opp.message) {
    children.push(el('div', { class: 'opp-message' }, [`💬 ${opp.message}`]));
  }

  if (opp.pickedUp) {
    children.push(el('div', { class: 'opp-done' }, ['✅ Picked up!']));
  } else {
    children.push(
      el(
        'button',
        {
          class: 'opp-btn',
          type: 'button',
          onclick: () => {
            const credited = markPickedUp(opp.id, true, POINTS_PER_CAN);
            playCheer();
            burst(window.innerWidth / 2, window.innerHeight / 2, credited > 0 ? 120 : 60);
          },
        },
        ['✅ We picked these up!'],
      ),
    );
  }

  return el('div', { class: `opp-card ${opp.pickedUp ? 'opp-card--done' : ''}` }, children);
}

export function mountOpportunities(root: HTMLElement): () => void {
  clear(root);

  const list = el('div', { class: 'opp-list' });
  const summary = el('p', { class: 'opp-summary' });

  const screen = el('section', { class: 'screen opp-screen' }, [
    el('h2', { class: 'screen-title' }, ['Pickup Jobs 📋']),
    summary,
    list,
  ]);
  root.append(screen);

  function update(): void {
    const { opportunities } = getState();
    clear(list);

    if (opportunities.length === 0) {
      summary.textContent = 'No jobs yet — share your website so people can send their cans! 📣';
      list.append(
        el('div', { class: 'opp-empty' }, [
          el('div', { class: 'opp-empty-emoji' }, ['📭']),
          el('p', {}, ['When someone asks for a pickup, their job shows up here.']),
        ]),
      );
      return;
    }

    const todo = opportunities.filter((o) => !o.pickedUp).length;
    const done = opportunities.length - todo;
    summary.textContent = `🟢 ${todo} to do · ✅ ${done} done`;

    for (const opp of opportunities) list.append(card(opp));
  }
  update();

  return subscribe(update);
}
