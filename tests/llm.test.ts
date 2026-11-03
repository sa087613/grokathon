import { afterEach, describe, expect, it, vi } from 'vitest';
import { chat, completeJson, embed, provider, type ChatMessage } from '@/lib/llm';

const stubFetch = (body: unknown) => {
  const fn = vi.fn(async (_url: string, _init: { body: string }) => new Response(JSON.stringify(body)));
  vi.stubGlobal('fetch', fn);
  return fn;
};

const toolTurn: ChatMessage[] = [
  { role: 'user', content: 'hi' },
  { role: 'assistant', content: '', toolCalls: [{ id: 't1', name: 'a', args: {} }, { id: 't2', name: 'b', args: {} }] },
  { role: 'tool', toolCallId: 't1', content: '1' },
  { role: 'tool', toolCallId: 't2', content: '2' },
];

describe('llm wrapper', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('uses fixture mode with no keys', async () => {
    vi.stubEnv('LLM_FIXTURE', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    expect(provider()).toBe('fixture');
    expect(await completeJson({ tier: 'cheap', system: '', user: '', fixture: () => ({ a: 1 }) })).toEqual({ data: { a: 1 }, model: 'fixture' });
    expect((await embed('hello')).model).toBe('hash-512');
  });

  it('groups parallel tool results for Anthropic', async () => {
    vi.stubEnv('LLM_FIXTURE', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', 'k');
    const f = stubFetch({ content: [{ type: 'tool_use', id: 't3', name: 'a', input: { q: 1 } }] });
    const r = await chat({ system: 's', messages: toolTurn, tools: [], fixture: () => ({ text: '', toolCalls: [] }) });
    expect(r.toolCalls[0]).toEqual({ id: 't3', name: 'a', args: { q: 1 } });
    const sent = JSON.parse(f.mock.calls[0][1].body);
    expect(sent.messages).toHaveLength(3);
    expect(sent.messages[2].content).toHaveLength(2);
  });

  it('maps tool calls for OpenAI', async () => {
    vi.stubEnv('LLM_FIXTURE', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', 'k');
    const f = stubFetch({ choices: [{ message: { content: 'done' } }] });
    const r = await chat({ system: 's', messages: toolTurn, tools: [], fixture: () => ({ text: '', toolCalls: [] }) });
    expect(r.text).toBe('done');
    const sent = JSON.parse(f.mock.calls[0][1].body);
    expect(sent.messages[0].role).toBe('system');
    expect(sent.messages[2].tool_calls).toHaveLength(2);
    expect(sent.messages[3]).toEqual({ role: 'tool', tool_call_id: 't1', content: '1' });
  });
});
