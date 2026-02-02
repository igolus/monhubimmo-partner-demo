'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Users, UserPlus } from 'lucide-react';

const navItems = [
	{ href: '/', label: 'Dashboard', icon: Home },
	{ href: '/config', label: 'Configuration', icon: Settings },
	{ href: '/users', label: 'Utilisateurs', icon: Users },
	{ href: '/users/create', label: 'Créer Utilisateur', icon: UserPlus },
];

export default function Navbar() {
	const pathname = usePathname();

	return (
		<nav className="bg-indigo-600 text-white shadow-lg">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="text-xl font-bold">
						Partner API Demo
					</Link>

					<div className="flex space-x-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;

							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
										isActive
											? 'bg-indigo-700 text-white'
											: 'text-indigo-100 hover:bg-indigo-500'
									}`}
								>
									<Icon size={18} />
									<span className="hidden sm:inline">{item.label}</span>
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</nav>
	);
}
