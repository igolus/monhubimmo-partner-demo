import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
	title: 'Partner API Demo - MonHubImmo',
	description: 'Application de démonstration pour tester l\'API partenaire MonHubImmo',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr">
			<body className="min-h-screen bg-gray-50" suppressHydrationWarning>
				<Sidebar />
				<main className="ml-64 min-h-screen p-8">{children}</main>
			</body>
		</html>
	);
}
