'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
	CheckCircle,
	XCircle,
	Users,
	Settings,
	UserPlus,
	ArrowRight,
} from 'lucide-react';
import { getConfig, getUsers } from '@/lib/storage';
import { ApiConfig, CreatedUser } from '@/lib/types';

export default function DashboardPage() {
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [users, setUsers] = useState<CreatedUser[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setConfig(getConfig());
		setUsers(getUsers());
		setIsLoaded(true);
	}, []);

	if (!isLoaded) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">
					Bienvenue sur Partner API Demo
				</h1>
				<p className="mt-2 text-gray-600">
					Cette application vous permet de tester l&apos;API partenaire
					MonHubImmo avant de l&apos;intégrer dans votre propre système.
				</p>
			</div>

			{/* Status Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				{/* API Connection Status */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{config ? (
								<div className="p-3 bg-green-100 rounded-full">
									<CheckCircle className="text-green-600" size={24} />
								</div>
							) : (
								<div className="p-3 bg-red-100 rounded-full">
									<XCircle className="text-red-600" size={24} />
								</div>
							)}
							<div>
								<h3 className="font-semibold text-gray-800">Connexion API</h3>
								<p className="text-sm text-gray-500">
									{config ? 'Configurée' : 'Non configurée'}
								</p>
							</div>
						</div>
						{!config && (
							<Link
								href="/config"
								className="text-indigo-600 hover:text-indigo-700"
							>
								<ArrowRight size={20} />
							</Link>
						)}
					</div>
					{config && (
						<div className="mt-4 pt-4 border-t border-gray-100">
							<p className="text-xs text-gray-500">
								URL : <span className="font-mono">{config.apiUrl}</span>
							</p>
						</div>
					)}
				</div>

				{/* Users Count */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-indigo-100 rounded-full">
								<Users className="text-indigo-600" size={24} />
							</div>
							<div>
								<h3 className="font-semibold text-gray-800">Utilisateurs créés</h3>
								<p className="text-2xl font-bold text-indigo-600">{users.length}</p>
							</div>
						</div>
						{users.length > 0 && (
							<Link
								href="/users"
								className="text-indigo-600 hover:text-indigo-700"
							>
								<ArrowRight size={20} />
							</Link>
						)}
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-lg font-semibold text-gray-800 mb-4">
					Actions rapides
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Link
						href="/config"
						className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
					>
						<Settings className="text-indigo-600" size={24} />
						<div>
							<h3 className="font-medium text-gray-800">Configurer l&apos;API</h3>
							<p className="text-sm text-gray-500">
								Définir la clé API et l&apos;URL
							</p>
						</div>
					</Link>

					<Link
						href="/users/create"
						className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
					>
						<UserPlus className="text-indigo-600" size={24} />
						<div>
							<h3 className="font-medium text-gray-800">Créer un utilisateur</h3>
							<p className="text-sm text-gray-500">Tester la création</p>
						</div>
					</Link>

					<Link
						href="/users"
						className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
					>
						<Users className="text-indigo-600" size={24} />
						<div>
							<h3 className="font-medium text-gray-800">Voir les utilisateurs</h3>
							<p className="text-sm text-gray-500">
								Liste des créations
							</p>
						</div>
					</Link>
				</div>
			</div>

			{/* Instructions */}
			<div className="mt-8 p-6 bg-gray-100 rounded-lg">
				<h2 className="text-lg font-semibold text-gray-800 mb-4">
					Comment utiliser cette application ?
				</h2>
				<ol className="list-decimal list-inside space-y-2 text-gray-700">
					<li>
						<strong>Configuration</strong> : Entrez votre clé API dans la page
						Configuration et testez la connexion.
					</li>
					<li>
						<strong>Création</strong> : Utilisez le formulaire pour créer des
						utilisateurs de test via l&apos;API.
					</li>
					<li>
						<strong>Validation</strong> : Vérifiez les erreurs retournées par
						l&apos;API pour comprendre les validations requises.
					</li>
					<li>
						<strong>Intégration</strong> : Une fois les tests réussis, intégrez
						l&apos;API dans votre propre système.
					</li>
				</ol>
			</div>
		</div>
	);
}
