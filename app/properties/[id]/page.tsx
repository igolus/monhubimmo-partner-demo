'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
	ArrowLeft,
	Loader2,
	Building2,
	MapPin,
	Maximize,
	BedDouble,
	Bath,
	Car,
	Trees,
	Zap,
	Eye,
	Heart,
	Pencil,
} from 'lucide-react';
import { getConfig } from '@/lib/storage';
import { getProperty } from '@/lib/api';
import { ApiConfig, PropertyDetail } from '@/lib/types';

export default function PropertyDetailPage() {
	const params = useParams();
	const propertyId = params.id as string;
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [property, setProperty] = useState<PropertyDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setConfig(getConfig());
	}, []);

	useEffect(() => {
		if (!config) return;

		const fetchProperty = async () => {
			setLoading(true);
			setError(null);

			const result = await getProperty(config, propertyId);

			if (result.success && result.property) {
				setProperty(result.property);
			} else {
				setError(result.error || 'Bien non trouvé');
			}

			setLoading(false);
		};

		fetchProperty();
	}, [config, propertyId]);

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
		if (fallback) fallback.classList.remove('hidden');
		e.currentTarget.style.display = 'none';
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="animate-spin text-indigo-600" size={32} />
			</div>
		);
	}

	if (error || !property) {
		return (
			<div>
				<Link href="/properties" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-4">
					<ArrowLeft size={18} />
					Retour aux biens
				</Link>
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{error || 'Bien non trouvé'}
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<Link href="/properties" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
					<ArrowLeft size={18} />
					Retour aux biens
				</Link>
				<Link
					href={`/properties/${propertyId}/edit`}
					className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					<Pencil size={16} />
					Modifier
				</Link>
			</div>

			{/* Header */}
			<div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
				{property.mainImage && (
					<img
						src={property.mainImage}
						alt={property.title}
						className="w-full h-64 object-cover"
						onError={handleImageError}
					/>
				)}
				<div className={`w-full h-64 bg-gray-200 items-center justify-center${property.mainImage ? ' hidden' : ' flex'}`}>
					<Building2 className="text-gray-400" size={64} />
				</div>

				<div className="p-6">
					<div className="flex items-center gap-2 mb-3">
						<span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
							{property.propertyType}
						</span>
						<span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
							{property.transactionType}
						</span>
					</div>

					<h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>

					<div className="flex items-center gap-1 text-gray-500 mt-2">
						<MapPin size={16} />
						<span>{property.address ? `${property.address}, ` : ''}{property.city} ({property.postalCode})</span>
						{property.sector && <span className="text-gray-400">· {property.sector}</span>}
					</div>

					<div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
						<span className="text-3xl font-bold text-indigo-600">{formatPrice(property.price)}</span>
						<div className="flex items-center gap-4 text-sm text-gray-500">
							<span className="flex items-center gap-1">
								<Eye size={16} />
								{property.viewCount} vues
							</span>
							<span className="flex items-center gap-1">
								<Heart size={16} />
								{property.favoriteCount} favoris
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Details Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				{/* Caractéristiques */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques</h2>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2">
							<Maximize size={18} className="text-gray-400" />
							<span className="text-sm text-gray-700">{property.surface} m²</span>
						</div>
						<div className="flex items-center gap-2">
							<Building2 size={18} className="text-gray-400" />
							<span className="text-sm text-gray-700">{property.rooms} pièces</span>
						</div>
						{property.bedrooms > 0 && (
							<div className="flex items-center gap-2">
								<BedDouble size={18} className="text-gray-400" />
								<span className="text-sm text-gray-700">{property.bedrooms} chambres</span>
							</div>
						)}
						{(property.bathrooms > 0 || property.showerRooms > 0) && (
							<div className="flex items-center gap-2">
								<Bath size={18} className="text-gray-400" />
								<span className="text-sm text-gray-700">
									{property.bathrooms > 0 ? `${property.bathrooms} SdB` : ''}
									{property.bathrooms > 0 && property.showerRooms > 0 ? ' + ' : ''}
									{property.showerRooms > 0 ? `${property.showerRooms} SdE` : ''}
								</span>
							</div>
						)}
						{property.floor != null && (
							<div className="text-sm text-gray-700">
								Étage {property.floor}{property.totalFloors ? ` / ${property.totalFloors}` : ''}
							</div>
						)}
						{property.yearBuilt > 0 && (
							<div className="text-sm text-gray-700">Construit en {property.yearBuilt}</div>
						)}
					</div>
				</div>

				{/* Équipements */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Équipements</h2>
					<div className="grid grid-cols-2 gap-3">
						{[
							{ label: 'Parking', value: property.hasParking, icon: Car },
							{ label: 'Jardin', value: property.hasGarden, icon: Trees },
							{ label: 'Ascenseur', value: property.hasElevator, icon: Building2 },
							{ label: 'Balcon', value: property.hasBalcony, icon: Maximize },
							{ label: 'Terrasse', value: property.hasTerrace, icon: Maximize },
							{ label: 'Garage', value: property.hasGarage, icon: Car },
						].map(({ label, value, icon: Icon }) => (
							<div key={label} className={`flex items-center gap-2 text-sm ${value ? 'text-green-700' : 'text-gray-400'}`}>
								<Icon size={16} />
								<span>{label}</span>
								{value ? '✓' : '✗'}
							</div>
						))}
					</div>
				</div>

				{/* Énergie */}
				{(property.energyRating || property.gasEmissionClass) && (
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Zap size={20} />
							Énergie
						</h2>
						<div className="space-y-2">
							{property.energyRating && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">DPE</span>
									<span className="font-semibold">{property.energyRating}</span>
								</div>
							)}
							{property.gasEmissionClass && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">GES</span>
									<span className="font-semibold">{property.gasEmissionClass}</span>
								</div>
							)}
							{property.heatingType && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Chauffage</span>
									<span className="text-sm">{property.heatingType}</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Propriétaire */}
				{property.owner && (
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Propriétaire</h2>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Nom</span>
								<span className="text-sm font-medium">{property.owner.firstName} {property.owner.lastName}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Type</span>
								<span className="text-sm">{property.owner.userType}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">ID</span>
								<span className="font-mono text-xs text-gray-500">{property.owner.id}</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Description */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
				<div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: property.description }} />
			</div>

			{/* Gallery */}
			{property.galleryImages && property.galleryImages.length > 0 && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Galerie ({property.galleryImages.length} photos)
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{property.galleryImages.map((image, index) => (
							<img
								key={index}
								/* Un bien a vous renvoie { url, key } ; un bien du
								   catalogue public renvoie une simple chaine. */
								src={typeof image === 'string' ? image : image.url}
								alt={`Photo ${index + 1}`}
								className="w-full h-32 object-cover rounded-lg"
								onError={(e) => { e.currentTarget.style.display = 'none'; }}
							/>
						))}
					</div>
				</div>
			)}

			{/* Raw JSON */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Réponse API brute</h2>
				<pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
					<code>{JSON.stringify(property, null, 2)}</code>
				</pre>
			</div>
		</div>
	);
}
