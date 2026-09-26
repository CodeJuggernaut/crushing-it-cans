import { defineConfig } from 'vite';

// Relative base ('./') makes the built site work whether it's served from a
// domain root, a GitHub Pages project subpath (e.g. /acos-adsim/), or opened
// from a local `vite preview`. No hard-coded repo path to keep in sync.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});
