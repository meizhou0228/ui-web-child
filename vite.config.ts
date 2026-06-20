import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

/** Stamp dist/sw.js with a unique cache version so each deploy ships a new SW. */
function swBuildId() {
  return {
    name: 'sw-build-id',
    apply: 'build' as const,
    writeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js');
      const id = `ui-web-child-${Date.now()}`;
      const src = readFileSync(swPath, 'utf8').replace(/__BUILD_ID__/g, id);
      writeFileSync(swPath, src);
    },
  };
}

export default defineConfig({
  plugins: [react(), swBuildId()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
});
