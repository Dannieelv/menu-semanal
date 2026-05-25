import { NextRequest, NextResponse } from 'next/server';
import { addSubscription } from '@/lib/subscriptions';

export async function POST(request: NextRequest) {
  const sub = await request.json();
  if (!sub?.endpoint || !sub?.keys?.auth || !sub?.keys?.p256dh) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }
  addSubscription(sub);
  return NextResponse.json({ ok: true });
}
