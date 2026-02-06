import { NextResponse } from 'next/server';
import { getEvents, clearEvents } from '@/lib/webhookStore';

export async function GET() {
	const events = getEvents();
	return NextResponse.json({ events });
}

export async function DELETE() {
	clearEvents();
	return NextResponse.json({ cleared: true });
}
