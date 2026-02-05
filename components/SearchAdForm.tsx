'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Plus, X } from 'lucide-react';
import { createSearchAd, listUsers, CreateSearchAdResult } from '@/lib/api';
import { ApiConfig, CreateSearchAdRequest, CreatedSearchAd, CreatedUser } from '@/lib/types';
import ErrorDisplay from './ErrorDisplay';

interface SearchAdFormProps {
	config: ApiConfig;
	onSuccess: (searchAd: CreatedSearchAd) => void;
}

const PROPERTY_TYPES = [
	{ value: 'house', label: 'Maison' },
	{ value: 'apartment', label: 'Appartement' },
	{ value: 'land', label: 'Terrain' },
	{ value: 'building', label: 'Immeuble' },
	{ value: 'commercial', label: 'Local commercial' },
] as const;

const PROPERTY_STATES = [
	{ value: 'new', label: 'Neuf' },
	{ value: 'old', label: 'Ancien' },
] as const;

const PROJECT_TYPES = [
	{ value: 'primary', label: 'Résidence principale' },
	{ value: 'secondary', label: 'Résidence secondaire' },
	{ value: 'investment', label: 'Investissement' },
] as const;

const FINANCING_TYPES = [
	{ value: 'loan', label: 'Crédit immobilier' },
	{ value: 'cash', label: 'Comptant' },
	{ value: 'pending', label: 'En attente' },
] as const;

const DESIRED_STATES = [
	{ value: 'new', label: 'Neuf' },
	{ value: 'good', label: 'Bon état' },
	{ value: 'refresh', label: 'À rafraîchir' },
	{ value: 'renovate', label: 'À rénover' },
] as const;

export default function SearchAdForm({ config, onSuccess }: SearchAdFormProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<CreateSearchAdResult | null>(null);
	const [users, setUsers] = useState<CreatedUser[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(true);

	// Form state with explicit location cities to avoid TypeScript issues
	const [formData, setFormData] = useState<{
		userId?: string;
		externalId?: string;
		title?: string;
		description?: string;
		propertyTypes?: CreateSearchAdRequest['propertyTypes'];
		propertyState?: CreateSearchAdRequest['propertyState'];
		projectType?: CreateSearchAdRequest['projectType'];
		location?: {
			cities: string[];
			postalCodes?: string[];
			maxDistance?: number;
			openToOtherAreas?: boolean;
		};
		budget?: CreateSearchAdRequest['budget'];
		minRooms?: number;
		minBedrooms?: number;
		minSurface?: number;
		hasExterior?: boolean;
		hasParking?: boolean;
		acceptedFloors?: string;
		desiredState?: CreateSearchAdRequest['desiredState'];
		priorities?: CreateSearchAdRequest['priorities'];
	}>({
		propertyTypes: [],
		propertyState: [],
		desiredState: [],
		location: {
			cities: [],
			postalCodes: [],
			openToOtherAreas: false,
		},
		budget: {},
		priorities: {
			mustHaves: [],
			niceToHaves: [],
			dealBreakers: [],
		},
		hasExterior: false,
		hasParking: false,
	});

	// City input state
	const [cityInput, setCityInput] = useState('');
	const [postalCodeInput, setPostalCodeInput] = useState('');

	// Priority inputs
	const [mustHaveInput, setMustHaveInput] = useState('');
	const [niceToHaveInput, setNiceToHaveInput] = useState('');
	const [dealBreakerInput, setDealBreakerInput] = useState('');

	useEffect(() => {
		loadUsers();
	}, [config]);

	const loadUsers = async () => {
		setLoadingUsers(true);
		const result = await listUsers(config, 1, 100);
		if (result.success && result.users) {
			setUsers(result.users);
		}
		setLoadingUsers(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Build request
		const request: CreateSearchAdRequest = {
			userId: formData.userId!,
			title: formData.title!,
			description: formData.description!,
			propertyTypes: formData.propertyTypes as CreateSearchAdRequest['propertyTypes'],
			location: {
				cities: formData.location?.cities || [],
				...(formData.location?.postalCodes?.length && { postalCodes: formData.location.postalCodes }),
				...(formData.location?.maxDistance && { maxDistance: formData.location.maxDistance }),
				...(formData.location?.openToOtherAreas !== undefined && { openToOtherAreas: formData.location.openToOtherAreas }),
			},
			...(formData.externalId && { externalId: formData.externalId }),
			...(formData.propertyState?.length && { propertyState: formData.propertyState as CreateSearchAdRequest['propertyState'] }),
			...(formData.projectType && { projectType: formData.projectType }),
			...(formData.budget && Object.keys(formData.budget).length > 0 && { budget: formData.budget }),
			...(formData.minRooms && { minRooms: formData.minRooms }),
			...(formData.minBedrooms !== undefined && { minBedrooms: formData.minBedrooms }),
			...(formData.minSurface && { minSurface: formData.minSurface }),
			hasExterior: formData.hasExterior,
			hasParking: formData.hasParking,
			...(formData.acceptedFloors && { acceptedFloors: formData.acceptedFloors }),
			...(formData.desiredState?.length && { desiredState: formData.desiredState as CreateSearchAdRequest['desiredState'] }),
			...(formData.priorities && (
				formData.priorities.mustHaves?.length ||
				formData.priorities.niceToHaves?.length ||
				formData.priorities.dealBreakers?.length
			) && { priorities: formData.priorities }),
		};

		const result = await createSearchAd(config, request);

		if (result.success && result.searchAd) {
			onSuccess(result.searchAd);
		} else {
			setError(result);
		}

		setLoading(false);
	};

	const togglePropertyType = (type: string) => {
		const current = formData.propertyTypes || [];
		if (current.includes(type as CreateSearchAdRequest['propertyTypes'][number])) {
			setFormData({
				...formData,
				propertyTypes: current.filter(t => t !== type) as CreateSearchAdRequest['propertyTypes'],
			});
		} else {
			setFormData({
				...formData,
				propertyTypes: [...current, type] as CreateSearchAdRequest['propertyTypes'],
			});
		}
	};

	const togglePropertyState = (state: string) => {
		const current = formData.propertyState || [];
		if (current.includes(state as 'new' | 'old')) {
			setFormData({
				...formData,
				propertyState: current.filter(s => s !== state) as ('new' | 'old')[],
			});
		} else {
			setFormData({
				...formData,
				propertyState: [...current, state] as ('new' | 'old')[],
			});
		}
	};

	const toggleDesiredState = (state: string) => {
		const current = formData.desiredState || [];
		const typedState = state as 'new' | 'good' | 'refresh' | 'renovate';
		if (current.includes(typedState)) {
			setFormData({
				...formData,
				desiredState: current.filter(s => s !== state) as ('new' | 'good' | 'refresh' | 'renovate')[],
			});
		} else {
			setFormData({
				...formData,
				desiredState: [...current, typedState],
			});
		}
	};

	const addCity = () => {
		if (cityInput.trim()) {
			const cities = formData.location?.cities || [];
			if (!cities.includes(cityInput.trim())) {
				setFormData({
					...formData,
					location: {
						...formData.location,
						cities: [...cities, cityInput.trim()],
					},
				});
			}
			setCityInput('');
		}
	};

	const removeCity = (city: string) => {
		setFormData({
			...formData,
			location: {
				...formData.location,
				cities: (formData.location?.cities || []).filter(c => c !== city),
			},
		});
	};

	const addPostalCode = () => {
		if (postalCodeInput.trim() && /^[0-9]{5}$/.test(postalCodeInput.trim())) {
			const postalCodes = formData.location?.postalCodes || [];
			if (!postalCodes.includes(postalCodeInput.trim())) {
				setFormData({
					...formData,
					location: {
						cities: formData.location?.cities || [],
						postalCodes: [...postalCodes, postalCodeInput.trim()],
						maxDistance: formData.location?.maxDistance,
						openToOtherAreas: formData.location?.openToOtherAreas,
					},
				});
			}
			setPostalCodeInput('');
		}
	};

	const removePostalCode = (code: string) => {
		setFormData({
			...formData,
			location: {
				cities: formData.location?.cities || [],
				postalCodes: (formData.location?.postalCodes || []).filter(c => c !== code),
				maxDistance: formData.location?.maxDistance,
				openToOtherAreas: formData.location?.openToOtherAreas,
			},
		});
	};

	const addPriority = (type: 'mustHaves' | 'niceToHaves' | 'dealBreakers', value: string, setValue: (v: string) => void) => {
		if (value.trim()) {
			const current = formData.priorities?.[type] || [];
			if (!current.includes(value.trim()) && current.length < 10) {
				setFormData({
					...formData,
					priorities: {
						...formData.priorities,
						[type]: [...current, value.trim()],
					},
				});
			}
			setValue('');
		}
	};

	const removePriority = (type: 'mustHaves' | 'niceToHaves' | 'dealBreakers', value: string) => {
		setFormData({
			...formData,
			priorities: {
				...formData.priorities,
				[type]: (formData.priorities?.[type] || []).filter(v => v !== value),
			},
		});
	};

	if (loadingUsers) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
				<div className="flex items-start gap-3">
					<AlertCircle className="text-yellow-500 mt-0.5" size={24} />
					<div>
						<h3 className="font-medium text-yellow-800">
							Aucun utilisateur disponible
						</h3>
						<p className="mt-1 text-yellow-700">
							Vous devez d&apos;abord créer un utilisateur avant de pouvoir créer une recherche.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{error && <ErrorDisplay error={error.error || 'Erreur inconnue'} message={error.message} details={error.details} />}

			{/* User Selection */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Utilisateur</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Utilisateur <span className="text-red-500">*</span>
						</label>
						<select
							value={formData.userId || ''}
							onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							required
						>
							<option value="">Sélectionner un utilisateur</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.firstName} {user.lastName} ({user.email})
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							ID Externe
						</label>
						<input
							type="text"
							value={formData.externalId || ''}
							onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Votre référence interne"
							maxLength={255}
						/>
					</div>
				</div>
			</div>

			{/* Basic Info */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h2>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Titre <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.title || ''}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Recherche appartement 3 pièces centre-ville"
							minLength={10}
							maxLength={200}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description <span className="text-red-500">*</span>
						</label>
						<textarea
							value={formData.description || ''}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							rows={4}
							placeholder="Décrivez votre recherche en détail..."
							minLength={10}
							maxLength={2000}
							required
						/>
						<p className="text-xs text-gray-500 mt-1">10-2000 caractères</p>
					</div>
				</div>
			</div>

			{/* Property Types */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Types de bien <span className="text-red-500">*</span>
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
					{PROPERTY_TYPES.map(({ value, label }) => (
						<label key={value} className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.propertyTypes?.includes(value) || false}
								onChange={() => togglePropertyType(value)}
								className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
							/>
							<span className="text-sm text-gray-700">{label}</span>
						</label>
					))}
				</div>
			</div>

			{/* Property State & Project Type */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Type de projet</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">État du bien recherché</label>
						<div className="flex gap-4">
							{PROPERTY_STATES.map(({ value, label }) => (
								<label key={value} className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.propertyState?.includes(value) || false}
										onChange={() => togglePropertyState(value)}
										className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
									/>
									<span className="text-sm text-gray-700">{label}</span>
								</label>
							))}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Type de projet</label>
						<select
							value={formData.projectType || ''}
							onChange={(e) => setFormData({ ...formData, projectType: e.target.value as CreateSearchAdRequest['projectType'] || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value="">Non renseigné</option>
							{PROJECT_TYPES.map(({ value, label }) => (
								<option key={value} value={value}>{label}</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Location */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Villes recherchées <span className="text-red-500">*</span>
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={cityInput}
								onChange={(e) => setCityInput(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="Paris, Lyon, Marseille..."
							/>
							<button
								type="button"
								onClick={addCity}
								className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
							>
								<Plus size={20} />
							</button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.location?.cities?.map((city) => (
								<span key={city} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
									{city}
									<button type="button" onClick={() => removeCity(city)} className="hover:text-indigo-600">
										<X size={14} />
									</button>
								</span>
							))}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Codes postaux</label>
							<div className="flex gap-2">
								<input
									type="text"
									value={postalCodeInput}
									onChange={(e) => setPostalCodeInput(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPostalCode())}
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="75001"
									maxLength={5}
								/>
								<button
									type="button"
									onClick={addPostalCode}
									className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
								>
									<Plus size={20} />
								</button>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.location?.postalCodes?.map((code) => (
									<span key={code} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
										{code}
										<button type="button" onClick={() => removePostalCode(code)} className="hover:text-gray-600">
											<X size={14} />
										</button>
									</span>
								))}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Distance max (km)</label>
							<input
								type="number"
								value={formData.location?.maxDistance || ''}
								onChange={(e) => setFormData({
									...formData,
									location: {
										cities: formData.location?.cities || [],
										postalCodes: formData.location?.postalCodes,
										maxDistance: Number(e.target.value) || undefined,
										openToOtherAreas: formData.location?.openToOtherAreas,
									},
								})}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								min={1}
								max={500}
							/>
						</div>
					</div>

					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={formData.location?.openToOtherAreas || false}
							onChange={(e) => setFormData({
								...formData,
								location: {
									cities: formData.location?.cities || [],
									postalCodes: formData.location?.postalCodes,
									maxDistance: formData.location?.maxDistance,
									openToOtherAreas: e.target.checked,
								},
							})}
							className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span className="text-sm text-gray-700">Ouvert à d&apos;autres secteurs</span>
					</label>
				</div>
			</div>

			{/* Budget */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Financement</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Budget maximum (€)</label>
						<input
							type="number"
							value={formData.budget?.max || ''}
							onChange={(e) => setFormData({
								...formData,
								budget: { ...formData.budget, max: Number(e.target.value) || undefined },
							})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1000}
							max={50000000}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Budget idéal (€)</label>
						<input
							type="number"
							value={formData.budget?.ideal || ''}
							onChange={(e) => setFormData({
								...formData,
								budget: { ...formData.budget, ideal: Number(e.target.value) || undefined },
							})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1000}
							max={50000000}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Type de financement</label>
						<select
							value={formData.budget?.financingType || ''}
							onChange={(e) => setFormData({
								...formData,
								budget: { ...formData.budget, financingType: e.target.value as 'loan' | 'cash' | 'pending' || undefined },
							})}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value="">Non renseigné</option>
							{FINANCING_TYPES.map(({ value, label }) => (
								<option key={value} value={value}>{label}</option>
							))}
						</select>
					</div>
				</div>
				<div className="flex gap-6 mt-4">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={formData.budget?.isSaleInProgress || false}
							onChange={(e) => setFormData({
								...formData,
								budget: { ...formData.budget, isSaleInProgress: e.target.checked },
							})}
							className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span className="text-sm text-gray-700">Vente en cascade</span>
					</label>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={formData.budget?.hasBankApproval || false}
							onChange={(e) => setFormData({
								...formData,
								budget: { ...formData.budget, hasBankApproval: e.target.checked },
							})}
							className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span className="text-sm text-gray-700">Accord bancaire obtenu</span>
					</label>
				</div>
			</div>

			{/* Requirements */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Critères</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Pièces min.</label>
						<input
							type="number"
							value={formData.minRooms || ''}
							onChange={(e) => setFormData({ ...formData, minRooms: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1}
							max={50}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Chambres min.</label>
						<input
							type="number"
							value={formData.minBedrooms ?? ''}
							onChange={(e) => setFormData({ ...formData, minBedrooms: e.target.value ? Number(e.target.value) : undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={0}
							max={20}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Surface min. (m²)</label>
						<input
							type="number"
							value={formData.minSurface || ''}
							onChange={(e) => setFormData({ ...formData, minSurface: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1}
							max={10000}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Étages acceptés</label>
						<input
							type="text"
							value={formData.acceptedFloors || ''}
							onChange={(e) => setFormData({ ...formData, acceptedFloors: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Ex: Pas de RDC"
							maxLength={200}
						/>
					</div>
				</div>
				<div className="flex gap-6 mt-4">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={formData.hasExterior || false}
							onChange={(e) => setFormData({ ...formData, hasExterior: e.target.checked })}
							className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span className="text-sm text-gray-700">Extérieur requis</span>
					</label>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={formData.hasParking || false}
							onChange={(e) => setFormData({ ...formData, hasParking: e.target.checked })}
							className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span className="text-sm text-gray-700">Parking requis</span>
					</label>
				</div>

				<div className="mt-6">
					<label className="block text-sm font-medium text-gray-700 mb-3">État souhaité du bien</label>
					<div className="flex flex-wrap gap-4">
						{DESIRED_STATES.map(({ value, label }) => (
							<label key={value} className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={formData.desiredState?.includes(value) || false}
									onChange={() => toggleDesiredState(value)}
									className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								/>
								<span className="text-sm text-gray-700">{label}</span>
							</label>
						))}
					</div>
				</div>
			</div>

			{/* Priorities */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Priorités</h2>
				<div className="space-y-6">
					{/* Must Haves */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Critères indispensables
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={mustHaveInput}
								onChange={(e) => setMustHaveInput(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPriority('mustHaves', mustHaveInput, setMustHaveInput))}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="Ex: Proche métro"
								maxLength={200}
							/>
							<button
								type="button"
								onClick={() => addPriority('mustHaves', mustHaveInput, setMustHaveInput)}
								className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
							>
								<Plus size={20} />
							</button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.priorities?.mustHaves?.map((item) => (
								<span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
									{item}
									<button type="button" onClick={() => removePriority('mustHaves', item)} className="hover:text-green-600">
										<X size={14} />
									</button>
								</span>
							))}
						</div>
					</div>

					{/* Nice to Haves */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Critères secondaires
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={niceToHaveInput}
								onChange={(e) => setNiceToHaveInput(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPriority('niceToHaves', niceToHaveInput, setNiceToHaveInput))}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="Ex: Cave"
								maxLength={200}
							/>
							<button
								type="button"
								onClick={() => addPriority('niceToHaves', niceToHaveInput, setNiceToHaveInput)}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								<Plus size={20} />
							</button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.priorities?.niceToHaves?.map((item) => (
								<span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
									{item}
									<button type="button" onClick={() => removePriority('niceToHaves', item)} className="hover:text-blue-600">
										<X size={14} />
									</button>
								</span>
							))}
						</div>
					</div>

					{/* Deal Breakers */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Points de blocage
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={dealBreakerInput}
								onChange={(e) => setDealBreakerInput(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPriority('dealBreakers', dealBreakerInput, setDealBreakerInput))}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="Ex: Pas de vis-à-vis"
								maxLength={200}
							/>
							<button
								type="button"
								onClick={() => addPriority('dealBreakers', dealBreakerInput, setDealBreakerInput)}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
							>
								<Plus size={20} />
							</button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.priorities?.dealBreakers?.map((item) => (
								<span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
									{item}
									<button type="button" onClick={() => removePriority('dealBreakers', item)} className="hover:text-red-600">
										<X size={14} />
									</button>
								</span>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Submit */}
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={loading || !formData.propertyTypes?.length || !formData.location?.cities?.length}
					className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{loading && <Loader2 className="animate-spin" size={20} />}
					{loading ? 'Création en cours...' : 'Créer la recherche'}
				</button>
			</div>
		</form>
	);
}
