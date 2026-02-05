import {
	ApiConfig,
	CreateUserRequest,
	CreateUserResponse,
	CreatedUser,
	HealthResponse,
	ListUsersResponse,
	GetUserResponse,
	UserDetails,
	UpdateUserRequest,
	UpdateUserResponse,
	ListPropertiesResponse,
	GetPropertyResponse,
	PropertySummary,
	PropertyDetail,
	PropertyFilters,
	ListSearchAdsResponse,
	GetSearchAdResponse,
	SearchAdSummary,
	SearchAdDetail,
	SearchAdFilters,
	CreatePropertyRequest,
	CreatePropertyResponse,
	CreatedProperty,
	UpdatePropertyRequest,
	UpdatePropertyResponse,
	UpdatedProperty,
	ListPartnerPropertiesResponse,
	PartnerPropertySummary,
	PartnerPropertyFilters,
	CreateSearchAdRequest,
	CreateSearchAdResponse,
	CreatedSearchAd,
	UpdateSearchAdRequest,
	UpdateSearchAdResponse,
	UpdatedSearchAd,
	ListPartnerSearchAdsResponse,
	PartnerSearchAdSummary,
	PartnerSearchAdFilters,
} from './types';

export interface TestConnectionResult {
	success: boolean;
	partnerId?: string;
	partnerName?: string;
	error?: string;
}

export interface CreateUserResult {
	success: boolean;
	user?: CreateUserResponse['user'];
	error?: string;
	message?: string;
	details?: { field: string; message: string }[];
}

export interface ListUsersResult {
	success: boolean;
	users?: CreatedUser[];
	pagination?: ListUsersResponse['pagination'];
	error?: string;
}

export async function testConnection(
	config: ApiConfig
): Promise<TestConnectionResult> {
	try {
		const response = await fetch(`${config.apiUrl}/api/external/v1/health`, {
			method: 'GET',
			headers: {
				'X-API-Key': config.apiKey,
			},
		});

		const data: HealthResponse = await response.json();

		if (response.ok && data.success && data.partner) {
			return {
				success: true,
				partnerId: data.partner.id,
				partnerName: data.partner.name,
			};
		}

		return {
			success: false,
			error: data.partner ? 'API not enabled for this partner' : 'Invalid API key',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Connection failed',
		};
	}
}

export async function createUser(
	config: ApiConfig,
	data: CreateUserRequest
): Promise<CreateUserResult> {
	try {
		const response = await fetch(`${config.apiUrl}/api/external/v1/users`, {
			method: 'POST',
			headers: {
				'X-API-Key': config.apiKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const result: CreateUserResponse = await response.json();

		if (response.ok && result.success && result.user) {
			return {
				success: true,
				user: result.user,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to create user',
			message: result.message,
			details: result.details,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export async function listUsers(
	config: ApiConfig,
	page: number = 1,
	limit: number = 20
): Promise<ListUsersResult> {
	try {
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/users?page=${page}&limit=${limit}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: ListUsersResponse = await response.json();

		if (response.ok && result.success && result.users) {
			return {
				success: true,
				users: result.users,
				pagination: result.pagination,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch users',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface GetUserResult {
	success: boolean;
	user?: UserDetails;
	error?: string;
}

export async function getUser(
	config: ApiConfig,
	userId: string
): Promise<GetUserResult> {
	try {
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/users/${userId}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: GetUserResponse = await response.json();

		if (response.ok && result.success && result.user) {
			return {
				success: true,
				user: result.user,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch user',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface UpdateUserResult {
	success: boolean;
	user?: CreatedUser;
	error?: string;
	message?: string;
	details?: { field: string; message: string }[];
}

export async function updateUser(
	config: ApiConfig,
	userId: string,
	data: UpdateUserRequest
): Promise<UpdateUserResult> {
	try {
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/users/${userId}`,
			{
				method: 'PUT',
				headers: {
					'X-API-Key': config.apiKey,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		);

		const result: UpdateUserResponse = await response.json();

		if (response.ok && result.success && result.user) {
			return {
				success: true,
				user: result.user,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to update user',
			message: result.message,
			details: result.details,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface ToggleUserStatusResult {
	success: boolean;
	user?: CreatedUser;
	error?: string;
	message?: string;
}

export async function toggleUserStatus(
	config: ApiConfig,
	userId: string,
	activate: boolean
): Promise<ToggleUserStatusResult> {
	try {
		const action = activate ? 'activate' : 'deactivate';
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/users/${userId}/${action}`,
			{
				method: 'POST',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result = await response.json();

		if (response.ok && result.success) {
			return {
				success: true,
				user: result.user,
				message: result.message,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to update user status',
			message: result.message,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

// Properties API

export interface CreatePropertyResult {
	success: boolean;
	property?: CreatedProperty;
	error?: string;
	message?: string;
	details?: { field: string; message: string }[];
}

export async function createProperty(
	config: ApiConfig,
	data: CreatePropertyRequest
): Promise<CreatePropertyResult> {
	try {
		const response = await fetch(`${config.apiUrl}/api/external/v1/properties`, {
			method: 'POST',
			headers: {
				'X-API-Key': config.apiKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const result: CreatePropertyResponse = await response.json();

		if (response.ok && result.success && result.property) {
			return {
				success: true,
				property: result.property,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to create property',
			message: result.message,
			details: result.details,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface ListPropertiesResult {
	success: boolean;
	properties?: PropertySummary[];
	pagination?: ListPropertiesResponse['pagination'];
	error?: string;
}

export async function listProperties(
	config: ApiConfig,
	filters: PropertyFilters = {},
	page: number = 1,
	limit: number = 20
): Promise<ListPropertiesResult> {
	try {
		const params = new URLSearchParams();
		params.set('page', String(page));
		params.set('limit', String(limit));

		Object.entries(filters).forEach(([key, value]) => {
			if (value) params.set(key, value);
		});

		const response = await fetch(
			`${config.apiUrl}/api/external/v1/properties?${params.toString()}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: ListPropertiesResponse = await response.json();

		if (response.ok && result.success && result.properties) {
			return {
				success: true,
				properties: result.properties,
				pagination: result.pagination,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch properties',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface GetPropertyResult {
	success: boolean;
	property?: PropertyDetail;
	error?: string;
}

export async function getProperty(
	config: ApiConfig,
	propertyId: string
): Promise<GetPropertyResult> {
	try {
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/properties/${propertyId}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: GetPropertyResponse = await response.json();

		if (response.ok && result.success && result.property) {
			return {
				success: true,
				property: result.property,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch property',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface ListPartnerPropertiesResult {
	success: boolean;
	properties?: PartnerPropertySummary[];
	pagination?: ListPartnerPropertiesResponse['pagination'];
	error?: string;
}

export async function listPartnerProperties(
	config: ApiConfig,
	filters: PartnerPropertyFilters = {},
	page: number = 1,
	limit: number = 20
): Promise<ListPartnerPropertiesResult> {
	try {
		const params = new URLSearchParams();
		params.set('page', String(page));
		params.set('limit', String(limit));

		Object.entries(filters).forEach(([key, value]) => {
			if (value) params.set(key, value);
		});

		const response = await fetch(
			`${config.apiUrl}/api/external/v1/properties/mine?${params.toString()}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: ListPartnerPropertiesResponse = await response.json();

		if (response.ok && result.success && result.properties) {
			return {
				success: true,
				properties: result.properties,
				pagination: result.pagination,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch partner properties',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface UpdatePropertyResult {
	success: boolean;
	property?: UpdatedProperty;
	error?: string;
	message?: string;
	details?: { field: string; message: string }[];
}

export async function updateProperty(
	config: ApiConfig,
	propertyId: string,
	data: UpdatePropertyRequest
): Promise<UpdatePropertyResult> {
	try {
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/properties/${propertyId}`,
			{
				method: 'PUT',
				headers: {
					'X-API-Key': config.apiKey,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		);

		const result: UpdatePropertyResponse = await response.json();

		if (response.ok && result.success && result.property) {
			return {
				success: true,
				property: result.property,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to update property',
			message: result.message,
			details: result.details,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

// Search Ads API

export interface ListSearchAdsResult {
	success: boolean;
	searchAds?: SearchAdSummary[];
	pagination?: ListSearchAdsResponse['pagination'];
	error?: string;
}

export async function listSearchAds(
	config: ApiConfig,
	filters: SearchAdFilters = {},
	page: number = 1,
	limit: number = 20
): Promise<ListSearchAdsResult> {
	try {
		const params = new URLSearchParams();
		params.set('page', String(page));
		params.set('limit', String(limit));

		Object.entries(filters).forEach(([key, value]) => {
			if (value) params.set(key, value);
		});

		const response = await fetch(
			`${config.apiUrl}/api/external/v1/search-ads?${params.toString()}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: ListSearchAdsResponse = await response.json();

		if (response.ok && result.success && result.searchAds) {
			return {
				success: true,
				searchAds: result.searchAds,
				pagination: result.pagination,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch search ads',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

export interface GetSearchAdResult {
	success: boolean;
	searchAd?: SearchAdDetail;
	error?: string;
}

export async function getSearchAd(
	config: ApiConfig,
	searchAdId: string
): Promise<GetSearchAdResult> {
	try {
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/search-ads/${searchAdId}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: GetSearchAdResponse = await response.json();

		if (response.ok && result.success && result.searchAd) {
			return {
				success: true,
				searchAd: result.searchAd,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch search ad',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

// Create Search Ad API

export interface CreateSearchAdResult {
	success: boolean;
	searchAd?: CreatedSearchAd;
	error?: string;
	message?: string;
	details?: { field: string; message: string }[];
}

export async function createSearchAd(
	config: ApiConfig,
	data: CreateSearchAdRequest
): Promise<CreateSearchAdResult> {
	try {
		const response = await fetch(`${config.apiUrl}/api/external/v1/search-ads`, {
			method: 'POST',
			headers: {
				'X-API-Key': config.apiKey,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const result: CreateSearchAdResponse = await response.json();

		if (response.ok && result.success && result.searchAd) {
			return {
				success: true,
				searchAd: result.searchAd,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to create search ad',
			message: result.message,
			details: result.details,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

// Update Search Ad API

export interface UpdateSearchAdResult {
	success: boolean;
	searchAd?: UpdatedSearchAd;
	error?: string;
	message?: string;
	details?: { field: string; message: string }[];
}

export async function updateSearchAd(
	config: ApiConfig,
	searchAdId: string,
	data: UpdateSearchAdRequest
): Promise<UpdateSearchAdResult> {
	try {
		const response = await fetch(
			`${config.apiUrl}/api/external/v1/search-ads/${searchAdId}`,
			{
				method: 'PUT',
				headers: {
					'X-API-Key': config.apiKey,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			}
		);

		const result: UpdateSearchAdResponse = await response.json();

		if (response.ok && result.success && result.searchAd) {
			return {
				success: true,
				searchAd: result.searchAd,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to update search ad',
			message: result.message,
			details: result.details,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}

// List Partner Search Ads API

export interface ListPartnerSearchAdsResult {
	success: boolean;
	searchAds?: PartnerSearchAdSummary[];
	pagination?: ListPartnerSearchAdsResponse['pagination'];
	error?: string;
}

export async function listPartnerSearchAds(
	config: ApiConfig,
	filters: PartnerSearchAdFilters = {},
	page: number = 1,
	limit: number = 20
): Promise<ListPartnerSearchAdsResult> {
	try {
		const params = new URLSearchParams();
		params.set('page', String(page));
		params.set('limit', String(limit));

		Object.entries(filters).forEach(([key, value]) => {
			if (value) params.set(key, value);
		});

		const response = await fetch(
			`${config.apiUrl}/api/external/v1/search-ads/mine?${params.toString()}`,
			{
				method: 'GET',
				headers: {
					'X-API-Key': config.apiKey,
				},
			}
		);

		const result: ListPartnerSearchAdsResponse = await response.json();

		if (response.ok && result.success && result.searchAds) {
			return {
				success: true,
				searchAds: result.searchAds,
				pagination: result.pagination,
			};
		}

		return {
			success: false,
			error: result.error || 'Failed to fetch partner search ads',
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Request failed',
		};
	}
}
