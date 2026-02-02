'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Settings, Zap } from 'lucide-react';
import { testConnection } from '@/lib/api';
import { ApiConfig } from '@/lib/types';

interface ApiKeyFormProps {
	initialConfig: ApiConfig | null;
	onSave: (config: ApiConfig) => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export default function ApiKeyForm({ initialConfig, onSave }: ApiKeyFormProps) {
	const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
	const [apiUrl, setApiUrl] = useState(
		initialConfig?.apiUrl || 'http://localhost:4000'
	);
	const [jwtSecret, setJwtSecret] = useState(initialConfig?.jwtSecret || '');
	const [connectionStatus, setConnectionStatus] =
		useState<ConnectionStatus>('idle');
	const [partnerId, setPartnerId] = useState(initialConfig?.partnerId || '');
	const [partnerName, setPartnerName] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleTestConnection = async () => {
		if (!apiKey.trim()) {
			setConnectionStatus('error');
			setErrorMessage('Veuillez entrer une clé API');
			return;
		}

		setConnectionStatus('testing');
		setErrorMessage('');
		setPartnerName('');
		setPartnerId('');

		const result = await testConnection({ apiKey, apiUrl });

		if (result.success) {
			setConnectionStatus('success');
			setPartnerId(result.partnerId || '');
			setPartnerName(result.partnerName || '');
		} else {
			setConnectionStatus('error');
			setErrorMessage(result.error || 'Connexion echouee');
		}
	};

	const handleSave = () => {
		if (!apiKey.trim() || !apiUrl.trim()) return;

		// Warn if JWT secret is provided but no partnerId (user should test connection first)
		if (jwtSecret.trim() && !partnerId) {
			alert('Veuillez tester la connexion avant de sauvegarder pour recuperer le Partner ID necessaire a la connexion JWT.');
			return;
		}

		onSave({
			apiKey,
			apiUrl,
			jwtSecret: jwtSecret.trim() || undefined,
			partnerId: partnerId || undefined,
		});
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<div className="flex items-center gap-3 mb-6">
				<Settings className="text-indigo-600" size={24} />
				<h2 className="text-xl font-semibold text-gray-800">
					Configuration API
				</h2>
			</div>

			<div className="space-y-4">
				<div>
					<label
						htmlFor="apiUrl"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						URL de l&apos;API
					</label>
					<input
						id="apiUrl"
						type="text"
						value={apiUrl}
						onChange={(e) => setApiUrl(e.target.value)}
						placeholder="http://localhost:4000"
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>

				<div>
					<label
						htmlFor="apiKey"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Cle API Partenaire
					</label>
					<input
						id="apiKey"
						type="text"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="Entrez votre cle API..."
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
					/>
				</div>

				<div>
					<label
						htmlFor="jwtSecret"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						JWT Secret (pour connexion utilisateur)
					</label>
					<input
						id="jwtSecret"
						type="password"
						value={jwtSecret}
						onChange={(e) => setJwtSecret(e.target.value)}
						placeholder="Entrez votre JWT secret (64 caracteres)..."
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
					/>
					<p className="mt-1 text-xs text-gray-500">
						Optionnel. Permet de connecter vos utilisateurs directement a MonHubImmo.
					</p>
				</div>

				<div className="flex gap-3">
					<button
						onClick={handleTestConnection}
						disabled={connectionStatus === 'testing'}
						className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
					>
						{connectionStatus === 'testing' ? (
							<Loader2 className="animate-spin" size={18} />
						) : (
							<Zap size={18} />
						)}
						Tester la connexion
					</button>

					<button
						onClick={handleSave}
						disabled={!apiKey.trim() || !apiUrl.trim()}
						className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
					>
						Enregistrer
					</button>
				</div>

				{connectionStatus === 'success' && (
					<div className="p-4 bg-green-50 text-green-700 rounded-md space-y-1">
						<div className="flex items-center gap-2">
							<CheckCircle size={20} />
							<span>
								Connexion réussie ! Partenaire : <strong>{partnerName}</strong>
							</span>
						</div>
						{partnerId && (
							<p className="text-sm ml-7">
								Partner ID : <code className="bg-green-100 px-1 rounded">{partnerId}</code>
							</p>
						)}
					</div>
				)}

				{connectionStatus === 'error' && (
					<div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-md">
						<XCircle size={20} />
						<span>{errorMessage}</span>
					</div>
				)}
			</div>
		</div>
	);
}
