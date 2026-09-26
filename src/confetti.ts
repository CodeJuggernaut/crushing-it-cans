/**
 * Tiny hand-rolled canvas confetti — no library. Call `burst()` for a party.
 * Respects `prefers-reduced-motion` (does nothing if the user opted out).
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  life: number;
}

const COLORS = ['#ff5a3c', '#ffd23f', '#3ddc97', '#4d96ff', '#ff6fb5', '#a66cff'];

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let running = false;

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function ensureCanvas(): boolean {
  if (!canvas) {
    canvas = document.getElementById('confetti') as HTMLCanvasElement | null;
    if (!canvas) return false;
    context = canvas.getContext('2d');
  }
  if (!context || !canvas) return false;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return true;
}

function frame(): void {
  if (!context || !canvas) return;
  context.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter((p) => p.life > 0 && p.y < canvas!.height + 40);
  for (const p of particles) {
    p.vy += 0.25; // gravity
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life -= 1;

    context.save();
    context.translate(p.x, p.y);
    context.rotate(p.rotation);
    context.fillStyle = p.color;
    context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    context.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(frame);
  } else {
    running = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Throw a burst of confetti. `originX`/`originY` are screen coordinates of the
 * launch point (defaults to center-top).
 */
export function burst(originX?: number, originY?: number, count = 90): void {
  if (reducedMotion()) return;
  if (!ensureCanvas() || !canvas) return;

  const ox = originX ?? canvas.width / 2;
  const oy = originY ?? canvas.height / 3;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random();
    const speed = 4 + Math.random() * 7;
    particles.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 7 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.4,
      life: 80 + Math.floor(Math.random() * 40),
    });
  }

  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}
