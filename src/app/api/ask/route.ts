import { NextResponse } from 'next/server';
import { askRadar } from '@/agent/ask';
import type { ChatMessage } from '@/lib/llm';

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: { role: 'user' | 'assistant'; content: string }[] };
  if (!Array.isArray(messages) || messages[messages.length - 1]?.role !== 'user') {
    return NextResponse.json({ error: 'A question is required.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await askRadar(messages as ChatMessage[]));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'The radar could not answer just now.' }, { status: 502 });
  }
}
