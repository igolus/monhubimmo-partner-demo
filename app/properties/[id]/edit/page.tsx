'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getConfig } from '@/lib/storage';
import { getProperty } from '@/lib/api';
import { ApiConfig, PropertyDetail, UpdatedProperty } from '@/lib/types';
import PropertyEditForm from '@/components/PropertyEditForm';

export default function PropertyEditPage() {
	const params = useParams();
	const router = useRouter();
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

	const handleSuccess = (updatedProperty: UpdatedProperty) => {
		// Redirect to property detail page after successful update
		router.push(`/properties/${updatedProperty.id}`);
	};

	const handleCancel = () => {
		router.push(`/properties/${propertyId}`);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="animate-spin text-indigo-600" size={32} />
			</div>
		);
	}

	if (!config) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
				Configuration API non trouvée. Veuillez configurer votre clé API.
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
			<Link href={`/properties/${propertyId}`} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-4">
				<ArrowLeft size={18} />
				Retour au bien
			</Link>

			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Modifier le bien</h1>
				<p className="text-gray-600 mt-1">
					ID: <span className="font-mono text-sm">{propertyId}</span>
				</p>
			</div>

			<PropertyEditForm
				config={config}
				property={property}
				onSuccess={handleSuccess}
				onCancel={handleCancel}
			/>
		</div>
	);
}
