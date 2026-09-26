# 🥫💥 Crushing It Can Recycling

A fun, gamified website for **Franco & Clark's** can-recycling business.
Crush cans, watch your money grow toward your Roth goal, earn ranks and badges,
and let neighbors send you their cans to pick up!

Built with **Vite + TypeScript** (no frameworks, no runtime dependencies).

---

## 🎮 What's inside

| Tab | What it does |
| --- | --- |
| **Crush!** 💥 | Tap the giant can to log crushed cans. Big batch buttons (+10/+25/+100) for real bags. Sounds + confetti. |
| **Business** 📈 | Money saved (5¢/can) with a progress bar to the savings goal, your rank, and badges. |
| **Got Cans?** 🚛 | The form neighbors fill out to ask for a pickup. |
| **Jobs** 📋 | The boys' pickup list — mark a job "Picked up!" and the cans get added in. |

Everything is saved on the device with `localStorage` (so progress sticks
between visits). Note: it's **per-device** — the numbers on a phone and a
laptop are separate.

---

## 🚀 Run it

```bash
cd crushing-it
npm install
npm run dev        # play locally at http://localhost:5173
```

Other commands:

```bash
npm run typecheck  # strict TypeScript check, no errors allowed
npm run build      # type-check + build the static site into dist/
npm run preview    # preview the production build
```

---

## ✉️ Turn on real pickup emails (one-time, ~5 min)

Out of the box the pickup form **always works** — requests show up on the
**Jobs** board. To also get an **email** when someone submits:

1. Make a free account at **[formspree.io](https://formspree.io)**.
2. Create a new form and copy its endpoint — it looks like
   `https://formspree.io/f/abcdwxyz`.
3. Open `src/config.ts` and paste it:
   ```ts
   export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
   ```
4. Rebuild / redeploy. Done — submissions now email the family inbox.

Other knobs in `src/config.ts`: `CENT_PER_CAN` (5¢), `SAVINGS_GOAL_DOLLARS`
($100), `POINTS_PER_CAN`, the rank ladder, and pickup-size estimates.

---

## 🌍 Publish it free (GitHub Pages)

A workflow at `.github/workflows/deploy-crushing-it.yml` builds this folder and
publishes it to GitHub Pages whenever `crushing-it/` changes on the default
branch.

1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Merge to the default branch (or run the workflow manually).
3. The site goes live at `https://<user>.github.io/<repo>/`.

The Vite `base` is set to `'./'` (relative paths), so the site works at a
project subpath without extra config.

---

## 🧱 Moving into the monorepo later

This is a self-contained project. When the planned Turborepo lands, move the
folder to `packages/crushing-it/` and wire it into the workspace — strict
TypeScript and no runtime deps mean it should drop in cleanly.

```
crushing-it/
├── index.html
├── src/
│   ├── main.ts            # app shell + tab router + badge celebrations
│   ├── config.ts          # ⭐ all the settings live here
│   ├── state.ts           # localStorage store (cans, money, points, jobs)
│   ├── game.ts            # money / rank / badge math (pure functions)
│   ├── sound.ts           # Web Audio crunch + cheer (no files)
│   ├── confetti.ts        # canvas confetti (no library)
│   ├── dom.ts             # tiny DOM helpers
│   └── views/             # crush · dashboard · pickup · opportunities
└── src/styles/main.css    # big, bright, kid-friendly, responsive
```

♻️ *Crushing cans, saving up, learning business!*
