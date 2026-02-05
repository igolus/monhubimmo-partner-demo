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

// Properties types
export interface PropertyOwner {
	id: string;
	firstName: string;
	lastName: string;
	userType: string;
	externalId?: string;
}

export interface PropertySummary {
	id: string;
	title: string;
	description: string;
	price: number;
	surface: number;
	propertyType: string;
	transactionType: string;
	city: string;
	postalCode: string;
	sector: string;
	rooms: number;
	bedrooms: number;
	mainImage: string | null;
	status: string;
	owner: PropertyOwner | null;
	createdAt: string;
	publishedAt: string;
}

export interface PropertyDetail extends PropertySummary {
	externalId?: string;
	address: string;
	coordinates: { lat: number; lon: number } | null;
	bathrooms: number;
	showerRooms: number;
	floor: number;
	totalFloors: number;
	hasParking: boolean;
	hasGarden: boolean;
	hasElevator: boolean;
	hasBalcony: boolean;
	hasTerrace: boolean;
	hasGarage: boolean;
	energyRating: string;
	gasEmissionClass: string;
	condition: string;
	yearBuilt: number;
	heatingType: string;
	orientation: string;
	annualCondoFees: number;
	galleryImages: string[] | Array<{ url: string; key: string }>;
	viewCount: number;
	favoriteCount: number;
}

export interface ListPropertiesResponse {
	success: boolean;
	properties?: PropertySummary[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}

export interface GetPropertyResponse {
	success: boolean;
	property?: PropertyDetail;
	error?: string;
	message?: string;
}

// Search Ads types
export interface SearchAdAuthor {
	id: string;
	firstName: string;
	lastName: string;
	userType: string;
}

export interface SearchAdSummary {
	id: string;
	title: string;
	description: string;
	propertyTypes: string[];
	propertyState: string[];
	projectType: string;
	location: {
		cities: string[];
		postalCodes: string[];
		maxDistance?: number;
		openToOtherAreas: boolean;
	};
	budget: {
		max: number;
		ideal: number;
		financingType: string;
		isSaleInProgress?: boolean;
		hasBankApproval: boolean;
	};
	minRooms: number;
	minBedrooms: number;
	minSurface: number;
	hasExterior: boolean;
	hasParking: boolean;
	desiredState: string[];
	priorities: {
		mustHaves: string[];
		niceToHaves: string[];
		dealBreakers: string[];
	};
	author: SearchAdAuthor | null;
	status: string;
	createdAt: string;
}

export interface SearchAdDetail extends SearchAdSummary {
	acceptedFloors: string;
	updatedAt: string;
}

export interface ListSearchAdsResponse {
	success: boolean;
	searchAds?: SearchAdSummary[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}

export interface GetSearchAdResponse {
	success: boolean;
	searchAd?: SearchAdDetail;
	error?: string;
	message?: string;
}

export interface PropertyFilters {
	city?: string;
	postalCode?: string;
	propertyType?: string;
	transactionType?: string;
	minPrice?: string;
	maxPrice?: string;
	minSurface?: string;
	maxSurface?: string;
	rooms?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: string;
}

export interface SearchAdFilters {
	city?: string;
	postalCode?: string;
	propertyType?: string;
	minBudget?: string;
	maxBudget?: string;
	authorType?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: string;
}

// Create Property types
export interface ImageUrl {
	url: string;
}

export interface CreatePropertyRequest {
	userId: string;
	externalId?: string;
	title: string;
	description: string;
	price: number;
	surface: number;
	propertyType: 'Appartement' | 'Maison' | 'Terrain' | 'Local commercial' | 'Bureaux';
	transactionType?: 'Vente' | 'Location';
	city: string;
	postalCode: string;
	sector: string;
	address?: string;
	mandateNumber?: string;
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	showerRooms?: number;
	floor?: number;
	totalFloors?: number;
	yearBuilt?: number;
	hasParking?: boolean;
	hasGarden?: boolean;
	hasElevator?: boolean;
	hasBalcony?: boolean;
	hasTerrace?: boolean;
	hasGarage?: boolean;
	energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Non soumis au DPE';
	gasEmissionClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Non soumis au DPE';
	condition?: 'new' | 'good' | 'refresh' | 'renovate';
	orientation?: 'Nord' | 'Sud' | 'Est' | 'Ouest' | 'Nord-Est' | 'Nord-Ouest' | 'Sud-Est' | 'Sud-Ouest';
	heatingType?: string;
	annualCondoFees?: number;
	agencyFeesAmount?: number;
	priceIncludingFees?: number;
	landArea?: number;
	levels?: number;
	parkingSpaces?: number;
	exterior?: ('garden' | 'balcony' | 'terrace' | 'courtyard' | 'none')[];
	availableFromDate?: string;
	mainImage?: ImageUrl;
	galleryImages?: ImageUrl[];
}

export interface CreatedProperty {
	id: string;
	externalId?: string;
	title: string;
	status: string;
	owner: {
		id: string;
		firstName: string;
		lastName: string;
		userType: string;
		network?: string;
		externalId?: string;
	};
	createdAt: string;
}

export interface CreatePropertyResponse {
	success: boolean;
	property?: CreatedProperty;
	error?: string;
	message?: string;
	details?: ApiErrorDetail[];
}

// Update Property types
export interface UpdatePropertyRequest {
	externalId?: string;
	title?: string;
	description?: string;
	price?: number;
	surface?: number;
	propertyType?: 'Appartement' | 'Maison' | 'Terrain' | 'Local commercial' | 'Bureaux';
	transactionType?: 'Vente' | 'Location';
	city?: string;
	postalCode?: string;
	sector?: string;
	address?: string;
	mandateNumber?: string;
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	showerRooms?: number;
	floor?: number;
	totalFloors?: number;
	yearBuilt?: number;
	hasParking?: boolean;
	hasGarden?: boolean;
	hasElevator?: boolean;
	hasBalcony?: boolean;
	hasTerrace?: boolean;
	hasGarage?: boolean;
	energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Non soumis au DPE';
	gasEmissionClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Non soumis au DPE';
	condition?: 'new' | 'good' | 'refresh' | 'renovate';
	orientation?: 'Nord' | 'Sud' | 'Est' | 'Ouest' | 'Nord-Est' | 'Nord-Ouest' | 'Sud-Est' | 'Sud-Ouest';
	heatingType?: string;
	annualCondoFees?: number;
	agencyFeesAmount?: number;
	priceIncludingFees?: number;
	landArea?: number;
	levels?: number;
	parkingSpaces?: number;
	exterior?: ('garden' | 'balcony' | 'terrace' | 'courtyard' | 'none')[];
	availableFromDate?: string;
	status?: 'draft' | 'active' | 'archived';
	// Image management
	mainImage?: ImageUrl;
	removeMainImage?: boolean;
	addGalleryImages?: ImageUrl[];
	removeGalleryImages?: string[];
}

export interface UpdatedProperty {
	id: string;
	externalId?: string;
	title: string;
	status: string;
	owner: {
		id: string;
		firstName: string;
		lastName: string;
		userType: string;
		network?: string;
		externalId?: string;
	};
	updatedAt: string;
}

export interface UpdatePropertyResponse {
	success: boolean;
	property?: UpdatedProperty;
	error?: string;
	message?: string;
	details?: ApiErrorDetail[];
}

// Partner Properties (includes draft, archived, etc.)
export interface PartnerPropertySummary {
	id: string;
	externalId?: string;
	title: string;
	description: string;
	price: number;
	surface: number;
	propertyType: string;
	transactionType: string;
	city: string;
	postalCode: string;
	sector: string;
	rooms?: number;
	bedrooms?: number;
	mainImage: string | null;
	galleryImages: Array<{ url: string; key: string }>;
	status: 'draft' | 'active' | 'sold' | 'rented' | 'archived';
	owner: {
		id: string;
		firstName: string;
		lastName: string;
		userType: string;
		externalId?: string;
		network?: string;
	} | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListPartnerPropertiesResponse {
	success: boolean;
	properties?: PartnerPropertySummary[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}

export interface PartnerPropertyFilters {
	status?: string;
	userId?: string;
	externalId?: string;
	sortBy?: string;
	sortOrder?: string;
}

// Create Search Ad types
export interface CreateSearchAdRequest {
	userId: string;
	externalId?: string;
	title: string;
	description: string;
	propertyTypes: ('house' | 'apartment' | 'land' | 'building' | 'commercial')[];
	location: {
		cities: string[];
		postalCodes?: string[];
		maxDistance?: number;
		openToOtherAreas?: boolean;
	};
	propertyState?: ('new' | 'old')[];
	projectType?: 'primary' | 'secondary' | 'investment';
	budget?: {
		max?: number;
		ideal?: number;
		financingType?: 'loan' | 'cash' | 'pending';
		isSaleInProgress?: boolean;
		hasBankApproval?: boolean;
	};
	minRooms?: number;
	minBedrooms?: number;
	minSurface?: number;
	hasExterior?: boolean;
	hasParking?: boolean;
	acceptedFloors?: string;
	desiredState?: ('new' | 'good' | 'refresh' | 'renovate')[];
	priorities?: {
		mustHaves?: string[];
		niceToHaves?: string[];
		dealBreakers?: string[];
	};
}

export interface CreatedSearchAd {
	id: string;
	externalId?: string;
	title: string;
	status: string;
	author: {
		id: string;
		firstName: string;
		lastName: string;
		userType: string;
		externalId?: string;
	};
	createdAt: string;
}

export interface CreateSearchAdResponse {
	success: boolean;
	searchAd?: CreatedSearchAd;
	error?: string;
	message?: string;
	details?: ApiErrorDetail[];
}

// Update Search Ad types
export interface UpdateSearchAdRequest {
	externalId?: string;
	title?: string;
	description?: string;
	propertyTypes?: ('house' | 'apartment' | 'land' | 'building' | 'commercial')[];
	location?: {
		cities?: string[];
		postalCodes?: string[];
		maxDistance?: number;
		openToOtherAreas?: boolean;
	};
	propertyState?: ('new' | 'old')[];
	projectType?: 'primary' | 'secondary' | 'investment';
	budget?: {
		max?: number;
		ideal?: number;
		financingType?: 'loan' | 'cash' | 'pending';
		isSaleInProgress?: boolean;
		hasBankApproval?: boolean;
	};
	minRooms?: number;
	minBedrooms?: number;
	minSurface?: number;
	hasExterior?: boolean;
	hasParking?: boolean;
	acceptedFloors?: string;
	desiredState?: ('new' | 'good' | 'refresh' | 'renovate')[];
	priorities?: {
		mustHaves?: string[];
		niceToHaves?: string[];
		dealBreakers?: string[];
	};
	status?: 'active' | 'paused' | 'archived';
}

export interface UpdatedSearchAd {
	id: string;
	externalId?: string;
	title: string;
	status: string;
	author: {
		id: string;
		firstName: string;
		lastName: string;
		userType: string;
		externalId?: string;
	};
	updatedAt: string;
}

export interface UpdateSearchAdResponse {
	success: boolean;
	searchAd?: UpdatedSearchAd;
	error?: string;
	message?: string;
	details?: ApiErrorDetail[];
}

// Partner Search Ads (includes paused, archived, etc.)
export interface PartnerSearchAdSummary extends SearchAdSummary {
	externalId?: string;
	updatedAt: string;
	author: {
		id: string;
		firstName: string;
		lastName: string;
		userType: string;
		externalId?: string;
	} | null;
}

export interface ListPartnerSearchAdsResponse {
	success: boolean;
	searchAds?: PartnerSearchAdSummary[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}

export interface PartnerSearchAdFilters {
	status?: string;
	userId?: string;
	externalId?: string;
	sortBy?: string;
	sortOrder?: string;
}
