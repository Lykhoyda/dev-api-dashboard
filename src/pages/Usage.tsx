import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import type { UsageDataset } from '@/types/mock-data';

type TimeRange = '24h' | '7d' | '30d';

interface StatsCardProps {
	title: string;
	value: string | number;
	change: number;
	changeLabel: string;
	trend?: 'up' | 'down';
	icon?: ReactNode;
}

function StatsCard({
	title,
	value,
	change,
	changeLabel,
	trend = 'up',
	icon
}: StatsCardProps) {
	const isPositive = trend === 'up' ? change > 0 : change < 0;
	const changeColor = isPositive
		? 'text-green-600 dark:text-green-400'
		: 'text-red-600 dark:text-red-400';

	return (
		<div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-sm-dark">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
					<div className="mt-2 flex items-center gap-1 text-sm">
						{isPositive ? (
							<ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
						) : (
							<ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
						)}
						<span className={`font-medium ${changeColor}`}>
							{change > 0 ? '+' : ''}
							{change}%
						</span>
						<span className="text-muted-foreground">{changeLabel}</span>
					</div>
				</div>
				{icon && (
					<div className="rounded-lg bg-primary/10 p-3 text-primary">
						{icon}
					</div>
				)}
			</div>
		</div>
	);
}

export function Usage() {
	const { mode } = useEnvironment();
	const [timeRange, setTimeRange] = useState<TimeRange>('7d');
	const [usageData, setUsageData] = useState<UsageDataset | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const loadData = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await fetch(`/data/usage-${mode}.json`, {
					signal: controller.signal
				});
				if (!response.ok) {
					throw new Error('Failed to load usage data');
				}
				const data = await response.json();
				setUsageData(data);
			} catch (err) {
				// Don't set error state if request was aborted (component unmounted or mode changed)
				if (err instanceof Error && err.name !== 'AbortError') {
					setError(err.message);
				}
			} finally {
				// Don't update loading state if request was aborted
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		};

		loadData();

		// Cleanup: abort the fetch if component unmounts or mode changes
		return () => {
			controller.abort();
		};
	}, [mode]);

	const filteredRequests = useMemo(() => {
		if (!usageData) return [];

		const now = new Date();
		const cutoffTime = new Date();

		switch (timeRange) {
			case '24h':
				cutoffTime.setHours(now.getHours() - 24);
				break;
			case '7d':
				cutoffTime.setDate(now.getDate() - 7);
				break;
			case '30d':
				cutoffTime.setDate(now.getDate() - 30);
				break;
		}

		return usageData.requests.filter(
			(request) => new Date(request.timestamp) >= cutoffTime
		);
	}, [usageData, timeRange]);

	const stats = useMemo(() => {
		if (filteredRequests.length === 0) {
			return {
				totalRequests: 0,
				successRate: 0,
				avgResponseTime: 0,
				errorRate: 0
			};
		}

		const totalRequests = filteredRequests.length;
		const successfulRequests = filteredRequests.filter(
			(r) => r.statusCode >= 200 && r.statusCode < 300
		).length;
		const successRate = (successfulRequests / totalRequests) * 100;
		const avgResponseTime =
			filteredRequests.reduce((sum, r) => sum + r.responseTimeMs, 0) /
			totalRequests;
		const errorRate = 100 - successRate;

		return {
			totalRequests,
			successRate,
			avgResponseTime: Math.round(avgResponseTime),
			errorRate
		};
	}, [filteredRequests]);

	const chartData = useMemo(() => {
		if (filteredRequests.length === 0) return [];

		const groupedByDay = new Map<string, number>();

		for (const request of filteredRequests) {
			const date = new Date(request.timestamp);
			const dayKey = date.toISOString().split('T')[0];
			groupedByDay.set(dayKey, (groupedByDay.get(dayKey) || 0) + 1);
		}

		return Array.from(groupedByDay.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, count]) => ({
				date,
				requests: count,
				displayDate: new Date(date).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric'
				})
			}));
	}, [filteredRequests]);

	if (loading) {
		return (
			<div className="flex-1 p-6 md:p-12">
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-sm text-muted-foreground">
							Loading usage data...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 p-6 md:p-12">
				<div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
					<p className="text-sm font-medium text-destructive">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 p-6 md:p-12">
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Usage Analytics
						</h1>
						<p className="text-muted-foreground">
							Monitor your API usage and performance metrics
						</p>
					</div>

					<div className="flex items-center gap-1 rounded-lg border border-border-dark bg-surface-dark p-1">
						<Button
							variant={timeRange === '24h' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setTimeRange('24h')}
						>
							24 Hours
						</Button>
						<Button
							variant={timeRange === '7d' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setTimeRange('7d')}
						>
							7 Days
						</Button>
						<Button
							variant={timeRange === '30d' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setTimeRange('30d')}
						>
							30 Days
						</Button>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<StatsCard
						title="Total Requests"
						value={stats.totalRequests.toLocaleString()}
						change={12.5}
						changeLabel="vs last period"
						trend="up"
						icon={<TrendingUp className="h-5 w-5" />}
					/>
					<StatsCard
						title="Success Rate"
						value={`${stats.successRate.toFixed(1)}%`}
						change={-0.2}
						changeLabel="vs last period"
						trend="up"
					/>
					<StatsCard
						title="Avg Response Time"
						value={`${stats.avgResponseTime}ms`}
						change={-8}
						changeLabel="vs last period"
						trend="down"
					/>
				</div>

				<div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-sm-dark">
					<div className="mb-4">
						<h2 className="text-lg font-semibold">Request Volume</h2>
						<p className="text-sm text-muted-foreground">
							Daily API requests over the selected period
						</p>
					</div>
					<div className="h-[400px]">
						{chartData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={chartData}>
									<defs>
										<linearGradient
											id="colorRequests"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
											<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-border"
									/>
									<XAxis
										dataKey="displayDate"
										className="text-xs text-muted-foreground"
									/>
									<YAxis className="text-xs text-muted-foreground" />
									<Tooltip
										contentStyle={{
											backgroundColor: 'hsl(var(--card))',
											border: '1px solid hsl(var(--border))',
											borderRadius: '8px'
										}}
									/>
									<Area
										type="monotone"
										dataKey="requests"
										stroke="#3b82f6"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorRequests)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="flex h-full items-center justify-center text-muted-foreground">
								No data available for the selected period
							</div>
						)}
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-sm-dark">
						<h3 className="font-semibold">Error Rate</h3>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="text-2xl font-bold text-red-600 dark:text-red-400">
								{stats.errorRate.toFixed(1)}%
							</span>
							<span className="text-sm text-muted-foreground">
								of total requests
							</span>
						</div>
					</div>

					<div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-sm-dark">
						<h3 className="font-semibold">Peak Request Time</h3>
						<div className="mt-2 flex items-baseline gap-2">
							<span className="text-2xl font-bold">14:00 - 15:00</span>
							<span className="text-sm text-muted-foreground">UTC</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
