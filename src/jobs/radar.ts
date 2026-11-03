import { runRadar } from '@/agent/radar';

runRadar().then((r) => {
  console.log(`Read ${r.read} items, surfaced ${r.surfaced} new.`);
  r.failures.forEach((f) => console.warn(`Unavailable: ${f}`));
});
