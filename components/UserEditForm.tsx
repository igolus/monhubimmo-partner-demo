'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { UpdateUserRequest, CoveredCity, ApiConfig, UserDetails } from '@/lib/types';
import { updateUser } from '@/lib/api';
import CoveredCitiesInput from './CoveredCitiesInput';
import ErrorDisplay from './ErrorDisplay';

interface UserEditFormProps {
	config: ApiConfig;
	user: UserDetails;
	onSuccess: () => void;
}

const AGENT_TYPES = [
	{ value: '', label: 'Sélectionner...' },
	{ value: 'independent', label: 'Indépendant' },
	{ value: 'commercial', label: 'Commercial' },
	{ value: 'employee', label: 'Salarié' },
];

const MANDATE_TYPES = [
	{ value: 'simple', label: 'Mandat Simple' },
	{ value: 'exclusif', label: 'Mandat Exclusif' },
	{ value: 'co-mandat', label: 'Co-mandat' },
];

interface FormData {
	externalId: string;
	firstName: string;
	lastName: string;
	phone: string;
	city: string;
	postalCode: string;
	interventionRadius: number;
	coveredCities: CoveredCity[];
	yearsExperience: number;
	personalPitch: string;
	agentType: 'independent' | 'commercial' | 'employee' | '';
	tCard: string;
	siretNumber: string;
	mandateTypes: ('simple' | 'exclusif' | 'co-mandat')[];
	collaborateWithAgents: boolean;
	shareCommission: boolean;
}

export default function UserEditForm({ config, user, onSuccess }: UserEditFormProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<{
		error: string;
		message?: string;
		details?: { field: string; message: string }[];
	} | null>(null);

	const profInfo = user.professionalInfo;

	const [formData, setFormData] = useState<FormData>({
		externalId: user.externalId || '',
		firstName: user.firstName,
		lastName: user.lastName,
		phone: user.phone || '',
		city: profInfo?.city || '',
		postalCode: profInfo?.postalCode || '',
		interventionRadius: profInfo?.interventionRadius || 30,
		coveredCities: profInfo?.coveredCities?.length
			? profInfo.coveredCities
			: [{ city: '', postalCode: '' }],
		yearsExperience: profInfo?.yearsExperience || 0,
		personalPitch: profInfo?.personalPitch || '',
		agentType: profInfo?.agentType || '',
		tCard: profInfo?.tCard || '',
		siretNumber: profInfo?.siretNumber || '',
		mandateTypes: profInfo?.mandateTypes || [],
		collaborateWithAgents: profInfo?.collaborateWithAgents || false,
		shareCommission: profInfo?.shareCommission || false,
	});

	const updateField = <K extends keyof FormData>(
		field: K,
		value: FormData[K]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleMandateTypeToggle = (type: 'simple' | 'exclusif' | 'co-mandat') => {
		const current = formData.mandateTypes;
		if (current.includes(type)) {
			updateField(
				'mandateTypes',
				current.filter((t) => t !== type)
			);
		} else {
			updateField('mandateTypes', [...current, type]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		// Build the update request - only include fields that have values
		const requestData: UpdateUserRequest = {};

		// Personal info
		if (formData.firstName) requestData.firstName = formData.firstName;
		if (formData.lastName) requestData.lastName = formData.lastName;
		if (formData.phone) requestData.phone = formData.phone;
		requestData.externalId = formData.externalId || undefined;

		// Professional info
		requestData.professionalInfo = {};
		if (formData.city) requestData.professionalInfo.city = formData.city;
		if (formData.postalCode) requestData.professionalInfo.postalCode = formData.postalCode;
		if (formData.interventionRadius) requestData.professionalInfo.interventionRadius = formData.interventionRadius;
		if (formData.coveredCities.length > 0 && formData.coveredCities[0].city) {
			requestData.professionalInfo.coveredCities = formData.coveredCities;
		}
		if (formData.yearsExperience !== undefined) requestData.professionalInfo.yearsExperience = formData.yearsExperience;
		if (formData.personalPitch) requestData.professionalInfo.personalPitch = formData.personalPitch;
		if (formData.agentType) requestData.professionalInfo.agentType = formData.agentType;
		if (formData.tCard) requestData.professionalInfo.tCard = formData.tCard;
		if (formData.siretNumber) requestData.professionalInfo.siretNumber = formData.siretNumber;
		if (formData.mandateTypes.length > 0) requestData.professionalInfo.mandateTypes = formData.mandateTypes;
		requestData.professionalInfo.collaborateWithAgents = formData.collaborateWithAgents;
		requestData.professionalInfo.shareCommission = formData.shareCommission;

		const result = await updateUser(config, user.id, requestData);

		setLoading(false);

		if (result.success) {
			onSuccess();
		} else {
			setError({
				error: result.error || 'Erreur inconnue',
				message: result.message,
				details: result.details,
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{error && (
				<ErrorDisplay
					error={error.error}
					message={error.message}
					details={error.details}
					onClose={() => setError(null)}
				/>
			)}

			{/* External ID Section */}
			<section className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Identifiant Externe
				</h3>
				<div>
					<label
						htmlFor="externalId"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						ID Externe (optionnel)
					</label>
					<input
						id="externalId"
						type="text"
						value={formData.externalId}
						onChange={(e) => updateField('externalId', e.target.value)}
						placeholder="Votre identifiant interne"
						maxLength={255}
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
			</section>

			{/* Personal Information Section */}
			<section className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Informations Personnelles
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							value={user.email}
							disabled
							className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
						/>
						<p className="mt-1 text-xs text-gray-500">
							L&apos;email ne peut pas être modifié
						</p>
					</div>
					<div>
						<label
							htmlFor="phone"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Téléphone *
						</label>
						<input
							id="phone"
							type="tel"
							value={formData.phone}
							onChange={(e) => updateField('phone', e.target.value)}
							placeholder="0612345678"
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
					<div>
						<label
							htmlFor="firstName"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Prénom *
						</label>
						<input
							id="firstName"
							type="text"
							value={formData.firstName}
							onChange={(e) => updateField('firstName', e.target.value)}
							placeholder="Jean"
							required
							maxLength={50}
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
					<div>
						<label
							htmlFor="lastName"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Nom *
						</label>
						<input
							id="lastName"
							type="text"
							value={formData.lastName}
							onChange={(e) => updateField('lastName', e.target.value)}
							placeholder="Dupont"
							required
							maxLength={50}
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
				</div>
			</section>

			{/* Geographic Section */}
			<section className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Secteur Géographique
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<div>
						<label
							htmlFor="city"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Ville principale *
						</label>
						<input
							id="city"
							type="text"
							value={formData.city}
							onChange={(e) => updateField('city', e.target.value)}
							placeholder="Paris"
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
					<div>
						<label
							htmlFor="postalCode"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Code postal *
						</label>
						<input
							id="postalCode"
							type="text"
							value={formData.postalCode}
							onChange={(e) => updateField('postalCode', e.target.value)}
							placeholder="75001"
							required
							maxLength={5}
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
					<div>
						<label
							htmlFor="interventionRadius"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Rayon d&apos;intervention (km) *
						</label>
						<input
							id="interventionRadius"
							type="number"
							value={formData.interventionRadius}
							onChange={(e) =>
								updateField('interventionRadius', parseInt(e.target.value) || 0)
							}
							min={1}
							max={350}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
				</div>
				<CoveredCitiesInput
					cities={formData.coveredCities}
					onChange={(cities: CoveredCity[]) => updateField('coveredCities', cities)}
				/>
			</section>

			{/* Professional Information Section */}
			<section className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Informations Professionnelles
				</h3>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="yearsExperience"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Années d&apos;expérience *
							</label>
							<input
								id="yearsExperience"
								type="number"
								value={formData.yearsExperience}
								onChange={(e) =>
									updateField('yearsExperience', parseInt(e.target.value) || 0)
								}
								min={0}
								max={50}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>
						<div>
							<label
								htmlFor="agentType"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Type d&apos;agent
							</label>
							<select
								id="agentType"
								value={formData.agentType}
								onChange={(e) =>
									updateField(
										'agentType',
										e.target.value as FormData['agentType']
									)
								}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								{AGENT_TYPES.map((type) => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label
							htmlFor="personalPitch"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Pitch personnel * ({formData.personalPitch.length}/1500 caractères, min 250)
						</label>
						<textarea
							id="personalPitch"
							value={formData.personalPitch}
							onChange={(e) => updateField('personalPitch', e.target.value)}
							placeholder="Décrivez votre parcours et vos compétences..."
							required
							minLength={250}
							maxLength={1500}
							rows={5}
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="tCard"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Carte professionnelle (T)
							</label>
							<input
								id="tCard"
								type="text"
								value={formData.tCard}
								onChange={(e) => updateField('tCard', e.target.value)}
								placeholder="CPI XXXX XXXX XXXX"
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>
						<div>
							<label
								htmlFor="siretNumber"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Numéro SIRET
							</label>
							<input
								id="siretNumber"
								type="text"
								value={formData.siretNumber}
								onChange={(e) => updateField('siretNumber', e.target.value)}
								placeholder="14 chiffres"
								maxLength={14}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Types de mandat acceptés
						</label>
						<div className="flex flex-wrap gap-3">
							{MANDATE_TYPES.map((type) => (
								<label
									key={type.value}
									className="flex items-center gap-2 cursor-pointer"
								>
									<input
										type="checkbox"
										checked={formData.mandateTypes.includes(
											type.value as 'simple' | 'exclusif' | 'co-mandat'
										)}
										onChange={() =>
											handleMandateTypeToggle(
												type.value as 'simple' | 'exclusif' | 'co-mandat'
											)
										}
										className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
									/>
									<span className="text-sm text-gray-700">{type.label}</span>
								</label>
							))}
						</div>
					</div>

					<div className="flex flex-wrap gap-6">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.collaborateWithAgents}
								onChange={(e) =>
									updateField('collaborateWithAgents', e.target.checked)
								}
								className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
							/>
							<span className="text-sm text-gray-700">
								Collabore avec d&apos;autres agents
							</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.shareCommission}
								onChange={(e) =>
									updateField('shareCommission', e.target.checked)
								}
								className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
							/>
							<span className="text-sm text-gray-700">
								Accepte le partage de commission
							</span>
						</label>
					</div>
				</div>
			</section>

			<div className="flex justify-end">
				<button
					type="submit"
					disabled={loading}
					className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? (
						<>
							<Loader2 className="animate-spin" size={20} />
							Enregistrement...
						</>
					) : (
						<>
							<Save size={20} />
							Enregistrer les modifications
						</>
					)}
				</button>
			</div>
		</form>
	);
}
