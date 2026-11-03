import { BASE, withServer } from './server.mjs';

const json = { 'content-type': 'application/json' };

async function check(path, init, want = 200) {
  const res = await fetch(BASE + path, init);
  if (res.status !== want) throw new Error(`${init?.method ?? 'GET'} ${path} returned ${res.status}`);
  console.log(`ok ${res.status} ${init?.method ?? 'GET'} ${path}`);
  return res;
}

await withServer(async () => {
  for (const p of ['/', '/profile', '/about', '/rejected', '/ask']) await check(p);
  const html = await (await check('/?tab=action')).text();
  if (!html.includes('need')) throw new Error('Overview has no items');
  const item = encodeURIComponent('page:n1');
  await check('/api/ask', { method: 'POST', headers: json, body: JSON.stringify({ messages: [{ role: 'user', content: 'What do I need to do today?' }] }) });
  await check('/api/profile', { method: 'PUT', headers: json, body: JSON.stringify({ businessName: 'Smoke', businessType: 'food_truck', permits: [], carry: [], notes: [], countiesOperated: [] }) });
  await check(`/api/partner/${item}`);
  const op = (body) => ({ method: 'POST', headers: json, body: JSON.stringify(body) });
  await check(`/api/partner/${item}`, op({ op: 'start' }));
  await check(`/api/partner/${item}`, op({ op: 'advance' }));
  await check(`/api/partner/${item}`, op({ op: 'advance' }));
  await check(`/api/partner/${item}`, op({ op: 'approve' }));
  await check(`/api/items/${item}/actions/dismiss`, { method: 'POST' });
  await check(`/api/items/${item}/actions/surface`, { method: 'POST' });
  await check(`/api/items/${item}/actions/resolve`, { method: 'POST' });
  console.log('Smoke passed.');
}).catch((e) => { console.error(e.message); process.exit(1); });
