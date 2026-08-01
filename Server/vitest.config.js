// vitest.config.js
//
// WHY VITEST OVER JEST:
// This project uses native ESM ("type": "module" in package.json). Jest's
// ESM support still requires extra flags/transforms and has known rough
// edges; Vitest is ESM-native by design (built on Vite's transform
// pipeline) and needs zero configuration to just work here. Its API
// (describe/it/expect/vi.mock) is intentionally Jest-compatible, so the
// testing knowledge transfers either direction — this isn't a stylistic
// preference, it's the tool that fits an ESM project without fighting it.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/server.js'], // just a bootstrap, nothing to unit test
    },
  },
});
