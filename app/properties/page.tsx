'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, Loader2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { getConfig } from '@/lib/storage';
import { listProperties } from '@/lib/api';
import { ApiConfig, PropertySummary, PropertyFilters } from '@/lib/types';

export default function PropertiesPage() {
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [properties, setProperties] = useState<PropertySummary[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [filters, setFilters] = useState<PropertyFilters>({});
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		setConfig(getConfig());
	}, []);

	const fetchProperties = useCallback(async () => {
		if (!config) return;

		setLoading(true);
		setError(null);

		const result = await listProperties(config, filters, page, 20);

		if (result.success) {
			setProperties(result.properties || []);
			setTotalPages(result.pagination?.totalPages || 1);
			setTotal(result.pagination?.total || 0);
		} else {
			setError(result.error || 'Erreur lors du chargement');
		}

		setLoading(false);
	}, [config, filters, page]);

	useEffect(() => {
		if (config) {
			fetchProperties();
		}
	}, [config, fetchProperties]);

	const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	const clearFilters = () => {
		setFilters({});
		setPage(1);
	};

	const hasActiveFilters = Object.values(filters).some(Boolean);

	if (!config) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
				<p className="text-yellow-800">
					Configurez votre clé API dans la{' '}
					<Link href="/config" className="text-indigo-600 hover:underline">
						page de configuration
					</Link>{' '}
					pour accéder aux biens immobiliers.
				</p>
			</div>
		);
	}

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
		if (fallback) fallback.classList.remove('hidden');
		e.currentTarget.style.display = 'none';
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
						<Building2 size={28} />
						Biens immobiliers
					</h1>
					<p className="text-gray-500 mt-1">
						{total} bien{total > 1 ? 's' : ''} actif{total > 1 ? 's' : ''} sur la plateforme
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
								<option value="Appartement">Appartement</option>
								<option value="Maison">Maison</option>
								<option value="Terrain">Terrain</option>
								<option value="Local commercial">Local commercial</option>
								<option value="Bureaux">Bureaux</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Transaction</label>
							<select
								value={filters.transactionType || ''}
								onChange={(e) => handleFilterChange('transactionType', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							>
								<option value="">Toutes</option>
								<option value="Vente">Vente</option>
								<option value="Location">Location</option>
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
							<label className="block text-sm font-medium text-gray-700 mb-1">Prix min</label>
							<input
								type="number"
								value={filters.minPrice || ''}
								onChange={(e) => handleFilterChange('minPrice', e.target.value)}
								placeholder="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Prix max</label>
							<input
								type="number"
								value={filters.maxPrice || ''}
								onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
								placeholder="1 000 000"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Surface min (m²)</label>
							<input
								type="number"
								value={filters.minSurface || ''}
								onChange={(e) => handleFilterChange('minSurface', e.target.value)}
								placeholder="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Pièces min</label>
							<input
								type="number"
								value={filters.rooms || ''}
								onChange={(e) => handleFilterChange('rooms', e.target.value)}
								placeholder="1"
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

			{/* Property Cards */}
			{!loading && properties.length === 0 && (
				<div className="bg-white rounded-lg shadow-md p-8 text-center">
					<Building2 className="mx-auto text-gray-400" size={48} />
					<h3 className="mt-4 text-lg font-medium text-gray-700">Aucun bien trouvé</h3>
					<p className="mt-2 text-gray-500">Essayez de modifier vos filtres.</p>
				</div>
			)}

			{!loading && properties.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
					{properties.map((property) => (
						<Link
							key={property.id}
							href={`/properties/${property.id}`}
							className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
						>
							{property.mainImage && (
								<img
									src={property.mainImage}
									alt={property.title}
									className="w-full h-48 object-cover"
									onError={handleImageError}
								/>
							)}
							<div className={`w-full h-48 bg-gray-200 items-center justify-center${property.mainImage ? ' hidden' : ' flex'}`}>
								<Building2 className="text-gray-400" size={48} />
							</div>
							<div className="p-4">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
										{property.propertyType}
									</span>
									<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
										{property.transactionType}
									</span>
								</div>
								<h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
								<p className="text-sm text-gray-500 mt-1">
									{property.city} ({property.postalCode})
								</p>
								<div className="flex items-center justify-between mt-3">
									<span className="text-lg font-bold text-indigo-600">
										{formatPrice(property.price)}
									</span>
									<span className="text-sm text-gray-500">
										{property.surface} m² · {property.rooms} p.
									</span>
								</div>
								{property.owner && (
									<p className="text-xs text-gray-400 mt-2">
										{property.owner.firstName} {property.owner.lastName}
									</p>
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
