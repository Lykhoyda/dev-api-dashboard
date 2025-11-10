# Synthetic Usage Data

This directory contains synthetically generated API usage data for test and production environments.

## Files

- **usage-test.json** (4.6MB) - Test environment usage data (30 days, ~20,000 requests)
- **usage-production.json** (1.9MB) - Production environment usage data (30 days, ~8,000 requests)

## Data Structure

### UsageDataset

```typescript
{
  environment: 'test' | 'production',
  startDate: string,  // ISO 8601 format
  endDate: string,    // ISO 8601 format
  requests: ApiRequest[],
  dailyStats: UsageStats[],
  statusDistribution: StatusCodeDistribution[],
  endpointStats: EndpointStats[]
}
```

### ApiRequest

Individual API call record:

```typescript
{
  id: string,                    // Unique request ID
  keyId: string,                 // API key that made the request
  endpoint: ApiEndpoint,         // Endpoint path (e.g., '/api/users')
  method: 'GET' | 'POST' | ...,  // HTTP method
  statusCode: number,            // HTTP status code
  responseTimeMs: number,        // Response time in milliseconds
  timestamp: string              // ISO 8601 timestamp
}
```

### UsageStats

Daily aggregated statistics:

```typescript
{
  date: string,                  // YYYY-MM-DD format
  totalRequests: number,         // Total requests on this day
  successCount: number,          // 2xx responses
  clientErrorCount: number,      // 4xx responses
  serverErrorCount: number,      // 5xx responses
  avgResponseTimeMs: number,     // Average response time
  maxResponseTimeMs: number      // Peak response time
}
```

### StatusCodeDistribution

HTTP status code frequency:

```typescript
{
  code: number,                  // HTTP status code (e.g., 200, 404, 500)
  count: number,                 // Number of requests with this code
  percentage: number             // Percentage of total requests
}
```

### EndpointStats

Per-endpoint usage statistics:

```typescript
{
  endpoint: ApiEndpoint,         // Endpoint path
  count: number,                 // Number of requests
  avgResponseTimeMs: number      // Average response time
}
```

## Data Patterns

### Realistic Traffic Patterns

- **Weekday peaks**: Monday-Friday have 2.5x more traffic than weekends
- **Business hours**: 9am-5pm have 1.5x traffic multiplier
- **Night hours**: 12am-6am have 0.2x traffic (minimal activity)
- **Lunch dip**: 12pm-1pm shows slight decrease

### Status Code Distribution

- **Success (2xx)**: ~92% (target: 95%)
- **Client Errors (4xx)**: ~5% (target: 3%)
- **Server Errors (5xx)**: ~3% (target: 2%)
- **Error spikes**: 5% chance per hour of elevated error rates (60% errors)

### Response Times

- **Typical**: 50-500ms (90% of requests)
- **Slow**: 500-1500ms (8% of requests)
- **Outliers**: 1500-3000ms (2% of requests)

### Endpoints

Available endpoints with varied usage:
- `/api/users` - User management
- `/api/payments` - Payment processing
- `/api/reports` - Report generation
- `/api/analytics` - Analytics data
- `/api/auth` - Authentication
- `/api/webhooks` - Webhook handling

### API Keys

**Test Environment**: 5 keys (key_test_001 through key_test_005)
**Production Environment**: 3 keys (key_prod_001 through key_prod_003)

## Generation

Data is generated using `scripts/generateUsageData.ts`.

### Regenerate Data

```bash
yarn tsx scripts/generateUsageData.ts
```

This will overwrite existing data files with fresh 30-day datasets.

### Customization

Edit `scripts/generateUsageData.ts` to adjust:
- `days` - Number of days to generate (default: 30)
- `baseRequestsPerHour` - Base traffic volume per hour
- `STATUS_CODES` - Available HTTP status codes
- `ENDPOINTS` - Available API endpoints
- Error spike probability
- Response time ranges

## Usage in Application

Load usage data in React components:

```typescript
import type { UsageDataset } from '@/types/usage';

// Fetch test data
const response = await fetch('/data/usage-test.json');
const data: UsageDataset = await response.json();

// Use in components
console.log(`Total requests: ${data.requests.length}`);
console.log(`Date range: ${data.startDate} to ${data.endDate}`);

// Daily stats for charts
const chartData = data.dailyStats.map(stat => ({
  date: stat.date,
  requests: stat.totalRequests
}));
```

## Data Quality

Generated data is designed for:
- **Dashboard demonstration**: Realistic charts and tables
- **Empty state testing**: Zero-state handling when no data
- **Error state testing**: Handling of failed API calls
- **Time range filtering**: Data spans 30 days for range selection
- **Environment separation**: Test and production datasets are distinct

All timestamps, request IDs, and statistics are algorithmically generated to maintain consistency and realism.
