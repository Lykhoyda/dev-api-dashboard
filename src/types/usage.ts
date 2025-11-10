/**
 * HTTP status code ranges.
 */
export type StatusCodeRange = '2xx' | '4xx' | '5xx';

/**
 * API endpoints available in the system.
 */
export type ApiEndpoint =
	| '/api/users'
	| '/api/payments'
	| '/api/reports'
	| '/api/analytics'
	| '/api/auth'
	| '/api/webhooks';

/**
 * Individual API request record.
 *
 * Represents a single API call made with an API key.
 */
export interface ApiRequest {
	/**
	 * Unique identifier for this request.
	 */
	id: string;

	/**
	 * API key ID that made this request.
	 */
	keyId: string;

	/**
	 * Endpoint path that was called.
	 */
	endpoint: ApiEndpoint;

	/**
	 * HTTP method used.
	 */
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

	/**
	 * HTTP status code returned (e.g., 200, 404, 500).
	 */
	statusCode: number;

	/**
	 * Response time in milliseconds.
	 */
	responseTimeMs: number;

	/**
	 * Timestamp when the request was made (ISO 8601 format).
	 */
	timestamp: string;
}

/**
 * Aggregated usage statistics for a time period.
 *
 * Used for dashboard charts and analytics.
 */
export interface UsageStats {
	/**
	 * Date for this statistic (YYYY-MM-DD format).
	 */
	date: string;

	/**
	 * Total number of requests on this date.
	 */
	totalRequests: number;

	/**
	 * Number of successful requests (2xx status codes).
	 */
	successCount: number;

	/**
	 * Number of client error requests (4xx status codes).
	 */
	clientErrorCount: number;

	/**
	 * Number of server error requests (5xx status codes).
	 */
	serverErrorCount: number;

	/**
	 * Average response time in milliseconds.
	 */
	avgResponseTimeMs: number;

	/**
	 * Peak response time in milliseconds.
	 */
	maxResponseTimeMs: number;
}

/**
 * Status code distribution for analytics.
 */
export interface StatusCodeDistribution {
	/**
	 * HTTP status code (e.g., 200, 404, 500).
	 */
	code: number;

	/**
	 * Number of requests with this status code.
	 */
	count: number;

	/**
	 * Percentage of total requests.
	 */
	percentage: number;
}

/**
 * Endpoint usage statistics.
 */
export interface EndpointStats {
	/**
	 * Endpoint path.
	 */
	endpoint: ApiEndpoint;

	/**
	 * Number of requests to this endpoint.
	 */
	count: number;

	/**
	 * Average response time for this endpoint.
	 */
	avgResponseTimeMs: number;
}

/**
 * Complete usage dataset for an environment.
 */
export interface UsageDataset {
	/**
	 * Environment this dataset belongs to.
	 */
	environment: 'test' | 'production';

	/**
	 * Date range start (ISO 8601 format).
	 */
	startDate: string;

	/**
	 * Date range end (ISO 8601 format).
	 */
	endDate: string;

	/**
	 * All individual requests in this dataset.
	 */
	requests: ApiRequest[];

	/**
	 * Daily aggregated statistics.
	 */
	dailyStats: UsageStats[];

	/**
	 * Status code distribution across all requests.
	 */
	statusDistribution: StatusCodeDistribution[];

	/**
	 * Endpoint usage statistics.
	 */
	endpointStats: EndpointStats[];
}
