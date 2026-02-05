'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getSearchAd, GetSearchAdResult } from '@/lib/api';
import { ApiConfig, PartnerSearchAdSummary, UpdatedSearchAd, SearchAdDetail } from '@/lib/types';
import SearchAdEditForm from '@/components/SearchAdEditForm';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function EditSearchAdPage({ params }: PageProps) {
	const { id } = use(params);
	const router = useRouter();
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchAd, setSearchAd] = useState<PartnerSearchAdSummary | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [updatedSearchAd, setUpdatedSearchAd] = useState<UpdatedSearchAd | null>(null);

	useEffect(() => {
		const storedConfig = localStorage.getItem('apiConfig');
		if (storedConfig) {
			setConfig(JSON.parse(storedConfig));
		} else {
			setLoading(false);
		}
	}, []);

	const loadSearchAd = useCallback(async () => {
		if (!config) return;
		setLoading(true);
		setError(null);

		const result: GetSearchAdResult = await getSearchAd(config, id);

		if (result.success && result.searchAd) {
			// Convert SearchAdDetail to PartnerSearchAdSummary format
			const detail = result.searchAd as SearchAdDetail & { externalId?: string };
			setSearchAd({
				...detail,
				externalId: detail.externalId,
				author: detail.author ? {
					id: detail.author.id,
					firstName: detail.author.firstName,
					lastName: detail.author.lastName,
					userType: detail.author.userType,
					externalId: (detail.author as { externalId?: string }).externalId,
				} : null,
			} as PartnerSearchAdSummary);
		} else {
			setError(result.error || 'Recherche non trouvée');
		}

		setLoading(false);
	}, [config, id]);

	useEffect(() => {
		if (config) {
			loadSearchAd();
		}
	}, [config, loadSearchAd]);

	const handleSuccess = (updated: UpdatedSearchAd) => {
		setUpdatedSearchAd(updated);
	};

	const handleCancel = () => {
		router.back();
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

	if (loading) {
		return (
			<div className="p-8 flex justify-center items-center h-64">
				<Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<div className="max-w-2xl mx-auto">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6">
						<div className="flex items-start gap-3">
							<AlertCircle className="text-red-500 mt-0.5" size={24} />
							<div>
								<h2 className="text-lg font-semibold text-red-800">Erreur</h2>
								<p className="mt-1 text-red-700">{error}</p>
								<div className="mt-4 flex gap-4">
									<button
										onClick={() => router.back()}
										className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
									>
										Retour
									</button>
									<button
										onClick={loadSearchAd}
										className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
									>
										Réessayer
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (updatedSearchAd) {
		return (
			<div className="p-8 max-w-2xl mx-auto">
				<div className="bg-green-50 border border-green-200 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<CheckCircle className="text-green-500 mt-0.5" size={24} />
						<div>
							<h2 className="text-lg font-semibold text-green-800">
								Recherche mise à jour avec succès!
							</h2>
							<div className="mt-4 space-y-2 text-sm text-green-700">
								<p><strong>ID:</strong> {updatedSearchAd.id}</p>
								{updatedSearchAd.externalId && (
									<p><strong>ID Externe:</strong> {updatedSearchAd.externalId}</p>
								)}
								<p><strong>Titre:</strong> {updatedSearchAd.title}</p>
								<p><strong>Statut:</strong> {updatedSearchAd.status}</p>
							</div>
							<div className="mt-6 flex gap-4">
								<Link
									href={`/search-ads/${updatedSearchAd.id}`}
									className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
								>
									Voir la recherche
								</Link>
								<Link
									href="/search-ads/mine"
									className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50"
								>
									Retour à la liste
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!searchAd) {
		return null;
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
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Modifier la recherche
						</h1>
						<p className="text-gray-500">{searchAd.title}</p>
					</div>
				</div>

				<SearchAdEditForm
					config={config}
					searchAd={searchAd}
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			</div>
		</div>
	);
}
