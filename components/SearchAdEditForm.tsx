'use client';

import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { updateSearchAd, UpdateSearchAdResult } from '@/lib/api';
import { ApiConfig, UpdateSearchAdRequest, UpdatedSearchAd, PartnerSearchAdSummary } from '@/lib/types';
import ErrorDisplay from './ErrorDisplay';

interface SearchAdEditFormProps {
	config: ApiConfig;
	searchAd: PartnerSearchAdSummary;
	onSuccess: (searchAd: UpdatedSearchAd) => void;
	onCancel: () => void;
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

const STATUS_OPTIONS = [
	{ value: 'active', label: 'Active' },
	{ value: 'paused', label: 'En pause' },
	{ value: 'archived', label: 'Archivée' },
] as const;

export default function SearchAdEditForm({ config, searchAd, onSuccess, onCancel }: SearchAdEditFormProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<UpdateSearchAdResult | null>(null);

	// Form state - pre-filled with existing data
	const [formData, setFormData] = useState<Partial<UpdateSearchAdRequest>>({
		externalId: searchAd.externalId || '',
		title: searchAd.title,
		description: searchAd.description,
		propertyTypes: searchAd.propertyTypes as UpdateSearchAdRequest['propertyTypes'],
		propertyState: searchAd.propertyState as UpdateSearchAdRequest['propertyState'],
		projectType: searchAd.projectType as UpdateSearchAdRequest['projectType'],
		location: {
			cities: searchAd.location?.cities || [],
			postalCodes: searchAd.location?.postalCodes || [],
			maxDistance: searchAd.location?.maxDistance,
			openToOtherAreas: searchAd.location?.openToOtherAreas || false,
		},
		budget: {
			max: searchAd.budget?.max,
			ideal: searchAd.budget?.ideal,
			financingType: searchAd.budget?.financingType as 'loan' | 'cash' | 'pending',
			isSaleInProgress: searchAd.budget?.isSaleInProgress,
			hasBankApproval: searchAd.budget?.hasBankApproval,
		},
		minRooms: searchAd.minRooms,
		minBedrooms: searchAd.minBedrooms,
		minSurface: searchAd.minSurface,
		hasExterior: searchAd.hasExterior,
		hasParking: searchAd.hasParking,
		desiredState: searchAd.desiredState as UpdateSearchAdRequest['desiredState'],
		priorities: {
			mustHaves: searchAd.priorities?.mustHaves || [],
			niceToHaves: searchAd.priorities?.niceToHaves || [],
			dealBreakers: searchAd.priorities?.dealBreakers || [],
		},
		status: searchAd.status as 'active' | 'paused' | 'archived',
	});

	// City input state
	const [cityInput, setCityInput] = useState('');
	const [postalCodeInput, setPostalCodeInput] = useState('');

	// Priority inputs
	const [mustHaveInput, setMustHaveInput] = useState('');
	const [niceToHaveInput, setNiceToHaveInput] = useState('');
	const [dealBreakerInput, setDealBreakerInput] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Only send changed fields
		const request: UpdateSearchAdRequest = {};

		if (formData.externalId !== (searchAd.externalId || '')) {
			request.externalId = formData.externalId || undefined;
		}
		if (formData.title !== searchAd.title) request.title = formData.title;
		if (formData.description !== searchAd.description) request.description = formData.description;
		if (JSON.stringify(formData.propertyTypes) !== JSON.stringify(searchAd.propertyTypes)) {
			request.propertyTypes = formData.propertyTypes;
		}
		if (JSON.stringify(formData.propertyState) !== JSON.stringify(searchAd.propertyState)) {
			request.propertyState = formData.propertyState;
		}
		if (formData.projectType !== searchAd.projectType) request.projectType = formData.projectType;
		if (JSON.stringify(formData.location) !== JSON.stringify(searchAd.location)) {
			request.location = formData.location;
		}
		if (JSON.stringify(formData.budget) !== JSON.stringify(searchAd.budget)) {
			request.budget = formData.budget;
		}
		if (formData.minRooms !== searchAd.minRooms) request.minRooms = formData.minRooms;
		if (formData.minBedrooms !== searchAd.minBedrooms) request.minBedrooms = formData.minBedrooms;
		if (formData.minSurface !== searchAd.minSurface) request.minSurface = formData.minSurface;
		if (formData.hasExterior !== searchAd.hasExterior) request.hasExterior = formData.hasExterior;
		if (formData.hasParking !== searchAd.hasParking) request.hasParking = formData.hasParking;
		if (JSON.stringify(formData.desiredState) !== JSON.stringify(searchAd.desiredState)) {
			request.desiredState = formData.desiredState;
		}
		if (JSON.stringify(formData.priorities) !== JSON.stringify(searchAd.priorities)) {
			request.priorities = formData.priorities;
		}
		if (formData.status !== searchAd.status) request.status = formData.status;

		// Check if there's anything to update
		if (Object.keys(request).length === 0) {
			setError({ success: false, error: 'Aucune modification détectée' });
			setLoading(false);
			return;
		}

		const result = await updateSearchAd(config, searchAd.id, request);

		if (result.success && result.searchAd) {
			onSuccess(result.searchAd);
		} else {
			setError(result);
		}

		setLoading(false);
	};

	const togglePropertyType = (type: string) => {
		const current = formData.propertyTypes || [];
		const typedType = type as 'house' | 'apartment' | 'land' | 'building' | 'commercial';
		if (current.includes(typedType)) {
			setFormData({
				...formData,
				propertyTypes: current.filter(t => t !== type) as ('house' | 'apartment' | 'land' | 'building' | 'commercial')[],
			});
		} else {
			setFormData({
				...formData,
				propertyTypes: [...current, typedType],
			});
		}
	};

	const togglePropertyState = (state: string) => {
		const current = formData.propertyState || [];
		const typedState = state as 'new' | 'old';
		if (current.includes(typedState)) {
			setFormData({
				...formData,
				propertyState: current.filter(s => s !== state) as ('new' | 'old')[],
			});
		} else {
			setFormData({
				...formData,
				propertyState: [...current, typedState],
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
						...formData.location,
						postalCodes: [...postalCodes, postalCodeInput.trim()],
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
				...formData.location,
				postalCodes: (formData.location?.postalCodes || []).filter(c => c !== code),
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

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{error && <ErrorDisplay error={error.error || 'Erreur inconnue'} message={error.message} details={error.details} />}

			{/* Status */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Statut</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Statut de la recherche</label>
						<select
							value={formData.status || 'active'}
							onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'paused' | 'archived' })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							{STATUS_OPTIONS.map(({ value, label }) => (
								<option key={value} value={value}>{label}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">ID Externe</label>
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
						<label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
						<input
							type="text"
							value={formData.title || ''}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							minLength={10}
							maxLength={200}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea
							value={formData.description || ''}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							rows={4}
							minLength={10}
							maxLength={2000}
						/>
					</div>
				</div>
			</div>

			{/* Property Types */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Types de bien</h2>
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
							onChange={(e) => setFormData({ ...formData, projectType: e.target.value as UpdateSearchAdRequest['projectType'] || undefined })}
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
						<label className="block text-sm font-medium text-gray-700 mb-1">Villes recherchées</label>
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
										...formData.location,
										maxDistance: Number(e.target.value) || undefined,
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
									...formData.location,
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
						<label className="block text-sm font-medium text-gray-700 mb-2">Critères indispensables</label>
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
						<label className="block text-sm font-medium text-gray-700 mb-2">Critères secondaires</label>
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
						<label className="block text-sm font-medium text-gray-700 mb-2">Points de blocage</label>
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
			<div className="flex justify-end gap-4">
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
				>
					Annuler
				</button>
				<button
					type="submit"
					disabled={loading}
					className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{loading && <Loader2 className="animate-spin" size={20} />}
					{loading ? 'Mise à jour...' : 'Mettre à jour'}
				</button>
			</div>
		</form>
	);
}
