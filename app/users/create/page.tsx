'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Settings } from 'lucide-react';
import UserForm from '@/components/UserForm';
import { getConfig, saveUser } from '@/lib/storage';
import { ApiConfig, CreatedUser } from '@/lib/types';

export default function CreateUserPage() {
	const router = useRouter();
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [successMessage, setSuccessMessage] = useState<CreatedUser | null>(null);

	useEffect(() => {
		const storedConfig = getConfig();
		setConfig(storedConfig);
		setIsLoaded(true);
	}, []);

	const handleSuccess = (user: CreatedUser) => {
		saveUser(user);
		setSuccessMessage(user);
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
								Veuillez configurer votre clé API avant de créer des utilisateurs.
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

	if (successMessage) {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="bg-green-50 border border-green-200 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<CheckCircle className="text-green-500 mt-0.5" size={24} />
						<div className="flex-1">
							<h3 className="font-medium text-green-800">
								Utilisateur créé avec succès !
							</h3>
							<div className="mt-4 bg-white rounded-md p-4 border border-green-200">
								<dl className="space-y-2 text-sm">
									<div className="flex justify-between">
										<dt className="text-gray-600">ID MonHubImmo :</dt>
										<dd className="font-mono text-gray-900">{successMessage.id}</dd>
									</div>
									{successMessage.externalId && (
										<div className="flex justify-between">
											<dt className="text-gray-600">ID Externe :</dt>
											<dd className="font-mono text-gray-900">
												{successMessage.externalId}
											</dd>
										</div>
									)}
									<div className="flex justify-between">
										<dt className="text-gray-600">Email :</dt>
										<dd className="text-gray-900">{successMessage.email}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Nom :</dt>
										<dd className="text-gray-900">
											{successMessage.firstName} {successMessage.lastName}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Statut :</dt>
										<dd>
											{successMessage.isValidated ? (
												<span className="text-green-600">Validé</span>
											) : (
												<span className="text-yellow-600">En attente</span>
											)}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-gray-600">Invitation envoyée :</dt>
										<dd>
											{successMessage.inviteSent ? (
												<span className="text-green-600">Oui</span>
											) : (
												<span className="text-gray-600">Non</span>
											)}
										</dd>
									</div>
								</dl>
							</div>
							<div className="mt-4 flex gap-3">
								<button
									onClick={() => setSuccessMessage(null)}
									className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
								>
									Créer un autre utilisateur
								</button>
								<Link
									href="/users"
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
								>
									Voir la liste
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Créer un Utilisateur</h1>
				<p className="mt-2 text-gray-600">
					Remplissez le formulaire ci-dessous pour créer un nouvel agent
					immobilier via l&apos;API partenaire.
				</p>
			</div>

			<UserForm config={config} onSuccess={handleSuccess} />
		</div>
	);
}
