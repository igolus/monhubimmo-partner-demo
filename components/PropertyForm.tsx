'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Plus, X, Image as ImageIcon } from 'lucide-react';
import { createProperty, listUsers, CreatePropertyResult } from '@/lib/api';
import { ApiConfig, CreatePropertyRequest, CreatedProperty, CreatedUser } from '@/lib/types';
import ErrorDisplay from './ErrorDisplay';

interface PropertyFormProps {
	config: ApiConfig;
	onSuccess: (property: CreatedProperty) => void;
}

const PROPERTY_TYPES = ['Appartement', 'Maison', 'Terrain', 'Local commercial', 'Bureaux'] as const;
const TRANSACTION_TYPES = ['Vente', 'Location'] as const;
const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Non soumis au DPE'] as const;
const CONDITIONS = [
	{ value: 'new', label: 'Neuf' },
	{ value: 'good', label: 'Bon état' },
	{ value: 'refresh', label: 'À rafraîchir' },
	{ value: 'renovate', label: 'À rénover' },
] as const;
const ORIENTATIONS = ['Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest'] as const;

export default function PropertyForm({ config, onSuccess }: PropertyFormProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<CreatePropertyResult | null>(null);
	const [users, setUsers] = useState<CreatedUser[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(true);

	// Form state
	const [formData, setFormData] = useState<Partial<CreatePropertyRequest>>({
		transactionType: 'Vente',
		hasParking: false,
		hasGarden: false,
		hasElevator: false,
		hasBalcony: false,
		hasTerrace: false,
		hasGarage: false,
	});

	// Image URLs
	const [mainImageUrl, setMainImageUrl] = useState('');
	const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

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
		const request: CreatePropertyRequest = {
			userId: formData.userId!,
			title: formData.title!,
			description: formData.description!,
			price: formData.price!,
			surface: formData.surface!,
			propertyType: formData.propertyType as CreatePropertyRequest['propertyType'],
			city: formData.city!,
			postalCode: formData.postalCode!,
			sector: formData.sector!,
			transactionType: formData.transactionType as CreatePropertyRequest['transactionType'],
			...(formData.externalId && { externalId: formData.externalId }),
			...(formData.address && { address: formData.address }),
			...(formData.mandateNumber && { mandateNumber: formData.mandateNumber }),
			...(formData.rooms && { rooms: formData.rooms }),
			...(formData.bedrooms && { bedrooms: formData.bedrooms }),
			...(formData.bathrooms && { bathrooms: formData.bathrooms }),
			...(formData.showerRooms && { showerRooms: formData.showerRooms }),
			...(formData.floor !== undefined && { floor: formData.floor }),
			...(formData.totalFloors && { totalFloors: formData.totalFloors }),
			...(formData.yearBuilt && { yearBuilt: formData.yearBuilt }),
			hasParking: formData.hasParking,
			hasGarden: formData.hasGarden,
			hasElevator: formData.hasElevator,
			hasBalcony: formData.hasBalcony,
			hasTerrace: formData.hasTerrace,
			hasGarage: formData.hasGarage,
			...(formData.energyRating && { energyRating: formData.energyRating as CreatePropertyRequest['energyRating'] }),
			...(formData.gasEmissionClass && { gasEmissionClass: formData.gasEmissionClass as CreatePropertyRequest['gasEmissionClass'] }),
			...(formData.condition && { condition: formData.condition as CreatePropertyRequest['condition'] }),
			...(formData.orientation && { orientation: formData.orientation as CreatePropertyRequest['orientation'] }),
			...(formData.heatingType && { heatingType: formData.heatingType }),
			...(formData.annualCondoFees && { annualCondoFees: formData.annualCondoFees }),
			...(mainImageUrl && { mainImage: { url: mainImageUrl } }),
			...(galleryUrls.length > 0 && { galleryImages: galleryUrls.map(url => ({ url })) }),
		};

		const result = await createProperty(config, request);

		if (result.success && result.property) {
			onSuccess(result.property);
		} else {
			setError(result);
		}

		setLoading(false);
	};

	const addGalleryUrl = () => {
		if (galleryUrls.length < 10) {
			setGalleryUrls([...galleryUrls, '']);
		}
	};

	const removeGalleryUrl = (index: number) => {
		setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
	};

	const updateGalleryUrl = (index: number, value: string) => {
		const newUrls = [...galleryUrls];
		newUrls[index] = value;
		setGalleryUrls(newUrls);
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
							Vous devez d&apos;abord créer un utilisateur avant de pouvoir créer un bien.
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
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Propriétaire</h2>
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
			</div>

			{/* Basic Info */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Titre <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.title || ''}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Bel appartement lumineux dans le centre"
							minLength={10}
							maxLength={200}
							required
						/>
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description <span className="text-red-500">*</span>
						</label>
						<textarea
							value={formData.description || ''}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							rows={4}
							placeholder="Description détaillée du bien (HTML autorisé)..."
							minLength={50}
							maxLength={2000}
							required
						/>
						<p className="text-xs text-gray-500 mt-1">50-2000 caractères. Le HTML basique est autorisé.</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Type de bien <span className="text-red-500">*</span>
						</label>
						<select
							value={formData.propertyType || ''}
							onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as CreatePropertyRequest['propertyType'] })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							required
						>
							<option value="">Sélectionner</option>
							{PROPERTY_TYPES.map((type) => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Type de transaction
						</label>
						<select
							value={formData.transactionType || 'Vente'}
							onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as CreatePropertyRequest['transactionType'] })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							{TRANSACTION_TYPES.map((type) => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Prix (€) <span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							value={formData.price || ''}
							onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1000}
							max={50000000}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Surface (m²) <span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							value={formData.surface || ''}
							onChange={(e) => setFormData({ ...formData, surface: Number(e.target.value) })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1}
							max={10000}
							required
						/>
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

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							N° de mandat
						</label>
						<input
							type="text"
							value={formData.mandateNumber || ''}
							onChange={(e) => setFormData({ ...formData, mandateNumber: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							maxLength={50}
						/>
					</div>
				</div>
			</div>

			{/* Location */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Adresse
						</label>
						<input
							type="text"
							value={formData.address || ''}
							onChange={(e) => setFormData({ ...formData, address: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="12 rue de la Paix"
							maxLength={200}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Ville <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.city || ''}
							onChange={(e) => setFormData({ ...formData, city: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							maxLength={100}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Code postal <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.postalCode || ''}
							onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							pattern="[0-9]{5}"
							maxLength={5}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Secteur/Quartier <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.sector || ''}
							onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							maxLength={100}
							required
						/>
					</div>
				</div>
			</div>

			{/* Property Details */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Pièces</label>
						<input
							type="number"
							value={formData.rooms || ''}
							onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1}
							max={50}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
						<input
							type="number"
							value={formData.bedrooms || ''}
							onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={0}
							max={20}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">SdB</label>
						<input
							type="number"
							value={formData.bathrooms || ''}
							onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={0}
							max={10}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Salle d&apos;eau</label>
						<input
							type="number"
							value={formData.showerRooms || ''}
							onChange={(e) => setFormData({ ...formData, showerRooms: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={0}
							max={10}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
						<input
							type="number"
							value={formData.floor ?? ''}
							onChange={(e) => setFormData({ ...formData, floor: e.target.value ? Number(e.target.value) : undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={-5}
							max={100}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Nb étages</label>
						<input
							type="number"
							value={formData.totalFloors || ''}
							onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1}
							max={200}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
						<input
							type="number"
							value={formData.yearBuilt || ''}
							onChange={(e) => setFormData({ ...formData, yearBuilt: Number(e.target.value) || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							min={1800}
							max={new Date().getFullYear() + 5}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Chauffage</label>
						<input
							type="text"
							value={formData.heatingType || ''}
							onChange={(e) => setFormData({ ...formData, heatingType: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Gaz collectif"
							maxLength={100}
						/>
					</div>
				</div>

				{/* Features checkboxes */}
				<div className="mt-6">
					<label className="block text-sm font-medium text-gray-700 mb-3">Équipements</label>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{[
							{ key: 'hasParking', label: 'Parking' },
							{ key: 'hasGarden', label: 'Jardin' },
							{ key: 'hasElevator', label: 'Ascenseur' },
							{ key: 'hasBalcony', label: 'Balcon' },
							{ key: 'hasTerrace', label: 'Terrasse' },
							{ key: 'hasGarage', label: 'Garage' },
						].map(({ key, label }) => (
							<label key={key} className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={!!formData[key as keyof CreatePropertyRequest]}
									onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
									className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								/>
								<span className="text-sm text-gray-700">{label}</span>
							</label>
						))}
					</div>
				</div>
			</div>

			{/* Energy & Condition */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Énergie & État</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">DPE</label>
						<select
							value={formData.energyRating || ''}
							onChange={(e) => setFormData({ ...formData, energyRating: e.target.value as CreatePropertyRequest['energyRating'] || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value="">Non renseigné</option>
							{ENERGY_RATINGS.map((rating) => (
								<option key={rating} value={rating}>{rating}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">GES</label>
						<select
							value={formData.gasEmissionClass || ''}
							onChange={(e) => setFormData({ ...formData, gasEmissionClass: e.target.value as CreatePropertyRequest['gasEmissionClass'] || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value="">Non renseigné</option>
							{ENERGY_RATINGS.map((rating) => (
								<option key={rating} value={rating}>{rating}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">État</label>
						<select
							value={formData.condition || ''}
							onChange={(e) => setFormData({ ...formData, condition: e.target.value as CreatePropertyRequest['condition'] || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value="">Non renseigné</option>
							{CONDITIONS.map(({ value, label }) => (
								<option key={value} value={value}>{label}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
						<select
							value={formData.orientation || ''}
							onChange={(e) => setFormData({ ...formData, orientation: e.target.value as CreatePropertyRequest['orientation'] || undefined })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value="">Non renseigné</option>
							{ORIENTATIONS.map((orientation) => (
								<option key={orientation} value={orientation}>{orientation}</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Images */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<ImageIcon size={20} />
					Images
				</h2>
				<p className="text-sm text-gray-600 mb-4">
					Fournissez les URLs des images. Elles doivent être accessibles publiquement. Max 10MB par image.
				</p>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Image principale</label>
						<input
							type="url"
							value={mainImageUrl}
							onChange={(e) => setMainImageUrl(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="https://example.com/image.jpg"
						/>
					</div>

					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-gray-700">Images de galerie</label>
							{galleryUrls.length < 10 && (
								<button
									type="button"
									onClick={addGalleryUrl}
									className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
								>
									<Plus size={16} />
									Ajouter une image
								</button>
							)}
						</div>
						<div className="space-y-2">
							{galleryUrls.map((url, index) => (
								<div key={index} className="flex gap-2">
									<input
										type="url"
										value={url}
										onChange={(e) => updateGalleryUrl(index, e.target.value)}
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
										placeholder="https://example.com/image.jpg"
									/>
									<button
										type="button"
										onClick={() => removeGalleryUrl(index)}
										className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
									>
										<X size={20} />
									</button>
								</div>
							))}
						</div>
						<p className="text-xs text-gray-500 mt-1">Maximum 10 images de galerie</p>
					</div>
				</div>
			</div>

			{/* Submit */}
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={loading}
					className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{loading && <Loader2 className="animate-spin" size={20} />}
					{loading ? 'Création en cours...' : 'Créer le bien'}
				</button>
			</div>
		</form>
	);
}
