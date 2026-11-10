import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { addEvent } from '@/lib/webhookStore';
import { WebhookEvent } from '@/lib/types';

/**
 * Reception des webhooks MonHubImmo.
 *
 * La signature est un HMAC-SHA256 du CORPS BRUT, prefixe de `sha256=`, calcule
 * avec le signing secret du webhook. Il faut donc lire le corps en texte et
 * analyser ce meme texte : `request.json()` consomme le flux, et re-serialiser
 * l'objet produirait d'autres octets, donc une autre signature.
 *
 * Secret attendu dans `MHI_WEBHOOK_SECRET` (.env.local). Sans lui, l'evenement
 * est accepte et stocke, mais marque non verifie.
 */
export async function POST(request: NextRequest) {
	try {
		// Corps brut : indispensable au calcul de la signature.
		const rawBody = await request.text();

		let body: {
			event?: string;
			timestamp?: string;
			data?: Record<string, unknown>;
		};
		try {
			body = JSON.parse(rawBody);
		} catch {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
		}

		const signature = request.headers.get('x-webhook-signature');
		const eventType = request.headers.get('x-webhook-event') || body.event || 'unknown';
		const secret = process.env.MHI_WEBHOOK_SECRET;

		let verified = false;
		if (secret && signature) {
			const expected =
				'sha256=' + createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
			const a = Buffer.from(expected);
			const b = Buffer.from(signature);
			// timingSafeEqual jette si les longueurs different : les comparer d'abord.
			verified = a.length === b.length && timingSafeEqual(a, b);
		}

		const webhookEvent: WebhookEvent = {
			id: crypto.randomUUID(),
			event: eventType,
			timestamp: body.timestamp || new Date().toISOString(),
			data: body.data || (body as Record<string, unknown>),
			receivedAt: new Date().toISOString(),
			signature,
			verified,
		};

		addEvent(webhookEvent);

		// On repond 2xx meme si la signature est invalide : la demo sert a
		// observer ce qui arrive. Une integration reelle renverrait 401.
		return NextResponse.json({ received: true, verified }, { status: 200 });
	} catch {
		return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
	}
}
