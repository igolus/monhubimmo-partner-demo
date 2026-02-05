'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import SearchAdForm from '@/components/SearchAdForm';
import { ApiConfig, CreatedSearchAd } from '@/lib/types';
import Link from 'next/link';

export default function CreateSearchAdPage() {
	const router = useRouter();
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [createdSearchAd, setCreatedSearchAd] = useState<CreatedSearchAd | null>(null);

	useEffect(() => {
		const storedConfig = localStorage.getItem('apiConfig');
		if (storedConfig) {
			setConfig(JSON.parse(storedConfig));
		}
	}, []);

	const handleSuccess = (searchAd: CreatedSearchAd) => {
		setCreatedSearchAd(searchAd);
	};

	if (!config) {
		return (
			<div className="p-8">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
					<p className="text-yellow-800">
						Veuillez d&apos;abord configurer votre clé API.
					</p>
					<Link href="/" className="text-indigo-600 hover:underline mt-2 inline-block">
						Retour à la configuration
					</Link>
				</div>
			</div>
		);
	}

	if (createdSearchAd) {
		return (
			<div className="p-8 max-w-2xl mx-auto">
				<div className="bg-green-50 border border-green-200 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<CheckCircle className="text-green-500 mt-0.5" size={24} />
						<div>
							<h2 className="text-lg font-semibold text-green-800">
								Recherche créée avec succès!
							</h2>
							<div className="mt-4 space-y-2 text-sm text-green-700">
								<p><strong>ID:</strong> {createdSearchAd.id}</p>
								{createdSearchAd.externalId && (
									<p><strong>ID Externe:</strong> {createdSearchAd.externalId}</p>
								)}
								<p><strong>Titre:</strong> {createdSearchAd.title}</p>
								<p><strong>Statut:</strong> {createdSearchAd.status}</p>
								<p>
									<strong>Auteur:</strong> {createdSearchAd.author.firstName} {createdSearchAd.author.lastName}
								</p>
							</div>
							<div className="mt-6 flex gap-4">
								<button
									onClick={() => setCreatedSearchAd(null)}
									className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
								>
									Créer une autre recherche
								</button>
								<Link
									href={`/search-ads/${createdSearchAd.id}`}
									className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50"
								>
									Voir la recherche
								</Link>
								<Link
									href="/search-ads/mine"
									className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50"
								>
									Voir toutes mes recherches
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center gap-4 mb-6">
					<button
						onClick={() => router.back()}
						className="p-2 hover:bg-gray-100 rounded-lg"
					>
						<ArrowLeft size={24} />
					</button>
					<h1 className="text-2xl font-bold text-gray-900">
						Créer une recherche
					</h1>
				</div>

				<SearchAdForm config={config} onSuccess={handleSuccess} />
			</div>
		</div>
	);
}
