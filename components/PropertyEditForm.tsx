'use client';

import { useState } from 'react';
import { Loader2, Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { updateProperty, UpdatePropertyResult } from '@/lib/api';
import { ApiConfig, UpdatePropertyRequest, PropertyDetail, UpdatedProperty } from '@/lib/types';
import ErrorDisplay from './ErrorDisplay';

interface PropertyEditFormProps {
	config: ApiConfig;
	property: PropertyDetail;
	onSuccess: (property: UpdatedProperty) => void;
	onCancel: () => void;
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
const STATUSES = [
	{ value: 'draft', label: 'Brouillon' },
	{ value: 'active', label: 'Actif' },
	{ value: 'archived', label: 'Archivé' },
] as const;

export default function PropertyEditForm({ config, property, onSuccess, onCancel }: PropertyEditFormProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<UpdatePropertyResult | null>(null);

	// Form state - initialized from property
	const [formData, setFormData] = useState<Partial<UpdatePropertyRequest>>({
		title: property.title,
		description: property.description,
		price: property.price,
		surface: property.surface,
		propertyType: property.propertyType as UpdatePropertyRequest['propertyType'],
		transactionType: property.transactionType as UpdatePropertyRequest['transactionType'],
		city: property.city,
		postalCode: property.postalCode,
		sector: property.sector,
		address: property.address || '',
		rooms: property.rooms || undefined,
		bedrooms: property.bedrooms || undefined,
		bathrooms: property.bathrooms || undefined,
		showerRooms: property.showerRooms || undefined,
		floor: property.floor,
		totalFloors: property.totalFloors || undefined,
		yearBuilt: property.yearBuilt || undefined,
		hasParking: property.hasParking,
		hasGarden: property.hasGarden,
		hasElevator: property.hasElevator,
		hasBalcony: property.hasBalcony,
		hasTerrace: property.hasTerrace,
		hasGarage: property.hasGarage,
		energyRating: property.energyRating as UpdatePropertyRequest['energyRating'] || undefined,
		gasEmissionClass: property.gasEmissionClass as UpdatePropertyRequest['gasEmissionClass'] || undefined,
		condition: property.condition as UpdatePropertyRequest['condition'] || undefined,
		orientation: property.orientation as UpdatePropertyRequest['orientation'] || undefined,
		heatingType: property.heatingType || '',
		annualCondoFees: property.annualCondoFees || undefined,
		status: property.status as UpdatePropertyRequest['status'],
	});

	// Image state
	const [currentMainImage, setCurrentMainImage] = useState<string | null>(property.mainImage);
	const [removeMainImage, setRemoveMainImage] = useState(false);
	const [newMainImageUrl, setNewMainImageUrl] = useState('');

	// Gallery state - handle both formats: string[] or {url, key}[]
	const initialGalleryImages = (property.galleryImages || []).map((img) => {
		if (typeof img === 'string') {
			return { url: img, key: img }; // Use URL as key fallback for public properties
		}
		return img;
	});
	const [currentGalleryImages, setCurrentGalleryImages] = useState<Array<{ url: string; key: string }>>(initialGalleryImages);
	const [imagesToRemove, setImagesToRemove] = useState<string[]>([]); // Store keys to remove
	const [newGalleryUrls, setNewGalleryUrls] = useState<string[]>([]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Build request with only changed fields
		const request: UpdatePropertyRequest = {};

		// Basic fields
		if (formData.title !== property.title) request.title = formData.title;
		if (formData.description !== property.description) request.description = formData.description;
		if (formData.price !== property.price) request.price = formData.price;
		if (formData.surface !== property.surface) request.surface = formData.surface;
		if (formData.propertyType !== property.propertyType) request.propertyType = formData.propertyType;
		if (formData.transactionType !== property.transactionType) request.transactionType = formData.transactionType;
		if (formData.city !== property.city) request.city = formData.city;
		if (formData.postalCode !== property.postalCode) request.postalCode = formData.postalCode;
		if (formData.sector !== property.sector) request.sector = formData.sector;
		if (formData.address !== (property.address || '')) request.address = formData.address || undefined;
		if (formData.status !== property.status) request.status = formData.status;

		// Room fields
		if (formData.rooms !== property.rooms) request.rooms = formData.rooms;
		if (formData.bedrooms !== property.bedrooms) request.bedrooms = formData.bedrooms;
		if (formData.bathrooms !== property.bathrooms) request.bathrooms = formData.bathrooms;
		if (formData.showerRooms !== property.showerRooms) request.showerRooms = formData.showerRooms;
		if (formData.floor !== property.floor) request.floor = formData.floor;
		if (formData.totalFloors !== property.totalFloors) request.totalFloors = formData.totalFloors;
		if (formData.yearBuilt !== property.yearBuilt) request.yearBuilt = formData.yearBuilt;
		if (formData.heatingType !== (property.heatingType || '')) request.heatingType = formData.heatingType || undefined;

		// Features
		if (formData.hasParking !== property.hasParking) request.hasParking = formData.hasParking;
		if (formData.hasGarden !== property.hasGarden) request.hasGarden = formData.hasGarden;
		if (formData.hasElevator !== property.hasElevator) request.hasElevator = formData.hasElevator;
		if (formData.hasBalcony !== property.hasBalcony) request.hasBalcony = formData.hasBalcony;
		if (formData.hasTerrace !== property.hasTerrace) request.hasTerrace = formData.hasTerrace;
		if (formData.hasGarage !== property.hasGarage) request.hasGarage = formData.hasGarage;

		// Energy & Condition
		if (formData.energyRating !== (property.energyRating || undefined)) request.energyRating = formData.energyRating;
		if (formData.gasEmissionClass !== (property.gasEmissionClass || undefined)) request.gasEmissionClass = formData.gasEmissionClass;
		if (formData.condition !== (property.condition || undefined)) request.condition = formData.condition;
		if (formData.orientation !== (property.orientation || undefined)) request.orientation = formData.orientation;
		if (formData.annualCondoFees !== property.annualCondoFees) request.annualCondoFees = formData.annualCondoFees;

		// Image handling
		if (removeMainImage) {
			request.removeMainImage = true;
		} else if (newMainImageUrl) {
			request.mainImage = { url: newMainImageUrl };
		}

		if (imagesToRemove.length > 0) {
			// Extract keys from URLs for removal
			request.removeGalleryImages = imagesToRemove;
		}

		if (newGalleryUrls.filter(url => url.trim()).length > 0) {
			request.addGalleryImages = newGalleryUrls
				.filter(url => url.trim())
				.map(url => ({ url }));
		}

		// Check if there are any changes
		if (Object.keys(request).length === 0) {
			setError({ success: false, error: 'Aucune modification détectée' });
			setLoading(false);
			return;
		}

		const result = await updateProperty(config, property.id, request);

		if (result.success && result.property) {
			onSuccess(result.property);
		} else {
			setError(result);
		}

		setLoading(false);
	};

	const handleRemoveMainImage = () => {
		setRemoveMainImage(true);
		setCurrentMainImage(null);
		setNewMainImageUrl('');
	};

	const handleRestoreMainImage = () => {
		setRemoveMainImage(false);
		setCurrentMainImage(property.mainImage);
	};

	const handleMarkGalleryImageForRemoval = (image: { url: string; key: string }) => {
		setImagesToRemove([...imagesToRemove, image.key]);
		setCurrentGalleryImages(currentGalleryImages.filter(img => img.key !== image.key));
	};

	const handleRestoreGalleryImage = (key: string) => {
		const imageToRestore = initialGalleryImages.find(img => img.key === key);
		if (imageToRestore) {
			setImagesToRemove(imagesToRemove.filter(k => k !== key));
			setCurrentGalleryImages([...currentGalleryImages, imageToRestore]);
		}
	};

	const addNewGalleryUrl = () => {
		if (currentGalleryImages.length + newGalleryUrls.length < 10) {
			setNewGalleryUrls([...newGalleryUrls, '']);
		}
	};

	const removeNewGalleryUrl = (index: number) => {
		setNewGalleryUrls(newGalleryUrls.filter((_, i) => i !== index));
	};

	const updateNewGalleryUrl = (index: number, value: string) => {
		const updated = [...newGalleryUrls];
		updated[index] = value;
		setNewGalleryUrls(updated);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{error && <ErrorDisplay error={error.error || 'Erreur inconnue'} message={error.message} details={error.details} />}

			{/* Status */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Statut</h2>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Statut du bien
					</label>
					<select
						value={formData.status || 'draft'}
						onChange={(e) => setFormData({ ...formData, status: e.target.value as UpdatePropertyRequest['status'] })}
						className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					>
						{STATUSES.map(({ value, label }) => (
							<option key={value} value={value}>{label}</option>
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
							minLength={50}
							maxLength={2000}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Type de bien <span className="text-red-500">*</span>
						</label>
						<select
							value={formData.propertyType || ''}
							onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as UpdatePropertyRequest['propertyType'] })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							required
						>
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
							onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as UpdatePropertyRequest['transactionType'] })}
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
									checked={!!formData[key as keyof UpdatePropertyRequest]}
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
							onChange={(e) => setFormData({ ...formData, energyRating: e.target.value as UpdatePropertyRequest['energyRating'] || undefined })}
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
							onChange={(e) => setFormData({ ...formData, gasEmissionClass: e.target.value as UpdatePropertyRequest['gasEmissionClass'] || undefined })}
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
							onChange={(e) => setFormData({ ...formData, condition: e.target.value as UpdatePropertyRequest['condition'] || undefined })}
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
							onChange={(e) => setFormData({ ...formData, orientation: e.target.value as UpdatePropertyRequest['orientation'] || undefined })}
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

				{/* Main Image */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">Image principale</label>

					{currentMainImage && !removeMainImage ? (
						<div className="flex items-start gap-4">
							<img
								src={currentMainImage}
								alt="Image principale"
								className="w-32 h-24 object-cover rounded-lg border"
							/>
							<button
								type="button"
								onClick={handleRemoveMainImage}
								className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md flex items-center gap-1"
							>
								<Trash2 size={16} />
								Supprimer
							</button>
						</div>
					) : removeMainImage && property.mainImage ? (
						<div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
							<span className="text-red-700 text-sm">L&apos;image principale sera supprimée</span>
							<button
								type="button"
								onClick={handleRestoreMainImage}
								className="text-sm text-indigo-600 hover:text-indigo-800"
							>
								Annuler
							</button>
						</div>
					) : (
						<div>
							<input
								type="url"
								value={newMainImageUrl}
								onChange={(e) => setNewMainImageUrl(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								placeholder="https://example.com/image.jpg"
							/>
							<p className="text-xs text-gray-500 mt-1">URL d&apos;une nouvelle image principale</p>
						</div>
					)}
				</div>

				{/* Gallery Images */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<label className="block text-sm font-medium text-gray-700">Images de galerie</label>
						{currentGalleryImages.length + newGalleryUrls.length < 10 && (
							<button
								type="button"
								onClick={addNewGalleryUrl}
								className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
							>
								<Plus size={16} />
								Ajouter une image
							</button>
						)}
					</div>

					{/* Current gallery images */}
					{currentGalleryImages.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
							{currentGalleryImages.map((image, index) => (
								<div key={image.key} className="relative group">
									<img
										src={image.url}
										alt={`Galerie ${index + 1}`}
										className="w-full h-24 object-cover rounded-lg border"
									/>
									<button
										type="button"
										onClick={() => handleMarkGalleryImageForRemoval(image)}
										className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X size={14} />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Images marked for removal */}
					{imagesToRemove.length > 0 && (
						<div className="mb-4 p-3 bg-red-50 rounded-lg">
							<p className="text-sm text-red-700 mb-2">Images à supprimer:</p>
							<div className="flex flex-wrap gap-2">
								{imagesToRemove.map((key, index) => (
									<div key={index} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-red-200">
										<span className="text-xs text-gray-600 truncate max-w-[150px]">{key.split('/').pop()}</span>
										<button
											type="button"
											onClick={() => handleRestoreGalleryImage(key)}
											className="text-indigo-600 hover:text-indigo-800 text-xs"
										>
											Annuler
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* New gallery URLs */}
					{newGalleryUrls.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm text-gray-600">Nouvelles images à ajouter:</p>
							{newGalleryUrls.map((url, index) => (
								<div key={index} className="flex gap-2">
									<input
										type="url"
										value={url}
										onChange={(e) => updateNewGalleryUrl(index, e.target.value)}
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
										placeholder="https://example.com/image.jpg"
									/>
									<button
										type="button"
										onClick={() => removeNewGalleryUrl(index)}
										className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
									>
										<X size={20} />
									</button>
								</div>
							))}
						</div>
					)}

					<p className="text-xs text-gray-500 mt-2">
						{currentGalleryImages.length + newGalleryUrls.filter(u => u.trim()).length}/10 images
					</p>
				</div>
			</div>

			{/* Submit */}
			<div className="flex justify-end gap-4">
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
				>
					Annuler
				</button>
				<button
					type="submit"
					disabled={loading}
					className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{loading && <Loader2 className="animate-spin" size={20} />}
					{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
				</button>
			</div>
		</form>
	);
}
