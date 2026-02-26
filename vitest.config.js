import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Vite's static import analysis rejects unresolvable paths
// This plugin satisfies the resolver in CI.
function localDevConfigStub() {
  return {
    name: 'local-dev-config-stub',
    resolveId(source) {
      if (source.includes('src/local-dev/')) {
        const absolute = resolve(process.cwd(), source);
        if (!existsSync(absolute)) {
          return { id: '\0local-dev-stub', external: false };
        }
      }
    },
    load(id) {
      if (id === '\0local-dev-stub') {
        return 'export default {}; export const firebaseConfig = undefined;';
      }
    },
  };
}

export default defineConfig({
  plugins: [localDevConfigStub()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/testSetup.js'],
  },
});
