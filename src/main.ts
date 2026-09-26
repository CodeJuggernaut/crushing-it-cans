/**
 * App bootstrap: builds the header, the tab bar, and swaps between views.
 * Also watches state to auto-unlock badges and throw a little party.
 */

import './styles/main.css';
import { COMPANY_NAME, OWNERS } from './config';
import { burst } from './confetti';
import { clear, el } from './dom';
import { BADGES, earnedBadgeIds } from './game';
import { playCheer } from './sound';
import { getState, setSound, subscribe, unlockBadge } from './state';
import { mountCrush } from './views/crush';
import { mountDashboard } from './views/dashboard';
import { mountOpportunities } from './views/opportunities';
import { mountPickup } from './views/pickup';

type ViewMount = (root: HTMLElement) => () => void;

interface Tab {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly mount: ViewMount;
}

const TABS: readonly Tab[] = [
  { id: 'crush', label: 'Crush!', emoji: '💥', mount: mountCrush },
  { id: 'dashboard', label: 'Business', emoji: '📈', mount: mountDashboard },
  { id: 'pickup', label: 'Got Cans?', emoji: '🚛', mount: mountPickup },
  { id: 'opportunities', label: 'Jobs', emoji: '📋', mount: mountOpportunities },
];

function boot(): void {
  const app = document.getElementById('app');
  if (!app) return;
  clear(app);

  // --- Header ---
  const soundBtn = el('button', {
    class: 'sound-btn',
    type: 'button',
    'aria-label': 'Turn sounds on or off',
    title: 'Sound on/off',
  });
  soundBtn.addEventListener('click', () => setSound(!getState().soundOn));

  const header = el('header', { class: 'app-header' }, [
    el('div', { class: 'brand' }, [
      el('span', { class: 'brand-emoji', 'aria-hidden': 'true' }, ['🥫💥']),
      el('div', { class: 'brand-text' }, [
        el('h1', { class: 'brand-name' }, [COMPANY_NAME]),
        el('p', { class: 'brand-owners' }, [`Owned by ${OWNERS} 🧒`]),
      ]),
    ]),
    soundBtn,
  ]);

  // --- View area + nav ---
  const view = el('main', { class: 'view', id: 'view' });
  const nav = el('nav', { class: 'tab-bar', 'aria-label': 'Sections' });
  const tabButtons = new Map<string, HTMLButtonElement>();

  let cleanup: () => void = () => {};

  function activate(tab: Tab): void {
    cleanup();
    for (const [id, btn] of tabButtons) {
      btn.setAttribute('aria-current', id === tab.id ? 'page' : 'false');
      btn.classList.toggle('tab--active', id === tab.id);
    }
    cleanup = tab.mount(view);
    view.scrollTo?.({ top: 0 });
  }

  for (const tab of TABS) {
    const btn = el('button', { class: 'tab', type: 'button' }, [
      el('span', { class: 'tab-emoji', 'aria-hidden': 'true' }, [tab.emoji]),
      el('span', { class: 'tab-label' }, [tab.label]),
    ]) as HTMLButtonElement;
    btn.addEventListener('click', () => activate(tab));
    tabButtons.set(tab.id, btn);
    nav.append(btn);
  }

  const footer = el('footer', { class: 'app-footer' }, [
    el('span', {}, ['♻️ Crushing cans, saving up, learning business!']),
  ]);

  app.append(header, view, nav, footer);

  // Reflect sound state on the button.
  function syncSound(): void {
    const on = getState().soundOn;
    soundBtn.textContent = on ? '🔊' : '🔇';
  }
  syncSound();
  subscribe(syncSound);

  // Auto-unlock badges whenever state changes; celebrate new ones.
  const wasKnown = new Set<string>(getState().badges);
  subscribe(() => {
    const state = getState();
    const earned = earnedBadgeIds(state);
    let unlockedAny = false;
    for (const id of earned) {
      if (unlockBadge(id)) unlockedAny = true;
    }
    if (unlockedAny) {
      // Find the newest badge name for a friendly toast.
      const newest = BADGES.find((b) => earned.includes(b.id) && !wasKnown.has(b.id));
      for (const id of earned) wasKnown.add(id);
      playCheer();
      burst(window.innerWidth / 2, window.innerHeight / 4, 140);
      if (newest) showToast(`${newest.emoji} New badge: ${newest.name}!`);
    }
  });

  activate(TABS[0]!);
}

let toastTimer = 0;
function showToast(text: string): void {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = el('div', { class: 'toast', id: 'toast', role: 'status' });
    document.body.append(toast);
  }
  toast.textContent = text;
  toast.classList.add('toast--show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast?.classList.remove('toast--show'), 2600);
}

boot();
