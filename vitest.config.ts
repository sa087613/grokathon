import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: { include: ['tests/**/*.test.ts'], env: { PEACHTREE_DB: ':memory:', LLM_FIXTURE: '1', RADAR_SOURCES: 'fixture' } },
});
