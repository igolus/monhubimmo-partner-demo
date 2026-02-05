'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Search, Eye, Edit, Plus, Filter, ChevronLeft, ChevronRight, X, MapPin, Euro, Home } from 'lucide-react';
import { listPartnerSearchAds, ListPartnerSearchAdsResult } from '@/lib/api';
import { ApiConfig, PartnerSearchAdSummary, PartnerSearchAdFilters } from '@/lib/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	active: { label: 'Active', color: 'bg-green-100 text-green-800' },
	paused: { label: 'En pause', color: 'bg-yellow-100 text-yellow-800' },
	archived: { label: 'Archivée', color: 'bg-gray-100 text-gray-800' },
	fulfilled: { label: 'Aboutie', color: 'bg-blue-100 text-blue-800' },
	sold: { label: 'Vendu', color: 'bg-purple-100 text-purple-800' },
	rented: { label: 'Loué', color: 'bg-purple-100 text-purple-800' },
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
	house: 'Maison',
	apartment: 'Appartement',
	land: 'Terrain',
	building: 'Immeuble',
	commercial: 'Local commercial',
};

export default function PartnerSearchAdsPage() {
	const router = useRouter();
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [loading, setLoading] = useState(true);
	const [result, setResult] = useState<ListPartnerSearchAdsResult | null>(null);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<PartnerSearchAdFilters>({});
	const [showFilters, setShowFilters] = useState(false);

	// Filter inputs
	const [statusFilter, setStatusFilter] = useState('');
	const [externalIdFilter, setExternalIdFilter] = useState('');

	useEffect(() => {
		const storedConfig = localStorage.getItem('apiConfig');
		if (storedConfig) {
			setConfig(JSON.parse(storedConfig));
		} else {
			setLoading(false);
		}
	}, []);

	const loadSearchAds = useCallback(async () => {
		if (!config) return;
		setLoading(true);
		const data = await listPartnerSearchAds(config, filters, page, 20);
		setResult(data);
		setLoading(false);
	}, [config, filters, page]);

	useEffect(() => {
		if (config) {
			loadSearchAds();
		}
	}, [config, loadSearchAds]);

	const applyFilters = () => {
		const newFilters: PartnerSearchAdFilters = {};
		if (statusFilter) newFilters.status = statusFilter;
		if (externalIdFilter) newFilters.externalId = externalIdFilter;
		setFilters(newFilters);
		setPage(1);
		setShowFilters(false);
	};

	const clearFilters = () => {
		setStatusFilter('');
		setExternalIdFilter('');
		setFilters({});
		setPage(1);
	};

	const formatBudget = (amount?: number) => {
		if (!amount) return 'Non défini';
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0,
		}).format(amount);
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

	return (
		<div className="p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-900">
						Mes recherches (API)
					</h1>
					<div className="flex gap-3">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
								Object.keys(filters).length > 0
									? 'bg-indigo-100 text-indigo-700'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							<Filter size={20} />
							Filtres
							{Object.keys(filters).length > 0 && (
								<span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
									{Object.keys(filters).length}
								</span>
							)}
						</button>
						<Link
							href="/search-ads/create"
							className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
						>
							<Plus size={20} />
							Nouvelle recherche
						</Link>
					</div>
				</div>

				{/* Filters panel */}
				{showFilters && (
					<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Statut
								</label>
								<select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
								>
									<option value="">Tous les statuts</option>
									<option value="active">Active</option>
									<option value="paused">En pause</option>
									<option value="archived">Archivée</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									ID Externe
								</label>
								<input
									type="text"
									value={externalIdFilter}
									onChange={(e) => setExternalIdFilter(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
									placeholder="Votre référence"
								/>
							</div>
						</div>
						<div className="flex gap-3 mt-4">
							<button
								onClick={applyFilters}
								className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
							>
								Appliquer
							</button>
							<button
								onClick={clearFilters}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
							>
								Effacer
							</button>
						</div>
					</div>
				)}

				{/* Active filters */}
				{Object.keys(filters).length > 0 && (
					<div className="flex flex-wrap gap-2 mb-4">
						{filters.status && (
							<span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
								Statut: {STATUS_LABELS[filters.status]?.label || filters.status}
								<button onClick={() => {
									const { status, ...rest } = filters;
									setFilters(rest);
								}}>
									<X size={14} />
								</button>
							</span>
						)}
						{filters.externalId && (
							<span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
								ID: {filters.externalId}
								<button onClick={() => {
									const { externalId, ...rest } = filters;
									setFilters(rest);
								}}>
									<X size={14} />
								</button>
							</span>
						)}
					</div>
				)}

				{/* Loading */}
				{loading && (
					<div className="flex justify-center items-center h-64">
						<Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
					</div>
				)}

				{/* Error */}
				{!loading && result && !result.success && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-6">
						<p className="text-red-800">Erreur: {result.error}</p>
					</div>
				)}

				{/* Empty state */}
				{!loading && result?.success && result.searchAds?.length === 0 && (
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
						<Search className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-4 text-lg font-medium text-gray-900">
							Aucune recherche trouvée
						</h3>
						<p className="mt-2 text-gray-500">
							{Object.keys(filters).length > 0
								? "Aucune recherche ne correspond à vos critères de filtrage."
								: "Vous n'avez pas encore créé de recherche via l'API."}
						</p>
						<Link
							href="/search-ads/create"
							className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
						>
							<Plus size={20} />
							Créer une recherche
						</Link>
					</div>
				)}

				{/* Search ads grid */}
				{!loading && result?.success && result.searchAds && result.searchAds.length > 0 && (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{result.searchAds.map((searchAd) => (
								<div
									key={searchAd.id}
									className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
								>
									{/* Header with status */}
									<div className="p-4 border-b border-gray-100">
										<div className="flex items-start justify-between">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-gray-900 truncate">
													{searchAd.title}
												</h3>
												{searchAd.externalId && (
													<p className="text-xs text-gray-500 mt-0.5">
														Ref: {searchAd.externalId}
													</p>
												)}
											</div>
											<span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
												STATUS_LABELS[searchAd.status]?.color || 'bg-gray-100 text-gray-800'
											}`}>
												{STATUS_LABELS[searchAd.status]?.label || searchAd.status}
											</span>
										</div>
									</div>

									{/* Content */}
									<div className="p-4 space-y-3">
										{/* Property types */}
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<Home size={16} className="flex-shrink-0" />
											<span className="truncate">
												{searchAd.propertyTypes.map(t => PROPERTY_TYPE_LABELS[t] || t).join(', ')}
											</span>
										</div>

										{/* Location */}
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<MapPin size={16} className="flex-shrink-0" />
											<span className="truncate">
												{searchAd.location?.cities?.slice(0, 3).join(', ')}
												{searchAd.location?.cities?.length > 3 && ` +${searchAd.location.cities.length - 3}`}
											</span>
										</div>

										{/* Budget */}
										{searchAd.budget?.max && (
											<div className="flex items-center gap-2 text-sm text-gray-600">
												<Euro size={16} className="flex-shrink-0" />
												<span>Budget max: {formatBudget(searchAd.budget.max)}</span>
											</div>
										)}

										{/* Author */}
										{searchAd.author && (
											<p className="text-xs text-gray-500">
												Par {searchAd.author.firstName} {searchAd.author.lastName}
											</p>
										)}
									</div>

									{/* Actions */}
									<div className="p-4 border-t border-gray-100 flex gap-2">
										<Link
											href={`/search-ads/${searchAd.id}`}
											className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 text-sm"
										>
											<Eye size={16} />
											Voir
										</Link>
										<Link
											href={`/search-ads/${searchAd.id}/edit`}
											className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center justify-center gap-2 text-sm"
										>
											<Edit size={16} />
											Modifier
										</Link>
									</div>
								</div>
							))}
						</div>

						{/* Pagination */}
						{result.pagination && result.pagination.totalPages > 1 && (
							<div className="mt-8 flex items-center justify-between">
								<p className="text-sm text-gray-600">
									Page {result.pagination.page} sur {result.pagination.totalPages} ({result.pagination.total} résultats)
								</p>
								<div className="flex gap-2">
									<button
										onClick={() => setPage(p => Math.max(1, p - 1))}
										disabled={page === 1}
										className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
									>
										<ChevronLeft size={20} />
									</button>
									<button
										onClick={() => setPage(p => Math.min(result.pagination!.totalPages, p + 1))}
										disabled={page === result.pagination.totalPages}
										className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
									>
										<ChevronRight size={20} />
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
