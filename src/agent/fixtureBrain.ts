import type { Item, StoreProfile, TriageResult } from '@/lib/types';
import { classify } from '@/lib/classify';
import type { Example } from './retrieve';

/** Below this, an owner overturn is not close enough to count as precedent. */
export const PRECEDENT_THRESHOLD = 0.5;

const MONTH = 'January|February|March|April|May|June|July|August|September|October|November|December';
const MOBILE = /mobile food|food truck|mobile unit|vending|vendor/i;

export function firstUpcomingDate(text: string, now = new Date()): string | undefined {
  const today = now.toISOString().slice(0, 10);
  for (const [m] of text.matchAll(new RegExp(`(?:${MONTH}) \\d{1,2}, \\d{4}`, 'g'))) {
    const d = new Date(`${m} UTC`).toISOString().slice(0, 10);
    if (d >= today) return d;
  }
  return undefined;
}

export function streetNames(address: string): string[] {
  const re = /([A-Z][a-z]+(?: [A-Z][a-z]+)?) (?:Rd|St|Ave|Blvd|Dr|Way|Street|Road|Avenue)\b/g;
  return [...address.matchAll(re)].map((m) => m[1]);
}

const result = (decision: TriageResult['decision'], reason: string, extra: Partial<TriageResult> = {}): TriageResult => ({
  decision, reason, actionable: decision === 'NEEDS_ACTION', ...extra,
});

export function screenFixture(item: Item): { verdict: 'REJECT' | 'INVESTIGATE'; reason: string } {
  return /vending|food|restaurant|mobile|commissary|permit|health|street/i.test(item.title)
    ? { verdict: 'INVESTIGATE', reason: 'Title may affect food operators.' }
    : { verdict: 'REJECT', reason: 'Title has no bearing on food operators.' };
}

/** Canned rules that stand in for the model, so the whole loop works with zero keys. */
export function triageFixture(item: Item, profile: StoreProfile, examples: Example[]): TriageResult {
  const precedent = examples.find((e) => e.view.decision.overridden && e.similarity >= PRECEDENT_THRESHOLD);
  if (precedent) {
    return precedent.view.decision.overrideKind === 'should_have_surfaced'
      ? result('TO_CHECK', `You asked to see a similar item: "${precedent.view.title}".`)
      : result('REJECT', `You dismissed a similar item: "${precedent.view.title}".`);
  }
  const text = `${item.title}\n${item.rawText}`;
  const date = firstUpcomingDate(text);
  const isTruck = profile.businessType === 'food_truck';
  const mobile = MOBILE.test(text);

  switch (classify(item).topic) {
    case 'food_recalls': {
      const hit = profile.suppliers.find((s) => text.toLowerCase().includes(s.toLowerCase()));
      if (hit) {
        return result('NEEDS_ACTION', `Names ${hit}, which you carry.`, {
          deadline: new Date().toISOString().slice(0, 10),
          suggestedAction: `Check stock from ${hit} against the affected lots and pull any match.`,
        });
      }
      if (/foodservice|wholesale|restaurants/i.test(text) && /georgia|\bGA\b|nationwide/i.test(text)) {
        return result('FOR_THE_FILE', 'Foodservice recall reaching Georgia; no brand you carry.');
      }
      return result('REJECT', 'No carried brand or supplier, and outside your channel.');
    }
    case 'street_work': {
      const street = streetNames(`${profile.commissary}, ${profile.baseLocation}`).find((s) => text.includes(s));
      if (!street) return result('REJECT', 'Not near your commissary or base location.');
      return result('TO_CHECK', `Work on ${street}, on your route or at your base.`, {
        deadline: date,
        suggestedAction: `Plan around ${street} before service.`,
      });
    }
    case 'council_routine':
      if (mobile && isTruck) {
        return result(date ? 'NEEDS_ACTION' : 'TO_CHECK', 'Changes the rules for mobile food vending in Atlanta.', {
          deadline: date,
          suggestedAction: 'Read the item and confirm your vending location still qualifies.',
        });
      }
      if (/food service|commissary/i.test(text)) return result('FOR_THE_FILE', 'Touches food businesses, nothing to do yet.');
      return result('REJECT', 'Routine council business, nothing touching your permits.');
    case 'permits_fees':
    case 'health_code': {
      const other = text.match(/\b(Fulton|DeKalb|Cobb|Gwinnett|Clayton) County\b/)?.[1];
      if (other && !profile.countiesOperated.includes(other)) return result('REJECT', `${other} County, where you do not operate.`);
      if (mobile) {
        if (!isTruck) return result('REJECT', 'Applies to mobile units, not restaurants.');
        return result(date ? 'NEEDS_ACTION' : 'TO_CHECK', 'Applies to your mobile unit permits.', {
          deadline: date,
          suggestedAction: date ? 'Complete this before the date shown.' : 'Check whether this changes what you keep on board.',
        });
      }
      if (/restaurant|food service/i.test(text)) return result('FOR_THE_FILE', 'General food service notice, nothing to do.');
      return result('REJECT', 'Does not apply to a food business.');
    }
  }
}
