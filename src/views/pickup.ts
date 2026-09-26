/**
 * The "I have cans to pick up!" form. Visitors tell the boys where to come
 * grab cans. Submits to Formspree (if configured) AND saves a local
 * Opportunity so it shows on the board even with no internet / no endpoint.
 */

import {
  COMPANY_NAME,
  FORMSPREE_ENDPOINT,
  PICKUP_SIZE_CANS,
  type PickupSize,
} from '../config';
import { burst } from '../confetti';
import { clear, el } from '../dom';
import { playCheer } from '../sound';
import { addOpportunity } from '../state';

const SIZE_OPTIONS: { value: PickupSize; label: string }[] = [
  { value: 'small', label: `🛍️ A little (about ${PICKUP_SIZE_CANS.small})` },
  { value: 'medium', label: `📦 A box (about ${PICKUP_SIZE_CANS.medium})` },
  { value: 'lots', label: `🚛 LOTS! (about ${PICKUP_SIZE_CANS.lots}+)` },
];

async function sendToFormspree(payload: Record<string, string>): Promise<boolean> {
  if (!FORMSPREE_ENDPOINT) return false;
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function mountPickup(root: HTMLElement): () => void {
  clear(root);

  const form = el('form', { class: 'pickup-form', novalidate: true }) as HTMLFormElement;

  const nameInput = el('input', {
    class: 'field-input',
    type: 'text',
    name: 'name',
    required: true,
    placeholder: 'Your name',
    autocomplete: 'name',
  }) as HTMLInputElement;

  const whereInput = el('input', {
    class: 'field-input',
    type: 'text',
    name: 'where',
    required: true,
    placeholder: 'Street or neighborhood',
    autocomplete: 'street-address',
  }) as HTMLInputElement;

  const sizeSelect = el(
    'select',
    { class: 'field-input', name: 'size' },
    SIZE_OPTIONS.map((o) => el('option', { value: o.value }, [o.label])),
  ) as HTMLSelectElement;

  const contactInput = el('input', {
    class: 'field-input',
    type: 'text',
    name: 'contact',
    placeholder: 'Phone or email (so we can say when!)',
  }) as HTMLInputElement;

  const messageInput = el('textarea', {
    class: 'field-input',
    name: 'message',
    rows: 2,
    placeholder: 'Anything else? (optional)',
  }) as HTMLTextAreaElement;

  const status = el('p', { class: 'form-status', role: 'status' });
  const submitBtn = el('button', { class: 'submit-btn', type: 'submit' }, ['📦 Send my cans!']);

  function field(labelText: string, control: HTMLElement): HTMLElement {
    return el('label', { class: 'field' }, [
      el('span', { class: 'field-label' }, [labelText]),
      control,
    ]);
  }

  form.append(
    field('What is your name?', nameInput),
    field('Where are the cans?', whereInput),
    field('How many cans?', sizeSelect),
    field('How can we reach you?', contactInput),
    field('Message', messageInput),
    submitBtn,
    status,
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const where = whereInput.value.trim();
    if (!name || !where) {
      status.textContent = '🙋 Please tell us your name and where the cans are!';
      status.className = 'form-status form-status--error';
      return;
    }

    const size = sizeSelect.value as PickupSize;
    const contact = contactInput.value.trim();
    const message = messageInput.value.trim();

    submitBtn.setAttribute('disabled', '');
    status.textContent = 'Sending… ⏳';
    status.className = 'form-status';

    // Always save locally so the boys see the job right away.
    addOpportunity({ name, where, size, contact, message });

    void sendToFormspree({
      _subject: `New can pickup for ${COMPANY_NAME}!`,
      name,
      where,
      size,
      cans: String(PICKUP_SIZE_CANS[size]),
      contact,
      message,
    }).then((delivered) => {
      submitBtn.removeAttribute('disabled');
      form.reset();
      status.textContent = delivered
        ? '🎉 Thank you! Franco & Clark got your message and will come crush those cans!'
        : '🎉 Thank you! Your cans are on the boys’ pickup list!';
      status.className = 'form-status form-status--ok';
      playCheer();
      burst(window.innerWidth / 2, window.innerHeight / 3, 120);
    });
  });

  const screen = el('section', { class: 'screen pickup-screen' }, [
    el('h2', { class: 'screen-title' }, ['Got cans? We’ll pick them up! 🚛']),
    el('p', { class: 'screen-intro' }, [
      'Tell Franco & Clark where your cans are and they’ll come crush them. ♻️',
    ]),
    form,
  ]);

  root.append(screen);
  return () => {};
}
