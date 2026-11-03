// One command to the exact demo state. The database schema is created on first open.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) { console.error(`Node 20 or later is required, found ${process.version}.`); process.exit(1); }
if (!fs.existsSync('node_modules')) execSync('npm install', { stdio: 'inherit' });
execSync('npx tsx src/jobs/seed.ts', { stdio: 'inherit' });
console.log('Ready: http://localhost:3000');
