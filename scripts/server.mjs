// Builds and starts production Next on a scratch database, so checks never touch the demo data.
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

export const BASE = 'http://localhost:3100';

export async function withServer(fn) {
  execSync('npx next build', { stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', NEXT_DIST_DIR: '.next-check' } });
  const db = 'data/check.db';
  for (const f of [db, `${db}-wal`, `${db}-shm`]) fs.rmSync(f, { force: true });
  const server = spawn('npx', ['next', 'start', '-p', '3100'], { env: { ...process.env, NEXT_DIST_DIR: '.next-check', COMPLY_DB: db, LLM_MODE: 'fixture', PARTNER_MODE: 'simulated' }, stdio: 'ignore', detached: true });
  try {
    for (let i = 0; ; i++) {
      if (await fetch(BASE).then((r) => r.ok, () => false)) break;
      if (i > 60) throw new Error('Server did not start');
      await new Promise((r) => setTimeout(r, 500));
    }
    await fn();
  } finally {
    process.kill(-server.pid);
  }
}
