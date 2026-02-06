'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Users, UserPlus, Building2, Search, Plus, FolderOpen, SearchCheck, Bell } from 'lucide-react';

const navItems = [
	{ href: '/', label: 'Dashboard', icon: Home },
	{ href: '/config', label: 'Configuration', icon: Settings },
	{ href: '/users', label: 'Utilisateurs', icon: Users },
	{ href: '/users/create', label: 'Créer Utilisateur', icon: UserPlus },
	{ href: '/properties', label: 'Biens publics', icon: Building2 },
	{ href: '/properties/mine', label: 'Mes biens (API)', icon: FolderOpen },
	{ href: '/properties/create', label: 'Créer Bien', icon: Plus },
	{ href: '/search-ads', label: 'Recherches publiques', icon: Search },
	{ href: '/search-ads/mine', label: 'Mes recherches (API)', icon: SearchCheck },
	{ href: '/search-ads/create', label: 'Créer Recherche', icon: Plus },
	{ href: '/webhooks', label: 'Webhooks', icon: Bell },
];

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="fixed left-0 top-0 h-screen w-64 bg-indigo-600 text-white shadow-lg flex flex-col">
			{/* Logo / Title */}
			<div className="p-6 border-b border-indigo-500">
				<Link href="/" className="text-xl font-bold">
					Partner API Demo
				</Link>
				<p className="text-indigo-200 text-sm mt-1">MonHubImmo</p>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname === item.href ||
						(item.href !== '/' && pathname.startsWith(item.href));

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
								isActive
									? 'bg-indigo-700 text-white'
									: 'text-indigo-100 hover:bg-indigo-500'
							}`}
						>
							<Icon size={20} />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="p-4 border-t border-indigo-500 text-indigo-200 text-sm">
				<p>API Demo v1.0</p>
			</div>
		</aside>
	);
}
