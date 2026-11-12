/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from https://<user>.github.io/SolTalks/, so every asset
// URL must start with /SolTalks/. Change this if the repository is renamed.
const REPO_NAME = 'SolTalks';

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [react()],
  test: {
    // Our tests cover pure logic only, so no browser emulation is needed.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
