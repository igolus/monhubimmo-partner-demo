'use client';

import { useState, useEffect } from 'react';
import ApiKeyForm from '@/components/ApiKeyForm';
import { getConfig, saveConfig } from '@/lib/storage';
import { ApiConfig } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

export default function ConfigPage() {
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [showSaved, setShowSaved] = useState(false);

	useEffect(() => {
		const storedConfig = getConfig();
		setConfig(storedConfig);
		setIsLoaded(true);
	}, []);

	const handleSave = (newConfig: ApiConfig) => {
		saveConfig(newConfig);
		setConfig(newConfig);
		setShowSaved(true);
		setTimeout(() => setShowSaved(false), 3000);
	};

	if (!isLoaded) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
				<p className="mt-2 text-gray-600">
					Configurez votre connexion à l&apos;API partenaire MonHubImmo. Vous
					aurez besoin de votre clé API fournie par l&apos;équipe MonHubImmo.
				</p>
			</div>

			{showSaved && (
				<div className="mb-4 flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-md">
					<CheckCircle size={20} />
					<span>Configuration enregistrée avec succès !</span>
				</div>
			)}

			<ApiKeyForm initialConfig={config} onSave={handleSave} />

			<div className="mt-8 p-4 bg-gray-100 rounded-lg">
				<h3 className="font-medium text-gray-800 mb-2">
					Comment obtenir une clé API ?
				</h3>
				<ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
					<li>Connectez-vous à votre compte partenaire sur MonHubImmo</li>
					<li>Accédez à la page &quot;API&quot; dans votre espace partenaire</li>
					<li>Copiez votre clé API affichée</li>
				</ol>
			</div>
		</div>
	);
}
