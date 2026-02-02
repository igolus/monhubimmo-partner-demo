import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
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
				<Navbar />
				<main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
			</body>
		</html>
	);
}
