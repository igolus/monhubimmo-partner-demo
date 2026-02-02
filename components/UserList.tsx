'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, CheckCircle, Clock, Pencil, Power, Loader2, LogIn } from 'lucide-react';
import { CreatedUser, ApiConfig } from '@/lib/types';
import { toggleUserStatus } from '@/lib/api';
import { generatePartnerLoginToken } from '@/lib/jwt';

interface UserListProps {
	users: CreatedUser[];
	config?: ApiConfig | null;
	onStatusChange?: () => void;
}

export default function UserList({ users, config, onStatusChange }: UserListProps) {
	const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
	const [loginLoadingUserId, setLoginLoadingUserId] = useState<string | null>(null);

	const handleToggleStatus = async (user: CreatedUser) => {
		if (!config) return;

		const action = user.isValidated ? 'desactiver' : 'activer';
		if (!confirm(`Etes-vous sur de vouloir ${action} cet utilisateur ?`)) {
			return;
		}

		setLoadingUserId(user.id);

		const result = await toggleUserStatus(config, user.id, !user.isValidated);

		setLoadingUserId(null);

		if (result.success) {
			onStatusChange?.();
		} else {
			alert(result.error || 'Erreur lors de la mise a jour du statut');
		}
	};

	const handleLoginUser = async (user: CreatedUser) => {
		if (!config?.jwtSecret || !config?.partnerId) {
			alert('JWT Secret ou Partner ID non configure. Verifiez la configuration.');
			return;
		}

		if (!user.isValidated) {
			alert('Cet utilisateur n\'est pas encore valide.');
			return;
		}

		setLoginLoadingUserId(user.id);

		try {
			// Generate the login token
			const token = await generatePartnerLoginToken(
				user.id,
				config.partnerId,
				config.jwtSecret
			);

			// Build the login URL (extract base URL from apiUrl)
			// Assuming client runs on port 3000 and server on port 4000
			const baseUrl = config.apiUrl.replace(':4000', ':3000');
			const loginUrl = `${baseUrl}/auth/partner-login?token=${encodeURIComponent(token)}`;

			// Open in new tab
			window.open(loginUrl, '_blank');
		} catch (error) {
			console.error('Failed to generate login token:', error);
			alert('Erreur lors de la generation du token de connexion');
		} finally {
			setLoginLoadingUserId(null);
		}
	};

	if (users.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-8 text-center">
				<Users className="mx-auto text-gray-400" size={48} />
				<h3 className="mt-4 text-lg font-medium text-gray-700">
					Aucun utilisateur
				</h3>
				<p className="mt-2 text-gray-500">
					Les utilisateurs créés via l&apos;API partenaire apparaîtront ici.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								ID MonHubImmo
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								ID Externe
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Email
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Nom complet
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Statut
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Créé le
							</th>
							<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{users.map((user) => (
							<tr key={user.id} className="hover:bg-gray-50">
								<td className="px-4 py-4 whitespace-nowrap">
									<span className="font-mono text-sm text-gray-900">
										{user.id.substring(0, 8)}...
									</span>
								</td>
								<td className="px-4 py-4 whitespace-nowrap">
									{user.externalId ? (
										<span className="font-mono text-sm text-gray-600">
											{user.externalId}
										</span>
									) : (
										<span className="text-gray-400">-</span>
									)}
								</td>
								<td className="px-4 py-4 whitespace-nowrap">
									<span className="text-sm text-gray-900">{user.email}</span>
								</td>
								<td className="px-4 py-4 whitespace-nowrap">
									<span className="text-sm text-gray-900">
										{user.firstName} {user.lastName}
									</span>
								</td>
								<td className="px-4 py-4 whitespace-nowrap">
									{user.isValidated ? (
										<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
											<CheckCircle size={12} />
											Actif
										</span>
									) : (
										<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
											<Clock size={12} />
											Inactif
										</span>
									)}
								</td>
								<td className="px-4 py-4 whitespace-nowrap">
									<span className="text-sm text-gray-500">
										{user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										}) : '-'}
									</span>
								</td>
								<td className="px-4 py-4 whitespace-nowrap text-right">
									<div className="flex items-center justify-end gap-2">
										{/* Login button - only for validated users with JWT secret configured */}
										{config?.jwtSecret && config?.partnerId && user.isValidated && (
											<button
												onClick={() => handleLoginUser(user)}
												disabled={loginLoadingUserId === user.id}
												className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
												title="Connecter cet utilisateur a MonHubImmo"
											>
												{loginLoadingUserId === user.id ? (
													<Loader2 size={16} className="animate-spin" />
												) : (
													<LogIn size={16} />
												)}
												Connecter
											</button>
										)}
										<Link
											href={`/users/${user.id}/edit`}
											className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
										>
											<Pencil size={16} />
											Modifier
										</Link>
										{config && (
											<button
												onClick={() => handleToggleStatus(user)}
												disabled={loadingUserId === user.id}
												className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors disabled:opacity-50 ${
													user.isValidated
														? 'text-red-600 hover:text-red-700 hover:bg-red-50'
														: 'text-green-600 hover:text-green-700 hover:bg-green-50'
												}`}
												title={user.isValidated ? 'Desactiver' : 'Activer'}
											>
												{loadingUserId === user.id ? (
													<Loader2 size={16} className="animate-spin" />
												) : (
													<Power size={16} />
												)}
												{user.isValidated ? 'Desactiver' : 'Activer'}
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
