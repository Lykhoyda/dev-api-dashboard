/**
 * Unified Mock Data Generator
 *
 * Generates all mock data for the application:
 * - API keys (test and production)
 * - Usage data (14 days, realistic patterns)
 *
 * This ensures referential integrity between keys and usage data.
 *
 * Usage:
 * ```bash
 * yarn seed:all
 * ```
 *
 * Output:
 * - public/data/api-keys.json
 * - public/data/usage-test.json
 * - public/data/usage-production.json
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateApiKey } from '../src/lib/apiKeys.js';
import type {
	ApiEndpoint,
	ApiKey,
	ApiKeysData,
	ApiRequest,
	EndpointStats,
	StatusCodeDistribution,
	UsageDataset,
	UsageStats
} from '../src/types/mock-data.js';

const ENDPOINTS: ApiEndpoint[] = [
	'/api/users',
	'/api/payments',
	'/api/reports',
	'/api/analytics',
	'/api/auth',
	'/api/webhooks'
];

const METHODS: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = [
	'GET',
	'POST',
	'PUT',
	'DELETE',
	'PATCH'
];

const STATUS_CODES = {
	success: [200, 201, 204],
	clientError: [400, 401, 403, 404, 422, 429],
	serverError: [500, 502, 503, 504]
};

// ============================================================================
// Utility Functions
// ============================================================================

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
	return array[randomInt(0, array.length - 1)];
}

function getDayOfWeek(date: Date): number {
	return date.getDay();
}

function isWeekday(date: Date): boolean {
	const day = getDayOfWeek(date);
	return day >= 1 && day <= 5; // Monday-Friday
}

function getHourMultiplier(hour: number): number {
	if (hour >= 0 && hour < 6) return 0.2;
	if (hour >= 6 && hour < 9) return 0.5;
	if (hour >= 9 && hour < 12) return 1.2;
	if (hour >= 12 && hour < 13) return 0.8;
	if (hour >= 13 && hour < 17) return 1.5;
	if (hour >= 17 && hour < 20) return 0.7;
	return 0.3;
}

function generateStatusCode(isErrorSpike: boolean): number {
	if (isErrorSpike) {
		const rand = Math.random();
		if (rand < 0.4) return randomChoice(STATUS_CODES.success);
		if (rand < 0.7) return randomChoice(STATUS_CODES.clientError);
		return randomChoice(STATUS_CODES.serverError);
	}

	const rand = Math.random();
	if (rand < 0.95) return randomChoice(STATUS_CODES.success);
	if (rand < 0.98) return randomChoice(STATUS_CODES.clientError);
	return randomChoice(STATUS_CODES.serverError);
}

function generateResponseTime(): number {
	const rand = Math.random();
	if (rand < 0.9) return randomInt(50, 500);
	if (rand < 0.98) return randomInt(500, 1500);
	return randomInt(1500, 3000);
}

// ============================================================================
// API Key Generation
// ============================================================================

function generateApiKeys(): ApiKey[] {
	const now = new Date();
	const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
	const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
	const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	return [
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
}

// ============================================================================
// Usage Data Generation
// ============================================================================

function generateHourlyRequests(
	date: Date,
	hour: number,
	baseRequestsPerHour: number,
	keyIds: string[]
): ApiRequest[] {
	const requests: ApiRequest[] = [];

	const dayMultiplier = isWeekday(date) ? 1.0 : 0.4;
	const hourMultiplier = getHourMultiplier(hour);
	const requestCount = Math.round(
		baseRequestsPerHour * dayMultiplier * hourMultiplier
	);

	const isErrorSpike = Math.random() < 0.05;

	for (let i = 0; i < requestCount; i++) {
		const timestamp = new Date(date);
		timestamp.setHours(hour, randomInt(0, 59), randomInt(0, 59));

		const request: ApiRequest = {
			id: `req_${Date.now()}_${randomInt(10000, 99999)}`,
			keyId: randomChoice(keyIds),
			endpoint: randomChoice(ENDPOINTS),
			method: randomChoice(METHODS),
			statusCode: generateStatusCode(isErrorSpike),
			responseTimeMs: generateResponseTime(),
			timestamp: timestamp.toISOString()
		};

		requests.push(request);
	}

	return requests;
}

function calculateDailyStats(date: Date, requests: ApiRequest[]): UsageStats {
	if (requests.length === 0) {
		return {
			date: date.toISOString().split('T')[0],
			totalRequests: 0,
			successCount: 0,
			clientErrorCount: 0,
			serverErrorCount: 0,
			avgResponseTimeMs: 0,
			maxResponseTimeMs: 0
		};
	}

	const successCount = requests.filter(
		(r) => r.statusCode >= 200 && r.statusCode < 300
	).length;
	const clientErrorCount = requests.filter(
		(r) => r.statusCode >= 400 && r.statusCode < 500
	).length;
	const serverErrorCount = requests.filter((r) => r.statusCode >= 500).length;

	const totalResponseTime = requests.reduce(
		(sum, r) => sum + r.responseTimeMs,
		0
	);
	const avgResponseTimeMs = Math.round(totalResponseTime / requests.length);
	const maxResponseTimeMs = Math.max(...requests.map((r) => r.responseTimeMs));

	return {
		date: date.toISOString().split('T')[0],
		totalRequests: requests.length,
		successCount,
		clientErrorCount,
		serverErrorCount,
		avgResponseTimeMs,
		maxResponseTimeMs
	};
}

function calculateStatusDistribution(
	requests: ApiRequest[]
): StatusCodeDistribution[] {
	const counts = new Map<number, number>();

	for (const request of requests) {
		counts.set(request.statusCode, (counts.get(request.statusCode) || 0) + 1);
	}

	const total = requests.length;
	const distribution: StatusCodeDistribution[] = [];

	for (const [code, count] of Array.from(counts.entries())) {
		distribution.push({
			code,
			count,
			percentage: Math.round((count / total) * 10000) / 100
		});
	}

	return distribution.sort((a, b) => b.count - a.count);
}

function calculateEndpointStats(requests: ApiRequest[]): EndpointStats[] {
	const endpointData = new Map<
		ApiEndpoint,
		{ count: number; totalResponseTime: number }
	>();

	for (const request of requests) {
		const existing = endpointData.get(request.endpoint) || {
			count: 0,
			totalResponseTime: 0
		};
		endpointData.set(request.endpoint, {
			count: existing.count + 1,
			totalResponseTime: existing.totalResponseTime + request.responseTimeMs
		});
	}

	const stats: EndpointStats[] = [];
	for (const [endpoint, data] of Array.from(endpointData.entries())) {
		stats.push({
			endpoint,
			count: data.count,
			avgResponseTimeMs: Math.round(data.totalResponseTime / data.count)
		});
	}

	return stats.sort((a, b) => b.count - a.count);
}

function generateUsageDataset(
	environment: 'test' | 'production',
	days: number,
	baseRequestsPerHour: number,
	keyIds: string[]
): UsageDataset {
	const requests: ApiRequest[] = [];
	const dailyStats: UsageStats[] = [];

	const endDate = new Date();
	const startDate = new Date(endDate);
	startDate.setDate(startDate.getDate() - days);

	console.log(
		`  ${environment}: Generating from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`
	);

	for (let d = 0; d < days; d++) {
		const currentDate = new Date(startDate);
		currentDate.setDate(currentDate.getDate() + d);

		const dailyRequests: ApiRequest[] = [];

		for (let hour = 0; hour < 24; hour++) {
			const hourlyRequests = generateHourlyRequests(
				currentDate,
				hour,
				baseRequestsPerHour,
				keyIds
			);
			dailyRequests.push(...hourlyRequests);
		}

		requests.push(...dailyRequests);
		dailyStats.push(calculateDailyStats(currentDate, dailyRequests));
	}

	const dataset: UsageDataset = {
		environment,
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		requests,
		dailyStats,
		statusDistribution: calculateStatusDistribution(requests),
		endpointStats: calculateEndpointStats(requests)
	};

	console.log(`    Total requests: ${requests.length}`);
	console.log(
		`    Success rate: ${((dataset.dailyStats.reduce((sum, s) => sum + s.successCount, 0) / requests.length) * 100).toFixed(2)}%`
	);

	return dataset;
}

// ============================================================================
// Main
// ============================================================================

function main() {
	console.log('🔄 Generating all mock data...\n');

	// Step 1: Generate API keys
	console.log('🔑 Generating API keys...');
	const apiKeys = generateApiKeys();
	console.log(`   Generated ${apiKeys.length} keys`);
	console.log(`   - Test: ${apiKeys.filter((k) => k.environment === 'test').length}`);
	console.log(
		`   - Production: ${apiKeys.filter((k) => k.environment === 'production').length}`
	);
	console.log(
		`   - Active: ${apiKeys.filter((k) => !k.revoked).length}\n`
	);

	// Step 2: Generate usage data using the generated key IDs
	console.log('📊 Generating usage data...');

	const testKeyIds = apiKeys
		.filter((k) => k.environment === 'test' && !k.revoked)
		.map((k) => k.id);

	const prodKeyIds = apiKeys
		.filter((k) => k.environment === 'production' && !k.revoked)
		.map((k) => k.id);

	const testDataset = generateUsageDataset('test', 14, 50, testKeyIds);
	const prodDataset = generateUsageDataset('production', 14, 20, prodKeyIds);

	// Step 3: Ensure output directory exists
	const outputDir = join(process.cwd(), 'public', 'data');
	mkdirSync(outputDir, { recursive: true });

	// Step 4: Write all data to files
	console.log('\n💾 Writing files...');

	const keysData: ApiKeysData = { keys: apiKeys };

	const keysPath = join(outputDir, 'api-keys.json');
	const testPath = join(outputDir, 'usage-test.json');
	const prodPath = join(outputDir, 'usage-production.json');

	writeFileSync(keysPath, JSON.stringify(keysData, null, 2));
	writeFileSync(testPath, JSON.stringify(testDataset, null, 2));
	writeFileSync(prodPath, JSON.stringify(prodDataset, null, 2));

	console.log(`   ✓ ${keysPath}`);
	console.log(`   ✓ ${testPath}`);
	console.log(`   ✓ ${prodPath}`);

	console.log('\n✅ Mock data generation complete!');
	console.log('\n📊 Summary:');
	console.log(`   API keys: ${apiKeys.length}`);
	console.log(`   Test requests: ${testDataset.requests.length}`);
	console.log(`   Prod requests: ${prodDataset.requests.length}`);
}

main();
