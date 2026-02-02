'use client';

import { AlertCircle, XCircle } from 'lucide-react';

interface ErrorDisplayProps {
	error: string;
	message?: string;
	details?: { field: string; message: string }[];
	onClose?: () => void;
}

export default function ErrorDisplay({
	error,
	message,
	details,
	onClose,
}: ErrorDisplayProps) {
	return (
		<div className="bg-red-50 border border-red-200 rounded-lg p-4">
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-3">
					<AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
					<div>
						<h4 className="font-medium text-red-800">{error}</h4>
						{message && <p className="mt-1 text-sm text-red-700">{message}</p>}

						{details && details.length > 0 && (
							<div className="mt-3">
								<p className="text-sm font-medium text-red-800 mb-2">
									Détails des erreurs :
								</p>
								<ul className="space-y-1">
									{details.map((detail, index) => (
										<li
											key={index}
											className="text-sm text-red-700 flex items-start gap-2"
										>
											<span className="font-mono text-xs bg-red-100 px-1.5 py-0.5 rounded">
												{detail.field}
											</span>
											<span>{detail.message}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>

				{onClose && (
					<button
						onClick={onClose}
						className="text-red-400 hover:text-red-600"
					>
						<XCircle size={20} />
					</button>
				)}
			</div>
		</div>
	);
}
