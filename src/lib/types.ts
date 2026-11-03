export type Source = 'openfda' | 'fda-rss' | 'atlanta-council' | 'atlanta-notices' | 'county-health';

/** The one normalized shape every fetcher returns. */
export interface Item {
  id: string;
  source: Source;
  title: string;
  url: string;
  publishedAt: string; // ISO date
  rawText: string;
  /** Extension point for partner agents. Unused for now. */
  partnerRuns?: PartnerRun[] | null;
}

export interface PartnerRun {
  id: string;
  itemId: string;
  partner: string;
  status: string;
  payload: string | null;
  createdAt: string;
}

export type DecisionKind = 'NEEDS_ACTION' | 'TO_CHECK' | 'FOR_THE_FILE' | 'REJECT';
export const DECISION_KINDS: DecisionKind[] = ['NEEDS_ACTION', 'TO_CHECK', 'FOR_THE_FILE', 'REJECT'];

export interface TriageResult {
  decision: DecisionKind;
  reason: string;
  actionable: boolean;
  deadline?: string;
  suggestedAction?: string;
}

export type OverrideKind = 'didnt_need' | 'should_have_surfaced';

export interface DecisionRow extends TriageResult {
  id: number;
  itemId: string;
  input: string;
  stage: 'screen' | 'full';
  model: string;
  createdAt: string;
  overridden: boolean;
  overrideKind: OverrideKind | null;
  /** The decision after any owner overturn. */
  effective: DecisionKind;
}

export type Topic = 'food_recalls' | 'permits_fees' | 'council_routine' | 'street_work' | 'health_code';

export const TOPIC_LABELS: Record<Topic, string> = {
  food_recalls: 'Food recalls',
  permits_fees: 'Permits & fees',
  council_routine: 'Council routine',
  street_work: 'Nearby street work',
  health_code: 'Health code changes',
};

export interface Permit {
  name: string;
  issuer: string;
  expires: string;
}

export interface StoreProfile {
  businessName: string;
  businessType: 'restaurant' | 'food_truck';
  homeCounty: 'Fulton' | 'DeKalb';
  commissary: string;
  countiesOperated: string[];
  permits: Permit[];
  suppliers: string[];
  headcount: number;
  baseLocation: string;
}

export interface ItemView extends Item {
  topic: Topic;
  classLabel: string;
  resolvedAt: string | null;
  decision: DecisionRow;
}
