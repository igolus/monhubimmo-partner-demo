import { WebhookEvent } from './types';

const MAX_EVENTS = 100;

// Global variable to persist across API route calls within the same server process
const globalStore = globalThis as unknown as { __webhookEvents?: WebhookEvent[] };

function getStore(): WebhookEvent[] {
	if (!globalStore.__webhookEvents) {
		globalStore.__webhookEvents = [];
	}
	return globalStore.__webhookEvents;
}

export function addEvent(event: WebhookEvent): void {
	const store = getStore();
	store.unshift(event);
	if (store.length > MAX_EVENTS) {
		store.length = MAX_EVENTS;
	}
}

export function getEvents(): WebhookEvent[] {
	return getStore();
}

export function clearEvents(): void {
	globalStore.__webhookEvents = [];
}
