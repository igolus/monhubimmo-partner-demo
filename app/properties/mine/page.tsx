'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, Loader2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { getConfig } from '@/lib/storage';
import { listPartnerProperties } from '@/lib/api';
import { ApiConfig, PartnerPropertySummary, PartnerPropertyFilters } from '@/lib/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	draft: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800' },
	active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
	sold: { label: 'Vendu', color: 'bg-blue-100 text-blue-800' },
	rented: { label: 'Loué', color: 'bg-blue-100 text-blue-800' },
	archived: { label: 'Archivé', color: 'bg-gray-100 text-gray-800' },
};

export default function PartnerPropertiesPage() {
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [properties, setProperties] = useState<PartnerPropertySummary[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [filters, setFilters] = useState<PartnerPropertyFilters>({});

	useEffect(() => {
		setConfig(getConfig());
	}, []);

	const fetchProperties = useCallback(async () => {
		if (!config) return;

		setLoading(true);
		setError(null);

		const result = await listPartnerProperties(config, filters, page, 20);

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

	const handleFilterChange = (key: keyof PartnerPropertyFilters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	if (!config) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
				<p className="text-yellow-800">
					Configurez votre clé API dans la{' '}
					<Link href="/config" className="text-indigo-600 hover:underline">
						page de configuration
					</Link>{' '}
					pour accéder aux biens.
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
						Mes biens (API)
					</h1>
					<p className="text-gray-500 mt-1">
						{total} bien{total > 1 ? 's' : ''} créé{total > 1 ? 's' : ''} via l&apos;API
					</p>
				</div>
				<Link
					href="/properties/create"
					className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
				>
					+ Créer un bien
				</Link>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow-md p-4 mb-6">
				<div className="flex flex-wrap gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
						<select
							value={filters.status || ''}
							onChange={(e) => handleFilterChange('status', e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md text-sm"
						>
							<option value="">Tous les statuts</option>
							<option value="draft">Brouillon</option>
							<option value="active">Actif</option>
							<option value="sold">Vendu</option>
							<option value="rented">Loué</option>
							<option value="archived">Archivé</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">ID Externe</label>
						<input
							type="text"
							value={filters.externalId || ''}
							onChange={(e) => handleFilterChange('externalId', e.target.value)}
							placeholder="Votre référence"
							className="px-3 py-2 border border-gray-300 rounded-md text-sm"
						/>
					</div>
				</div>
			</div>

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

			{/* Empty state */}
			{!loading && properties.length === 0 && (
				<div className="bg-white rounded-lg shadow-md p-8 text-center">
					<Building2 className="mx-auto text-gray-400" size={48} />
					<h3 className="mt-4 text-lg font-medium text-gray-700">Aucun bien trouvé</h3>
					<p className="mt-2 text-gray-500">
						Créez votre premier bien via l&apos;API ou{' '}
						<Link href="/properties/create" className="text-indigo-600 hover:underline">
							depuis cette interface
						</Link>
						.
					</p>
				</div>
			)}

			{/* Properties Grid */}
			{!loading && properties.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
					{properties.map((property) => (
						<div
							key={property.id}
							className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
						>
							<div className="relative">
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
								{/* Status badge */}
								<span className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${STATUS_LABELS[property.status]?.color || 'bg-gray-100 text-gray-800'}`}>
									{STATUS_LABELS[property.status]?.label || property.status}
								</span>
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
								{property.externalId && (
									<p className="text-xs text-gray-400 mt-1 font-mono">
										Ref: {property.externalId}
									</p>
								)}
								<div className="flex items-center justify-between mt-3">
									<span className="text-lg font-bold text-indigo-600">
										{formatPrice(property.price)}
									</span>
									<span className="text-sm text-gray-500">
										{property.surface} m²{property.rooms ? ` · ${property.rooms} p.` : ''}
									</span>
								</div>
								{property.owner && (
									<p className="text-xs text-gray-400 mt-2">
										{property.owner.firstName} {property.owner.lastName}
									</p>
								)}
								{/* Action buttons */}
								<div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
									<Link
										href={`/properties/${property.id}`}
										className="flex-1 text-center px-3 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
									>
										Voir
									</Link>
									<Link
										href={`/properties/${property.id}/edit`}
										className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
									>
										<Pencil size={14} />
										Modifier
									</Link>
								</div>
							</div>
						</div>
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
