import { hashEmbed } from './embed';

export type Provider = 'anthropic' | 'openai' | 'fixture';
export type Tier = 'cheap' | 'full';

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON schema
}
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}
export type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: ToolCall[] }
  | { role: 'tool'; toolCallId: string; content: string };

export interface ChatResult {
  text: string;
  toolCalls: ToolCall[];
  model: string;
}

const MODELS = {
  anthropic: { cheap: 'claude-haiku-5-5', full: 'claude-sonnet-5-5' },
  openai: { cheap: 'gpt-4o-mini', full: 'gpt-4o' },
};

/** LLM_MODE=live drives Ask the radar only. Triage stays on fixtures unless LLM_TRIAGE=1. */
const triageProvider = (): Provider => (process.env.LLM_TRIAGE === '1' ? provider() : 'fixture');

export function provider(): Provider {
  if (process.env.LLM_FIXTURE === '1' || process.env.LLM_MODE !== 'live') return 'fixture';
  const asked = process.env.LLM_PROVIDER;
  if (asked === 'anthropic' && process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (asked === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'fixture';
}

function modelFor(p: Exclude<Provider, 'fixture'>, tier: Tier): string {
  const override = tier === 'cheap' ? process.env.LLM_MODEL_CHEAP : process.env.LLM_MODEL_FULL;
  return override || MODELS[p][tier];
}

async function post(url: string, headers: Record<string, string>, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

function toAnthropic(messages: ChatMessage[]) {
  const out: { role: string; content: unknown }[] = [];
  for (const m of messages) {
    if (m.role === 'user') out.push({ role: 'user', content: m.content });
    else if (m.role === 'assistant') {
      const content: unknown[] = m.content ? [{ type: 'text', text: m.content }] : [];
      for (const c of m.toolCalls ?? []) content.push({ type: 'tool_use', id: c.id, name: c.name, input: c.args });
      out.push({ role: 'assistant', content });
    } else {
      const block = { type: 'tool_result', tool_use_id: m.toolCallId, content: m.content };
      const last = out[out.length - 1];
      // Parallel tool results must share one user turn.
      if (last?.role === 'user' && Array.isArray(last.content)) last.content.push(block);
      else out.push({ role: 'user', content: [block] });
    }
  }
  return out;
}

function toOpenAI(system: string, messages: ChatMessage[]) {
  return [
    { role: 'system', content: system },
    ...messages.map((m) => {
      if (m.role === 'tool') return { role: 'tool', tool_call_id: m.toolCallId, content: m.content };
      if (m.role === 'user' || !m.toolCalls?.length) return { role: m.role, content: m.content };
      return {
        role: 'assistant',
        content: m.content || null,
        tool_calls: m.toolCalls.map((c) => ({
          id: c.id,
          type: 'function',
          function: { name: c.name, arguments: JSON.stringify(c.args) },
        })),
      };
    }),
  ];
}

async function callProvider(p: Exclude<Provider, 'fixture'>, tier: Tier, system: string, messages: ChatMessage[], tools?: ToolDef[], json = false): Promise<ChatResult> {
  const model = modelFor(p, tier);
  if (p === 'anthropic') {
    const data = await post(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      {
        model,
        max_tokens: 1500,
        system,
        messages: toAnthropic(messages),
        ...(tools?.length ? { tools: tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })) } : {}),
      },
    );
    const blocks: any[] = data.content ?? [];
    return {
      model,
      text: blocks.filter((b) => b.type === 'text').map((b) => b.text).join(''),
      toolCalls: blocks.filter((b) => b.type === 'tool_use').map((b) => ({ id: b.id, name: b.name, args: b.input })),
    };
  }
  const data = await post(
    'https://api.openai.com/v1/chat/completions',
    { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    {
      model,
      messages: toOpenAI(system, messages),
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      ...(tools?.length
        ? { tools: tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters } })) }
        : {}),
    },
  );
  const msg = data.choices[0].message;
  return {
    model,
    text: msg.content ?? '',
    toolCalls: (msg.tool_calls ?? []).map((c: any) => ({ id: c.id, name: c.function.name, args: JSON.parse(c.function.arguments || '{}') })),
  };
}

export function parseJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** One JSON completion. `fixture` supplies the canned answer in FIXTURE mode. */
export async function completeJson<T>(opts: { tier: Tier; system: string; user: string; fixture: () => T }): Promise<{ data: unknown; model: string }> {
  const p = triageProvider();
  if (p === 'fixture') return { data: opts.fixture(), model: 'fixture' };
  const res = await callProvider(p, opts.tier, opts.system, [{ role: 'user', content: opts.user }], undefined, true);
  return { data: parseJson(res.text), model: res.model };
}

/** One chat turn, possibly returning tool calls. */
export async function chat(opts: { system: string; messages: ChatMessage[]; tools: ToolDef[]; fixture: (messages: ChatMessage[]) => Omit<ChatResult, 'model'> }): Promise<ChatResult> {
  const p = provider();
  if (p === 'fixture') return { ...opts.fixture(opts.messages), model: 'fixture' };
  return callProvider(p, 'full', opts.system, opts.messages, opts.tools);
}

/** Real embeddings need OpenAI; everything else uses the local hashed embedding. */
export async function embed(text: string): Promise<{ vector: number[]; model: string }> {
  if (triageProvider() !== 'fixture' && process.env.OPENAI_API_KEY) {
    const data = await post(
      'https://api.openai.com/v1/embeddings',
      { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      { model: 'text-embedding-3-small', input: text.slice(0, 8000) },
    );
    return { vector: data.data[0].embedding, model: 'text-embedding-3-small' };
  }
  return { vector: hashEmbed(text), model: 'hash-512' };
}
