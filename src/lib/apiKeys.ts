export type ApiKey = {
	id: string;
	name: string;
	key: string;
	environment: 'test' | 'production';
	createdAt: string;
	revoked: boolean;
};

const STORAGE_KEY = 'api_keys';

/**
 * Generate a random API key with environment prefix.
 * Format: sk_test_xxx or sk_live_xxx
 */
function generateApiKey(environment: 'test' | 'production'): string {
	const prefix = environment === 'test' ? 'sk_test' : 'sk_live';
	const secret = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
	return `${prefix}_${secret}`;
}

/**
 * Mask an API key for display.
 * Shows: sk_test_••••••••last4
 *
 * Defensive: handles malformed keys gracefully by showing last 4 chars.
 */
export function maskApiKey(key: string): string {
	if (!key || key.length < 8) return '••••••••';

	const parts = key.split('_');
	if (parts.length >= 3) {
		// Standard format: sk_test_secret
		const prefix = `${parts[0]}_${parts[1]}_`;
		const secret = parts[2];
		return `${prefix}••••••••${secret.slice(-4)}`;
	}

	// Fallback for malformed keys: show last 4 only
	return `••••••••${key.slice(-4)}`;
}

/**
 * Load keys from localStorage.
 */
function loadKeys(): ApiKey[] {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

/**
 * Save keys to localStorage.
 * @throws {Error} If localStorage quota is exceeded or storage is unavailable
 */
function saveKeys(keys: ApiKey[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
	} catch (error) {
		console.error('Failed to save keys:', error);
		throw new Error(
			'Failed to save API keys. Your browser storage may be full or unavailable.'
		);
	}
}

/**
 * Get all API keys, sorted by creation date (newest first).
 */
export function getApiKeys(): ApiKey[] {
	const keys = loadKeys();
	return keys.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
}

/**
 * Create a new API key.
 *
 * @throws {Error} If name is empty after trimming
 */
export function createApiKey(
	name: string,
	environment: 'test' | 'production'
): ApiKey {
	const trimmedName = name.trim();
	if (!trimmedName) {
		throw new Error('API key name cannot be empty');
	}

	const keys = loadKeys();
	const newKey: ApiKey = {
		id: crypto.randomUUID(),
		name: trimmedName,
		key: generateApiKey(environment),
		environment,
		createdAt: new Date().toISOString(),
		revoked: false
	};
	keys.push(newKey);
	saveKeys(keys);
	return newKey;
}

/**
 * Revoke an API key.
 *
 * @returns True if key was found and revoked, false otherwise
 */
export function revokeApiKey(id: string): boolean {
	const keys = loadKeys();
	const key = keys.find((k) => k.id === id);
	if (key) {
		key.revoked = true;
		saveKeys(keys);
		return true;
	}
	return false;
}

/**
 * Regenerate an API key (creates new key value, keeps same ID and name).
 */
export function regenerateApiKey(id: string): ApiKey | null {
	const keys = loadKeys();
	const key = keys.find((k) => k.id === id);
	if (!key) return null;

	key.key = generateApiKey(key.environment);
	key.createdAt = new Date().toISOString();
	key.revoked = false;

	saveKeys(keys);
	return key;
}

/**
 * Delete an API key permanently.
 *
 * @returns True if key was found and deleted, false otherwise
 */
export function deleteApiKey(id: string): boolean {
	const keys = loadKeys();
	const originalLength = keys.length;
	const filtered = keys.filter((k) => k.id !== id);

	if (filtered.length < originalLength) {
		saveKeys(filtered);
		return true;
	}
	return false;
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (!navigator.clipboard) return false;
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

/**
 * Initialize sample API keys if none exist.
 * Called automatically on app load to provide demo data.
 */
export function initializeSampleKeys(): void {
	const existingKeys = loadKeys();
	if (existingKeys.length > 0) {
		return; // Keys already exist, don't overwrite
	}

	const now = new Date();
	const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
	const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
	const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	const sampleKeys: ApiKey[] = [
		{
			id: crypto.randomUUID(),
			name: 'Production Server Key',
			key: generateApiKey('test'),
			environment: 'test',
			createdAt: twoWeeksAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Staging Environment',
			key: generateApiKey('test'),
			environment: 'test',
			createdAt: oneMonthAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Legacy Mobile App',
			key: generateApiKey('test'),
			environment: 'test',
			createdAt: sixMonthsAgo.toISOString(),
			revoked: true
		},
		{
			id: crypto.randomUUID(),
			name: 'Local Dev Key',
			key: generateApiKey('test'),
			environment: 'test',
			createdAt: oneDayAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Production API Key',
			key: generateApiKey('production'),
			environment: 'production',
			createdAt: twoWeeksAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Production Backup',
			key: generateApiKey('production'),
			environment: 'production',
			createdAt: oneMonthAgo.toISOString(),
			revoked: false
		}
	];

	saveKeys(sampleKeys);
	console.log('✅ Initialized sample API keys');
}
