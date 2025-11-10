/**
 * Seed API Keys Script
 *
 * Creates sample API keys in localStorage for testing the API Keys page.
 * Run this script in browser console or via tsx.
 *
 * Usage:
 * ```bash
 * yarn tsx scripts/seedApiKeys.ts
 * ```
 *
 * Or in browser console:
 * ```js
 * // Copy and paste the function body from generateSeedKeys()
 * ```
 */

import type { ApiKey } from '../src/lib';

/**
 * Generate seed API keys for testing
 */
function generateSeedKeys(): ApiKey[] {
	const now = new Date();
	const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
	const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
	const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	return [
		{
			id: crypto.randomUUID(),
			name: 'Production Server Key',
			key: 'sk_test_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4a4b2',
			environment: 'test',
			createdAt: twoWeeksAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Staging Environment',
			key: 'sk_test_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6c8f5',
			environment: 'test',
			createdAt: oneMonthAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Legacy Mobile App',
			key: 'sk_test_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d49d1e',
			environment: 'test',
			createdAt: sixMonthsAgo.toISOString(),
			revoked: true
		},
		{
			id: crypto.randomUUID(),
			name: 'Local Dev Key',
			key: 'sk_test_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6b3a7',
			environment: 'test',
			createdAt: oneDayAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Production API Key',
			key: 'sk_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
			environment: 'production',
			createdAt: twoWeeksAgo.toISOString(),
			revoked: false
		},
		{
			id: crypto.randomUUID(),
			name: 'Production Backup',
			key: 'sk_live_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2',
			environment: 'production',
			createdAt: oneMonthAgo.toISOString(),
			revoked: false
		}
	];
}

/**
 * Seed localStorage with sample API keys
 */
function seedApiKeys() {
	const keys = generateSeedKeys();
	localStorage.setItem('api_keys', JSON.stringify(keys));
	console.log(`✅ Seeded ${keys.length} API keys to localStorage`);
	console.log('Keys by environment:');
	console.log(
		`  - Test: ${keys.filter((k) => k.environment === 'test').length}`
	);
	console.log(
		`  - Production: ${keys.filter((k) => k.environment === 'production').length}`
	);
}

// Run if executed directly
if (typeof window !== 'undefined' && window.localStorage) {
	seedApiKeys();
} else {
	console.log('⚠️  This script must be run in a browser environment');
	console.log('Copy the seedApiKeys() function to browser console');
}

export { generateSeedKeys, seedApiKeys };
