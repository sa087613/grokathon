import { NextResponse } from 'next/server';
import { applyOp, runState, type PartnerOp } from '@/partners/grokbot';

type Ctx = { params: { id: string } };

export const dynamic = 'force-dynamic';

export function GET(_: Request, { params }: Ctx) {
  const state = runState(decodeURIComponent(params.id));
  return state ? NextResponse.json(state) : NextResponse.json({ error: 'Item not found' }, { status: 404 });
}

export async function POST(req: Request, { params }: Ctx) {
  const id = decodeURIComponent(params.id);
  if (!runState(id)) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  const error = applyOp(id, (await req.json()) as PartnerOp);
  return error ? NextResponse.json({ error }, { status: 400 }) : NextResponse.json(runState(id));
}
