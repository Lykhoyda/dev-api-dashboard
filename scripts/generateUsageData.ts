/**
 * Usage Data Generator
 *
 * Generates 14 days of realistic synthetic API usage data for test and production environments.
 *
 * Features:
 * - Weekday peaks (higher usage Monday-Friday)
 * - Business hour patterns (9am-5pm peaks)
 * - Realistic status code distribution (95% 2xx, 3% 4xx, 2% 5xx)
 * - Occasional error spikes for realism
 * - Multiple API keys represented
 * - Variety of endpoints
 * - Response time distribution (50-500ms typical, occasional outliers)
 *
 * Dataset size: ~14k rows, ~2.5MB JSON - optimized for "tiny" dataset requirement
 *
 * Usage:
 * ```bash
 * tsx scripts/generateUsageData.ts
 * ```
 *
 * Output:
 * - public/data/usage-test.json (~1.5MB)
 * - public/data/usage-production.json (~1MB)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
	ApiEndpoint,
	ApiRequest,
	EndpointStats,
	StatusCodeDistribution,
	UsageDataset,
	UsageStats
} from '../src/types/usage';

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

/**
 * Generate a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 */
function randomChoice<T>(array: T[]): T {
	return array[randomInt(0, array.length - 1)];
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday).
 */
function getDayOfWeek(date: Date): number {
	return date.getDay();
}

/**
 * Check if date is a weekday.
 */
function isWeekday(date: Date): boolean {
	const day = getDayOfWeek(date);
	return day >= 1 && day <= 5; // Monday-Friday
}

/**
 * Get hour multiplier for business hours pattern.
 * Higher values during business hours (9am-5pm).
 */
function getHourMultiplier(hour: number): number {
	// 12am-6am: 0.2x (very low traffic)
	if (hour >= 0 && hour < 6) return 0.2;
	// 6am-9am: 0.5x (ramping up)
	if (hour >= 6 && hour < 9) return 0.5;
	// 9am-12pm: 1.2x (morning peak)
	if (hour >= 9 && hour < 12) return 1.2;
	// 12pm-1pm: 0.8x (lunch dip)
	if (hour >= 12 && hour < 13) return 0.8;
	// 1pm-5pm: 1.5x (afternoon peak)
	if (hour >= 13 && hour < 17) return 1.5;
	// 5pm-8pm: 0.7x (wind down)
	if (hour >= 17 && hour < 20) return 0.7;
	// 8pm-12am: 0.3x (evening low)
	return 0.3;
}

/**
 * Generate a status code based on distribution.
 * 95% 2xx, 3% 4xx, 2% 5xx (with occasional error spikes).
 */
function generateStatusCode(isErrorSpike: boolean): number {
	if (isErrorSpike) {
		// During error spikes: 60% errors, 40% success
		const rand = Math.random();
		if (rand < 0.4) {
			return randomChoice(STATUS_CODES.success);
		}
		if (rand < 0.7) {
			return randomChoice(STATUS_CODES.clientError);
		}
		return randomChoice(STATUS_CODES.serverError);
	}

	// Normal distribution
	const rand = Math.random();
	if (rand < 0.95) {
		return randomChoice(STATUS_CODES.success);
	}
	if (rand < 0.98) {
		return randomChoice(STATUS_CODES.clientError);
	}
	return randomChoice(STATUS_CODES.serverError);
}

/**
 * Generate response time in milliseconds.
 * Typical: 50-500ms
 * Occasional outliers: up to 3000ms
 */
function generateResponseTime(): number {
	const rand = Math.random();

	// 90% typical (50-500ms)
	if (rand < 0.9) {
		return randomInt(50, 500);
	}

	// 8% slow (500-1500ms)
	if (rand < 0.98) {
		return randomInt(500, 1500);
	}

	// 2% outliers (1500-3000ms)
	return randomInt(1500, 3000);
}

/**
 * Generate requests for a single hour.
 */
function generateHourlyRequests(
	date: Date,
	hour: number,
	baseRequestsPerHour: number,
	keyIds: string[]
): ApiRequest[] {
	const requests: ApiRequest[] = [];

	// Calculate actual requests for this hour
	const dayMultiplier = isWeekday(date) ? 1.0 : 0.4; // Weekends have 40% of weekday traffic
	const hourMultiplier = getHourMultiplier(hour);
	const requestCount = Math.round(
		baseRequestsPerHour * dayMultiplier * hourMultiplier
	);

	// Check for error spike (5% chance per hour)
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

/**
 * Calculate daily statistics from requests.
 */
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

/**
 * Calculate status code distribution.
 */
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

/**
 * Calculate endpoint statistics.
 */
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

/**
 * Generate usage dataset for an environment.
 */
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
		`Generating ${environment} data from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`
	);

	for (let d = 0; d < days; d++) {
		const currentDate = new Date(startDate);
		currentDate.setDate(currentDate.getDate() + d);

		const dailyRequests: ApiRequest[] = [];

		// Generate requests for each hour of the day
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

		console.log(
			`  ${currentDate.toISOString().split('T')[0]}: ${dailyRequests.length} requests`
		);
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

	console.log(`  Total requests: ${requests.length}`);
	console.log(
		`  Success rate: ${((dataset.dailyStats.reduce((sum, s) => sum + s.successCount, 0) / requests.length) * 100).toFixed(2)}%`
	);

	return dataset;
}

/**
 * Main function to generate all usage data.
 */
function main() {
	console.log('🔄 Generating synthetic usage data...\n');

	// Sample API key IDs (these would come from keysRepository in real usage)
	const testKeyIds = [
		'key_test_001',
		'key_test_002',
		'key_test_003',
		'key_test_004',
		'key_test_005'
	];

	const prodKeyIds = ['key_prod_001', 'key_prod_002', 'key_prod_003'];

	// Generate test environment data (higher volume for testing)
	const testDataset = generateUsageDataset('test', 14, 50, testKeyIds);

	// Generate production environment data (lower volume, more realistic)
	const prodDataset = generateUsageDataset('production', 14, 20, prodKeyIds);

	// Ensure output directory exists
	const outputDir = join(process.cwd(), 'public', 'data');
	mkdirSync(outputDir, { recursive: true });

	// Write datasets to files
	const testPath = join(outputDir, 'usage-test.json');
	const prodPath = join(outputDir, 'usage-production.json');

	writeFileSync(testPath, JSON.stringify(testDataset, null, 2));
	writeFileSync(prodPath, JSON.stringify(prodDataset, null, 2));

	console.log(`\n✅ Data generation complete!`);
	console.log(`   Test data: ${testPath}`);
	console.log(`   Production data: ${prodPath}`);
	console.log(`\n📊 Summary:`);
	console.log(`   Test requests: ${testDataset.requests.length}`);
	console.log(`   Prod requests: ${prodDataset.requests.length}`);
}

main();
