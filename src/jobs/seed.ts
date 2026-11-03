import { seedDemo } from '@/agent/demo';

seedDemo().then((r) => console.log(`Seeded ${r.read} items, ${r.surfaced} surfaced, ${r.rejected} rejected.`));
