'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle, Settings } from 'lucide-react';
import UserEditForm from '@/components/UserEditForm';
import { getConfig } from '@/lib/storage';
import { getUser } from '@/lib/api';
import { ApiConfig, UserDetails } from '@/lib/types';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const router = useRouter();
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [user, setUser] = useState<UserDetails | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState(false);

	useEffect(() => {
		const storedConfig = getConfig();
		setConfig(storedConfig);

		if (storedConfig) {
			loadUser(storedConfig, id);
		} else {
			setIsLoaded(true);
		}
	}, [id]);

	const loadUser = async (apiConfig: ApiConfig, userId: string) => {
		const result = await getUser(apiConfig, userId);

		if (result.success && result.user) {
			setUser(result.user);
		} else {
			setError(result.error || 'Impossible de charger l\'utilisateur');
		}

		setIsLoaded(true);
	};

	const handleSuccess = () => {
		setSuccessMessage(true);
		setTimeout(() => {
			router.push('/users');
		}, 2000);
	};

	if (!isLoaded) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (!config) {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<AlertCircle className="text-yellow-500 mt-0.5" size={24} />
						<div>
							<h3 className="font-medium text-yellow-800">
								Configuration requise
							</h3>
							<p className="mt-1 text-yellow-700">
								Veuillez configurer votre clé API avant de modifier des utilisateurs.
							</p>
							<Link
								href="/config"
								className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
							>
								<Settings size={18} />
								Configurer l&apos;API
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<AlertCircle className="text-red-500 mt-0.5" size={24} />
						<div>
							<h3 className="font-medium text-red-800">Erreur</h3>
							<p className="mt-1 text-red-700">{error}</p>
							<Link
								href="/users"
								className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
							>
								<ArrowLeft size={18} />
								Retour à la liste
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (successMessage) {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="bg-green-50 border border-green-200 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<CheckCircle className="text-green-500 mt-0.5" size={24} />
						<div>
							<h3 className="font-medium text-green-800">
								Modifications enregistrées !
							</h3>
							<p className="mt-1 text-green-700">
								Redirection vers la liste des utilisateurs...
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-8">
				<Link
					href="/users"
					className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
				>
					<ArrowLeft size={18} />
					Retour à la liste
				</Link>
				<h1 className="text-3xl font-bold text-gray-900">Modifier l&apos;utilisateur</h1>
				<p className="mt-2 text-gray-600">
					{user.firstName} {user.lastName} ({user.email})
				</p>
			</div>

			<UserEditForm config={config} user={user} onSuccess={handleSuccess} />
		</div>
	);
}
