import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: { include: ['tests/**/*.test.ts'], env: { COMPLY_DB: ':memory:', LLM_FIXTURE: '1', RADAR_SOURCES: 'fixture' } },
});
