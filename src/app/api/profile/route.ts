import { NextResponse } from 'next/server';
import { saveProfile } from '@/lib/store';
import type { StoreProfile } from '@/lib/types';

export async function PUT(req: Request) {
  const p = (await req.json()) as StoreProfile;
  if (!p.businessName?.trim() || !['restaurant', 'food_truck'].includes(p.businessType) || !Array.isArray(p.permits)) {
    return NextResponse.json({ error: 'Business name and type are required.' }, { status: 400 });
  }
  saveProfile(p);
  return NextResponse.json({ ok: true });
}
