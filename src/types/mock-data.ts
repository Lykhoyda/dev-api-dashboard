/**
 * Shared type definitions for mock data generation and usage.
 * These types are used by both the data generation scripts and the app.
 */

import type { ApiKey } from '@/lib/apiKeys';

// Re-export ApiKey for convenience
export type { ApiKey };

/**
 * API endpoint path
 */
export type ApiEndpoint = string;

/**
 * Individual API request record
 */
export type ApiRequest = {
	id: string;
	keyId: string;
	endpoint: ApiEndpoint;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	statusCode: number;
	responseTimeMs: number;
	timestamp: string;
};

/**
 * Daily aggregated usage statistics
 */
export type UsageStats = {
	date: string;
	totalRequests: number;
	successCount: number;
	clientErrorCount: number;
	serverErrorCount: number;
	avgResponseTimeMs: number;
	maxResponseTimeMs: number;
};

/**
 * Status code distribution
 */
export type StatusCodeDistribution = {
	code: number;
	count: number;
	percentage: number;
};

/**
 * Per-endpoint statistics
 */
export type EndpointStats = {
	endpoint: ApiEndpoint;
	count: number;
	avgResponseTimeMs: number;
};

/**
 * Complete usage dataset for an environment
 */
export type UsageDataset = {
	environment: 'test' | 'production';
	startDate: string;
	endDate: string;
	requests: ApiRequest[];
	dailyStats: UsageStats[];
	statusDistribution: StatusCodeDistribution[];
	endpointStats: EndpointStats[];
};

/**
 * API keys data structure
 */
export type ApiKeysData = {
	keys: ApiKey[];
};
