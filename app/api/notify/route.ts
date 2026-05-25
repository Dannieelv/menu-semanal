import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getSubscriptions, removeSubscription } from '@/lib/subscriptions';

webpush.setVapidDetails(
  process.env.VAPID_CONTACT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  const { dia, plato } = await request.json();

  const payload = JSON.stringify({
    title: '🍽️ Menú actualizado',
    body: `${dia}: ${plato}`,
  });

  const subs = getSubscriptions();
  await Promise.allSettled(
    subs.map((sub) =>
      webpush
        .sendNotification(sub as webpush.PushSubscription, payload)
        .catch((err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            removeSubscription(sub.endpoint);
          }
        })
    )
  );

  return NextResponse.json({ ok: true });
}
