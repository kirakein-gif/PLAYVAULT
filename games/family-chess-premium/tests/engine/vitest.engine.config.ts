import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/engine/**/*.check.ts'], environment: 'node', testTimeout: 900000 } });
