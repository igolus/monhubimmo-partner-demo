export interface ApiConfig {
	apiKey: string;
	apiUrl: string;
	jwtSecret?: string;
	partnerId?: string;
}

export interface CoveredCity {
	city: string;
	postalCode: string;
}

export interface ProfessionalInfo {
	city: string;
	postalCode: string;
	interventionRadius: number;
	coveredCities: CoveredCity[];
	yearsExperience: number;
	personalPitch: string;
	agentType?: 'independent' | 'commercial' | 'employee';
	tCard?: string;
	network?: string;
	siretNumber?: string;
	mandateTypes?: ('simple' | 'exclusif' | 'co-mandat')[];
	collaborateWithAgents?: boolean;
	shareCommission?: boolean;
}

export interface CreateUserRequest {
	externalId?: string;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	professionalInfo: ProfessionalInfo;
}

export interface CreatedUser {
	id: string;
	externalId?: string;
	email: string;
	firstName: string;
	lastName: string;
	isValidated: boolean;
	inviteSent: boolean;
	createdAt: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	details?: ApiErrorDetail[];
}

export interface ApiErrorDetail {
	field: string;
	message: string;
}

export interface ApiError {
	success: false;
	error: string;
	message?: string;
	details?: ApiErrorDetail[];
}

export interface HealthResponse {
	success: boolean;
	partner?: {
		id: string;
		name: string;
		apiEnabled: boolean;
	};
}

export interface CreateUserResponse {
	success: boolean;
	user?: CreatedUser;
	error?: string;
	message?: string;
	details?: ApiErrorDetail[];
}

export interface ListUsersResponse {
	success: boolean;
	users?: CreatedUser[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
	message?: string;
}

export interface UserDetails extends CreatedUser {
	phone?: string;
	professionalInfo?: ProfessionalInfo | null;
}

export interface GetUserResponse {
	success: boolean;
	user?: UserDetails;
	error?: string;
	message?: string;
}

export interface UpdateUserRequest {
	externalId?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	professionalInfo?: Partial<ProfessionalInfo>;
}

export interface UpdateUserResponse {
	success: boolean;
	user?: CreatedUser;
	error?: string;
	message?: string;
	details?: ApiErrorDetail[];
}
