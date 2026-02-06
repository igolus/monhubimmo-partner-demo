import { NextRequest, NextResponse } from 'next/server';
import { addEvent } from '@/lib/webhookStore';
import { WebhookEvent } from '@/lib/types';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const signature = request.headers.get('x-webhook-signature');
		const eventType = request.headers.get('x-webhook-event') || body.event || 'unknown';

		const webhookEvent: WebhookEvent = {
			id: crypto.randomUUID(),
			event: eventType,
			timestamp: body.timestamp || new Date().toISOString(),
			data: body.data || body,
			receivedAt: new Date().toISOString(),
			signature: signature,
			verified: false,
		};

		addEvent(webhookEvent);

		return NextResponse.json({ received: true }, { status: 200 });
	} catch {
		return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
	}
}
