import { ApiConfig, CreatedUser, CreatedProperty } from './types';

const CONFIG_KEY = 'partnerDemo_config';
const USERS_KEY = 'partnerDemo_users';
const PROPERTIES_KEY = 'partnerDemo_properties';

export function getConfig(): ApiConfig | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem(CONFIG_KEY);
	if (!stored) return null;
	try {
		return JSON.parse(stored) as ApiConfig;
	} catch {
		return null;
	}
}

export function saveConfig(config: ApiConfig): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getUsers(): CreatedUser[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem(USERS_KEY);
	if (!stored) return [];
	try {
		return JSON.parse(stored) as CreatedUser[];
	} catch {
		return [];
	}
}

export function saveUser(user: CreatedUser): void {
	if (typeof window === 'undefined') return;
	const users = getUsers();
	users.push(user);
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function deleteUser(id: string): void {
	if (typeof window === 'undefined') return;
	const users = getUsers();
	const filtered = users.filter((u) => u.id !== id);
	localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
}

export function getProperties(): CreatedProperty[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem(PROPERTIES_KEY);
	if (!stored) return [];
	try {
		return JSON.parse(stored) as CreatedProperty[];
	} catch {
		return [];
	}
}

export function saveProperty(property: CreatedProperty): void {
	if (typeof window === 'undefined') return;
	const properties = getProperties();
	properties.push(property);
	localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
}

export function deleteProperty(id: string): void {
	if (typeof window === 'undefined') return;
	const properties = getProperties();
	const filtered = properties.filter((p) => p.id !== id);
	localStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
}
