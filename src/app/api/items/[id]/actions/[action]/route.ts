import { NextResponse } from 'next/server';
import { runAction } from '@/actions/registry';
import { getView } from '@/lib/store';

export async function POST(_: Request, { params }: { params: { id: string; action: string } }) {
  const view = getView(decodeURIComponent(params.id));
  if (!view) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  if (!runAction(params.action, view)) return NextResponse.json({ error: 'Action not available' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
