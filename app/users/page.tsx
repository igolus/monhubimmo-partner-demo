'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UserPlus, RefreshCw, AlertCircle, Settings } from 'lucide-react';
import UserList from '@/components/UserList';
import { getConfig } from '@/lib/storage';
import { listUsers } from '@/lib/api';
import { ApiConfig, CreatedUser } from '@/lib/types';

export default function UsersPage() {
	const [config, setConfig] = useState<ApiConfig | null>(null);
	const [users, setUsers] = useState<CreatedUser[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState<{
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	} | null>(null);

	const fetchUsers = useCallback(async (apiConfig: ApiConfig, page: number = 1) => {
		setIsLoading(true);
		setError(null);

		const result = await listUsers(apiConfig, page, 20);

		if (result.success && result.users) {
			setUsers(result.users);
			setPagination(result.pagination || null);
		} else {
			setError(result.error || 'Erreur lors du chargement des utilisateurs');
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		const storedConfig = getConfig();
		setConfig(storedConfig);
		setIsLoaded(true);

		if (storedConfig) {
			fetchUsers(storedConfig);
		}
	}, [fetchUsers]);

	const handleRefresh = () => {
		if (config) {
			fetchUsers(config, pagination?.page || 1);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (config) {
			fetchUsers(config, newPage);
		}
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
								Veuillez configurer votre clé API pour voir les utilisateurs.
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

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
					<p className="mt-2 text-gray-600">
						Liste des utilisateurs créés via l&apos;API partenaire.
					</p>
				</div>
				<div className="flex gap-3">
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
					>
						<RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
						Actualiser
					</button>
					<Link
						href="/users/create"
						className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
					>
						<UserPlus size={18} />
						Créer un utilisateur
					</Link>
				</div>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
					<div className="flex items-center gap-2">
						<AlertCircle size={20} />
						<span>{error}</span>
					</div>
				</div>
			)}

			{isLoading && users.length === 0 ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
				</div>
			) : (
				<>
					<UserList users={users} config={config} onStatusChange={handleRefresh} />

					{pagination && pagination.totalPages > 1 && (
						<div className="mt-6 flex items-center justify-between">
							<p className="text-sm text-gray-600">
								Page {pagination.page} sur {pagination.totalPages} ({pagination.total} utilisateurs)
							</p>
							<div className="flex gap-2">
								<button
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={pagination.page <= 1 || isLoading}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Précédent
								</button>
								<button
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={pagination.page >= pagination.totalPages || isLoading}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Suivant
								</button>
							</div>
						</div>
					)}
				</>
			)}

			{users.length > 0 && (
				<p className="mt-4 text-sm text-gray-500">
					Ces utilisateurs ont été créés via l&apos;API partenaire et sont stockés dans MonHubImmo.
				</p>
			)}

			{/* JWT Secret warning */}
			{config && (!config.jwtSecret || !config.partnerId) && users.length > 0 && (
				<div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-sm text-blue-800">
						<strong>Astuce :</strong> Pour pouvoir connecter vos utilisateurs directement a MonHubImmo,
						configurez le <strong>JWT Secret</strong> dans la{' '}
						<Link href="/config" className="underline hover:text-blue-900">
							page de configuration
						</Link>.
						{!config.partnerId && config.jwtSecret && (
							<span className="block mt-1">
								N&apos;oubliez pas de <strong>tester la connexion</strong> pour recuperer le Partner ID.
							</span>
						)}
					</p>
				</div>
			)}
		</div>
	);
}
