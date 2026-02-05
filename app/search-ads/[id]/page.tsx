'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Search, MapPin, Euro, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import { getConfig } from '@/lib/storage';
import { getSearchAd } from '@/lib/api';
import { ApiConfig, SearchAdDetail } from '@/lib/types';

export default function SearchAdDetailPage() {
	const params = useParams();
	const searchAdId = params.id as string;
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [searchAd, setSearchAd] = useState<SearchAdDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setConfig(getConfig());
	}, []);

	useEffect(() => {
		if (!config) return;

		const fetchSearchAd = async () => {
			setLoading(true);
			setError(null);

			const result = await getSearchAd(config, searchAdId);

			if (result.success && result.searchAd) {
				setSearchAd(result.searchAd);
			} else {
				setError(result.error || 'Recherche non trouvée');
			}

			setLoading(false);
		};

		fetchSearchAd();
	}, [config, searchAdId]);

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

	const propertyTypeLabels: Record<string, string> = {
		house: 'Maison',
		apartment: 'Appartement',
		land: 'Terrain',
		building: 'Immeuble',
		commercial: 'Commercial',
	};

	const projectTypeLabels: Record<string, string> = {
		primary: 'Résidence principale',
		secondary: 'Résidence secondaire',
		investment: 'Investissement',
	};

	const financingTypeLabels: Record<string, string> = {
		loan: 'Crédit',
		cash: 'Comptant',
		mixed: 'Mixte',
	};

	const desiredStateLabels: Record<string, string> = {
		new: 'Neuf',
		good: 'Bon état',
		refresh: 'À rafraîchir',
		renovate: 'À rénover',
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="animate-spin text-indigo-600" size={32} />
			</div>
		);
	}

	if (error || !searchAd) {
		return (
			<div>
				<Link href="/search-ads" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-4">
					<ArrowLeft size={18} />
					Retour aux recherches
				</Link>
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{error || 'Recherche non trouvée'}
				</div>
			</div>
		);
	}

	return (
		<div>
			<Link href="/search-ads" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-4">
				<ArrowLeft size={18} />
				Retour aux recherches
			</Link>

			{/* Header */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<div className="flex items-center gap-2 mb-3">
					{searchAd.propertyTypes?.map((type) => (
						<span key={type} className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
							{propertyTypeLabels[type] || type}
						</span>
					))}
					{searchAd.projectType && (
						<span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
							{projectTypeLabels[searchAd.projectType] || searchAd.projectType}
						</span>
					)}
				</div>

				<h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
					<Search size={24} />
					{searchAd.title}
				</h1>

				<div className="flex items-center gap-4 mt-3 text-gray-500">
					{searchAd.location?.cities?.length > 0 && (
						<span className="flex items-center gap-1">
							<MapPin size={16} />
							{searchAd.location.cities.join(', ')}
							{searchAd.location.postalCodes?.length > 0 && (
								<span className="text-gray-400">({searchAd.location.postalCodes.join(', ')})</span>
							)}
						</span>
					)}
				</div>

				{searchAd.author && (
					<div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
						<span className="text-sm text-gray-500">
							Par <strong>{searchAd.author.firstName} {searchAd.author.lastName}</strong>{' '}
							({searchAd.author.userType === 'agent' ? 'Agent' : 'Apporteur'})
						</span>
						<div className="flex items-center gap-4">
							<span className="text-xs text-gray-400">
								Créé le {new Date(searchAd.createdAt).toLocaleDateString('fr-FR')}
								{searchAd.updatedAt && ` · Modifié le ${new Date(searchAd.updatedAt).toLocaleDateString('fr-FR')}`}
							</span>
							<Link
								href={`/search-ads/${searchAdId}/edit`}
								className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-1.5 text-sm"
							>
								<Edit size={14} />
								Modifier
							</Link>
						</div>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				{/* Budget */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<Euro size={20} />
						Budget
					</h2>
					<div className="space-y-3">
						{searchAd.budget?.max > 0 && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Budget maximum</span>
								<span className="font-bold text-indigo-600">{formatPrice(searchAd.budget.max)}</span>
							</div>
						)}
						{searchAd.budget?.ideal > 0 && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Budget idéal</span>
								<span className="font-medium">{formatPrice(searchAd.budget.ideal)}</span>
							</div>
						)}
						{searchAd.budget?.financingType && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Financement</span>
								<span className="text-sm">{financingTypeLabels[searchAd.budget.financingType] || searchAd.budget.financingType}</span>
							</div>
						)}
						{searchAd.budget?.hasBankApproval !== undefined && (
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Accord bancaire</span>
								{searchAd.budget.hasBankApproval ? (
									<span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={14} /> Oui</span>
								) : (
									<span className="flex items-center gap-1 text-gray-400 text-sm"><XCircle size={14} /> Non</span>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Critères */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Critères</h2>
					<div className="space-y-3">
						{searchAd.minSurface > 0 && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Surface min</span>
								<span className="text-sm">{searchAd.minSurface} m²</span>
							</div>
						)}
						{searchAd.minRooms > 0 && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Pièces min</span>
								<span className="text-sm">{searchAd.minRooms}</span>
							</div>
						)}
						{searchAd.minBedrooms > 0 && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Chambres min</span>
								<span className="text-sm">{searchAd.minBedrooms}</span>
							</div>
						)}
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Extérieur</span>
							{searchAd.hasExterior ? (
								<span className="text-green-600 text-sm">Souhaité</span>
							) : (
								<span className="text-gray-400 text-sm">Non requis</span>
							)}
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Parking</span>
							{searchAd.hasParking ? (
								<span className="text-green-600 text-sm">Souhaité</span>
							) : (
								<span className="text-gray-400 text-sm">Non requis</span>
							)}
						</div>
						{searchAd.acceptedFloors && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Étages acceptés</span>
								<span className="text-sm">{searchAd.acceptedFloors}</span>
							</div>
						)}
						{searchAd.desiredState?.length > 0 && (
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">État souhaité</span>
								<span className="text-sm">{searchAd.desiredState.map((s) => desiredStateLabels[s] || s).join(', ')}</span>
							</div>
						)}
					</div>
				</div>

				{/* Priorités */}
				{searchAd.priorities && (
					<div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<AlertCircle size={20} />
							Priorités
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{searchAd.priorities.mustHaves?.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-green-700 mb-2">Indispensable</h3>
									<div className="flex flex-wrap gap-2">
										{searchAd.priorities.mustHaves.map((item) => (
											<span key={item} className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
												{item}
											</span>
										))}
									</div>
								</div>
							)}
							{searchAd.priorities.niceToHaves?.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-blue-700 mb-2">Appréciable</h3>
									<div className="flex flex-wrap gap-2">
										{searchAd.priorities.niceToHaves.map((item) => (
											<span key={item} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
												{item}
											</span>
										))}
									</div>
								</div>
							)}
							{searchAd.priorities.dealBreakers?.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-red-700 mb-2">Rédhibitoire</h3>
									<div className="flex flex-wrap gap-2">
										{searchAd.priorities.dealBreakers.map((item) => (
											<span key={item} className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
												{item}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Description */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
				<div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: searchAd.description }} />
			</div>

			{/* Raw JSON */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Réponse API brute</h2>
				<pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
					<code>{JSON.stringify(searchAd, null, 2)}</code>
				</pre>
			</div>
		</div>
	);
}
