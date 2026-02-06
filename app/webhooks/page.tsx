'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Copy, Trash2, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { WebhookEvent } from '@/lib/types';

const WEBHOOK_URL = 'http://localhost:3002/api/webhooks/receive';
const POLL_INTERVAL = 3000;

export default function WebhooksPage() {
	const [events, setEvents] = useState<WebhookEvent[]>([]);
	const [copied, setCopied] = useState(false);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const [polling, setPolling] = useState(true);

	const fetchEvents = useCallback(async () => {
		try {
			const res = await fetch('/api/webhooks/events');
			const data = await res.json();
			setEvents(data.events || []);
		} catch {
			// Silently ignore fetch errors during polling
		}
	}, []);

	useEffect(() => {
		fetchEvents();
		if (!polling) return;
		const interval = setInterval(fetchEvents, POLL_INTERVAL);
		return () => clearInterval(interval);
	}, [fetchEvents, polling]);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(WEBHOOK_URL);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleClear = async () => {
		await fetch('/api/webhooks/events', { method: 'DELETE' });
		setEvents([]);
	};

	const toggleExpand = (id: string) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const formatDate = (dateStr: string) => {
		try {
			return new Date(dateStr).toLocaleString('fr-FR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<div>
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Webhooks Reçus</h1>
					<p className="mt-2 text-gray-600">
						Visualisez les webhooks envoyés par MonHubImmo en temps réel.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={() => setPolling(!polling)}
						className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
							polling
								? 'bg-green-100 text-green-700 hover:bg-green-200'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						<RefreshCw size={16} className={polling ? 'animate-spin' : ''} />
						{polling ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
					</button>
					<button
						onClick={handleClear}
						className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
					>
						<Trash2 size={16} />
						Vider
					</button>
				</div>
			</div>

			{/* Webhook URL */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-lg font-semibold text-gray-800 mb-3">URL du Webhook</h2>
				<p className="text-sm text-gray-600 mb-3">
					Configurez cette URL dans MonHubImmo (Configuration Partenaire &gt; Webhooks) pour recevoir les événements.
				</p>
				<div className="flex items-center gap-3">
					<code className="flex-1 px-4 py-3 bg-gray-100 rounded-md text-sm font-mono text-gray-800 select-all">
						{WEBHOOK_URL}
					</code>
					<button
						onClick={handleCopy}
						className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
					>
						{copied ? (
							<>
								<CheckCircle size={16} />
								Copié
							</>
						) : (
							<>
								<Copy size={16} />
								Copier
							</>
						)}
					</button>
				</div>
			</div>

			{/* ngrok Guide */}
			<div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
				<h2 className="text-lg font-semibold text-amber-800 mb-3">
					Tester avec ngrok (tunnel HTTPS)
				</h2>
				<p className="text-sm text-amber-700 mb-4">
					MonHubImmo envoie les webhooks vers une URL HTTPS publique. Pour recevoir les webhooks
					sur votre machine locale, utilisez <strong>ngrok</strong> pour créer un tunnel.
				</p>
				<div className="space-y-4">
					<div>
						<p className="text-sm font-medium text-amber-800 mb-1">1. Installer ngrok</p>
						<code className="block px-4 py-2 bg-amber-100 rounded-md text-sm font-mono text-amber-900">
							npm install -g ngrok
						</code>
						<p className="text-xs text-amber-600 mt-1">
							Ou bien via <span className="font-mono">brew install ngrok</span>, <span className="font-mono">choco install ngrok</span>, ou depuis ngrok.com
						</p>
					</div>
					<div>
						<p className="text-sm font-medium text-amber-800 mb-1">2. Lancer le tunnel vers le port 3002</p>
						<code className="block px-4 py-2 bg-amber-100 rounded-md text-sm font-mono text-amber-900">
							ngrok http 3002
						</code>
					</div>
					<div>
						<p className="text-sm font-medium text-amber-800 mb-1">3. Copier l&apos;URL HTTPS fournie par ngrok</p>
						<p className="text-sm text-amber-700">
							ngrok affiche une URL du type <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">https://abc123.ngrok-free.app</span>
						</p>
					</div>
					<div>
						<p className="text-sm font-medium text-amber-800 mb-1">4. Configurer le webhook dans MonHubImmo</p>
						<p className="text-sm text-amber-700">
							Dans la page Configuration Partenaire &gt; Webhooks, utilisez l&apos;URL :
						</p>
						<code className="block px-4 py-2 bg-amber-100 rounded-md text-sm font-mono text-amber-900 mt-1">
							https://abc123.ngrok-free.app/api/webhooks/receive
						</code>
					</div>
					<div>
						<p className="text-sm font-medium text-amber-800 mb-1">5. Tester</p>
						<p className="text-sm text-amber-700">
							Créez ou modifiez un bien / une recherche via l&apos;API ou l&apos;UI MonHubImmo.
							L&apos;événement apparaîtra ci-dessous automatiquement.
						</p>
					</div>
				</div>
			</div>

			{/* Events List */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-gray-800">
						Événements ({events.length})
					</h2>
				</div>

				{events.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<p className="text-lg">Aucun webhook reçu</p>
						<p className="text-sm mt-2">
							Les webhooks apparaîtront ici automatiquement une fois configurés.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{events.map((event) => (
							<div
								key={event.id}
								className="border border-gray-200 rounded-lg overflow-hidden"
							>
								{/* Event Header */}
								<div
									className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
									onClick={() => toggleExpand(event.id)}
								>
									<div className="flex items-center gap-3">
										{expandedIds.has(event.id) ? (
											<ChevronDown size={16} className="text-gray-500" />
										) : (
											<ChevronRight size={16} className="text-gray-500" />
										)}
										<span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
											{event.event}
										</span>
										<span className="text-sm text-gray-500">
											{formatDate(event.receivedAt)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										{event.signature ? (
											<span className="flex items-center gap-1 text-xs text-green-600">
												<CheckCircle size={14} />
												Signature présente
											</span>
										) : (
											<span className="text-xs text-gray-400">
												Pas de signature
											</span>
										)}
									</div>
								</div>

								{/* Event Body (collapsible) */}
								{expandedIds.has(event.id) && (
									<div className="px-4 py-3 border-t border-gray-200">
										<pre className="text-xs font-mono text-gray-700 bg-gray-50 p-4 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
											{JSON.stringify(event.data, null, 2)}
										</pre>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
