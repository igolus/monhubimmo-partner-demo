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
