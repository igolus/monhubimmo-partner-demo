'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Loader2, ChevronLeft, ChevronRight, X, MapPin, Euro } from 'lucide-react';
import { getConfig } from '@/lib/storage';
import { listSearchAds } from '@/lib/api';
import { ApiConfig, SearchAdSummary, SearchAdFilters } from '@/lib/types';

export default function SearchAdsPage() {
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [searchAds, setSearchAds] = useState<SearchAdSummary[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [filters, setFilters] = useState<SearchAdFilters>({});
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		setConfig(getConfig());
	}, []);

	const fetchSearchAds = useCallback(async () => {
		if (!config) return;

		setLoading(true);
		setError(null);

		const result = await listSearchAds(config, filters, page, 20);

		if (result.success) {
			setSearchAds(result.searchAds || []);
			setTotalPages(result.pagination?.totalPages || 1);
			setTotal(result.pagination?.total || 0);
		} else {
			setError(result.error || 'Erreur lors du chargement');
		}

		setLoading(false);
	}, [config, filters, page]);

	useEffect(() => {
		if (config) {
			fetchSearchAds();
		}
	}, [config, fetchSearchAds]);

	const handleFilterChange = (key: keyof SearchAdFilters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	const clearFilters = () => {
		setFilters({});
		setPage(1);
	};

	const hasActiveFilters = Object.values(filters).some(Boolean);

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

	const propertyTypeLabels: Record<string, string> = {
		house: 'Maison',
		apartment: 'Appartement',
		land: 'Terrain',
		building: 'Immeuble',
		commercial: 'Commercial',
	};

	if (!config) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
				<p className="text-yellow-800">
					Configurez votre clé API dans la{' '}
					<Link href="/config" className="text-indigo-600 hover:underline">
						page de configuration
					</Link>{' '}
					pour accéder aux recherches.
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
						<Search size={28} />
						Recherches actives
					</h1>
					<p className="text-gray-500 mt-1">
						{total} recherche{total > 1 ? 's' : ''} active{total > 1 ? 's' : ''} sur la plateforme
					</p>
				</div>
				<button
					onClick={() => setShowFilters(!showFilters)}
					className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
						showFilters || hasActiveFilters
							? 'bg-indigo-600 text-white'
							: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
					}`}
				>
					<Search size={18} />
					Filtres
					{hasActiveFilters && (
						<span className="bg-white text-indigo-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
							{Object.values(filters).filter(Boolean).length}
						</span>
					)}
				</button>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-semibold text-gray-800">Filtres</h3>
						{hasActiveFilters && (
							<button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
								<X size={14} />
								Réinitialiser
							</button>
						)}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
							<input
								type="text"
								value={filters.city || ''}
								onChange={(e) => handleFilterChange('city', e.target.value)}
								placeholder="Paris, Lyon..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
							<select
								value={filters.propertyType || ''}
								onChange={(e) => handleFilterChange('propertyType', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							>
								<option value="">Tous</option>
								<option value="apartment">Appartement</option>
								<option value="house">Maison</option>
								<option value="land">Terrain</option>
								<option value="building">Immeuble</option>
								<option value="commercial">Commercial</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Type d&apos;auteur</label>
							<select
								value={filters.authorType || ''}
								onChange={(e) => handleFilterChange('authorType', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							>
								<option value="">Tous</option>
								<option value="agent">Agent</option>
								<option value="apporteur">Apporteur</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
							<input
								type="text"
								value={filters.search || ''}
								onChange={(e) => handleFilterChange('search', e.target.value)}
								placeholder="Mots-clés..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Budget min</label>
							<input
								type="number"
								value={filters.minBudget || ''}
								onChange={(e) => handleFilterChange('minBudget', e.target.value)}
								placeholder="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Budget max</label>
							<input
								type="number"
								value={filters.maxBudget || ''}
								onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
								placeholder="500 000"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
					{error}
				</div>
			)}

			{/* Loading */}
			{loading && (
				<div className="flex justify-center items-center h-32">
					<Loader2 className="animate-spin text-indigo-600" size={32} />
				</div>
			)}

			{/* Search Ad Cards */}
			{!loading && searchAds.length === 0 && (
				<div className="bg-white rounded-lg shadow-md p-8 text-center">
					<Search className="mx-auto text-gray-400" size={48} />
					<h3 className="mt-4 text-lg font-medium text-gray-700">Aucune recherche trouvée</h3>
					<p className="mt-2 text-gray-500">Essayez de modifier vos filtres.</p>
				</div>
			)}

			{!loading && searchAds.length > 0 && (
				<div className="space-y-4 mb-6">
					{searchAds.map((ad) => (
						<Link
							key={ad.id}
							href={`/search-ads/${ad.id}`}
							className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										{ad.propertyTypes?.map((type) => (
											<span
												key={type}
												className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
											>
												{propertyTypeLabels[type] || type}
											</span>
										))}
										{ad.author && (
											<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
												{ad.author.userType === 'agent' ? 'Agent' : 'Apporteur'}
											</span>
										)}
									</div>
									<h3 className="font-semibold text-gray-900">{ad.title}</h3>
									<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
										{ad.location?.cities?.length > 0 && (
											<span className="flex items-center gap-1">
												<MapPin size={14} />
												{ad.location.cities.join(', ')}
											</span>
										)}
										{ad.budget?.max > 0 && (
											<span className="flex items-center gap-1">
												<Euro size={14} />
												Budget max : {formatPrice(ad.budget.max)}
											</span>
										)}
									</div>
									<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
										{ad.minSurface > 0 && <span>{ad.minSurface} m² min</span>}
										{ad.minRooms > 0 && <span>{ad.minRooms} pièces min</span>}
										{ad.minBedrooms > 0 && <span>{ad.minBedrooms} chambres min</span>}
									</div>
								</div>
								{ad.author && (
									<div className="text-right text-sm text-gray-400 ml-4">
										<div>{ad.author.firstName} {ad.author.lastName}</div>
										<div className="text-xs mt-1">
											{new Date(ad.createdAt).toLocaleDateString('fr-FR')}
										</div>
									</div>
								)}
							</div>
						</Link>
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-4">
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
						className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
					>
						<ChevronLeft size={16} />
						Précédent
					</button>
					<span className="text-sm text-gray-600">
						Page {page} / {totalPages}
					</span>
					<button
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
						className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
					>
						Suivant
						<ChevronRight size={16} />
					</button>
				</div>
			)}
		</div>
	);
}
