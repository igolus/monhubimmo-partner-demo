'use client';

import { Plus, Trash2 } from 'lucide-react';
import { CoveredCity } from '@/lib/types';

interface CoveredCitiesInputProps {
	cities: CoveredCity[];
	onChange: (cities: CoveredCity[]) => void;
	errors?: { [key: string]: string };
}

export default function CoveredCitiesInput({
	cities,
	onChange,
	errors,
}: CoveredCitiesInputProps) {
	const addCity = () => {
		onChange([...cities, { city: '', postalCode: '' }]);
	};

	const removeCity = (index: number) => {
		if (cities.length <= 1) return;
		const newCities = cities.filter((_, i) => i !== index);
		onChange(newCities);
	};

	const updateCity = (
		index: number,
		field: keyof CoveredCity,
		value: string
	) => {
		const newCities = cities.map((city, i) =>
			i === index ? { ...city, [field]: value } : city
		);
		onChange(newCities);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-gray-700">
					Villes couvertes *
				</label>
				<button
					type="button"
					onClick={addCity}
					className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
				>
					<Plus size={16} />
					Ajouter une ville
				</button>
			</div>

			<div className="space-y-2">
				{cities.map((city, index) => (
					<div key={index} className="flex gap-2 items-start">
						<div className="flex-1">
							<input
								type="text"
								value={city.city}
								onChange={(e) => updateCity(index, 'city', e.target.value)}
								placeholder="Ville"
								className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
									errors?.[`coveredCities.${index}.city`]
										? 'border-red-300'
										: 'border-gray-300'
								}`}
							/>
							{errors?.[`coveredCities.${index}.city`] && (
								<p className="mt-1 text-xs text-red-600">
									{errors[`coveredCities.${index}.city`]}
								</p>
							)}
						</div>
						<div className="w-32">
							<input
								type="text"
								value={city.postalCode}
								onChange={(e) => updateCity(index, 'postalCode', e.target.value)}
								placeholder="Code postal"
								maxLength={5}
								className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
									errors?.[`coveredCities.${index}.postalCode`]
										? 'border-red-300'
										: 'border-gray-300'
								}`}
							/>
							{errors?.[`coveredCities.${index}.postalCode`] && (
								<p className="mt-1 text-xs text-red-600">
									{errors[`coveredCities.${index}.postalCode`]}
								</p>
							)}
						</div>
						<button
							type="button"
							onClick={() => removeCity(index)}
							disabled={cities.length <= 1}
							className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
						>
							<Trash2 size={18} />
						</button>
					</div>
				))}
			</div>

			<p className="text-xs text-gray-500">Minimum 1 ville requise</p>
		</div>
	);
}
