/**
 * Sounds made with the Web Audio API — no audio files needed.
 * A short noisy "crunch" for crushing and a happy little arpeggio for wins.
 */

import { getState } from './state';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  // Browsers start the context "suspended" until a user gesture; resume on use.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function enabled(): boolean {
  return getState().soundOn;
}

/** A satisfying can-crush: a quick burst of filtered noise. */
export function playCrush(): void {
  if (!enabled()) return;
  const ac = audio();
  if (!ac) return;

  const duration = 0.18;
  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // White noise that fades out fast = a crunch.
    const fade = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * fade * fade;
  }

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;

  const gain = ac.createGain();
  gain.gain.value = 0.35;

  source.connect(filter).connect(gain).connect(ac.destination);
  source.start();
}

/** A cheerful little "ding ding ding" for milestones and badges. */
export function playCheer(): void {
  if (!enabled()) return;
  const ac = audio();
  if (!ac) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  const start = ac.currentTime;
  notes.forEach((freq, i) => {
    const t = start + i * 0.09;
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  });
}
