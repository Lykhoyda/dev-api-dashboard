import {
	Activity,
	AlertTriangle,
	CheckCircle,
	FileText,
	Key,
	PlusCircle,
	XCircle
} from 'lucide-react';
import { useMemo } from 'react';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { FeatureFlagsPanel } from '@/components/dashboard/FeatureFlagsPanel';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { getApiKeys } from '@/lib/apiKeys';

export function Dashboard() {
	const { user } = useAuth();
	const { mode } = useEnvironment();
	const firstName = user?.name.split(' ')[0] || 'Guest';

	// Calculate real API key metrics from localStorage
	const keyMetrics = useMemo(() => {
		const allKeys = getApiKeys();
		const environmentKeys = allKeys.filter((key) => key.environment === mode);
		const activeKeys = environmentKeys.filter((key) => !key.revoked);
		const inactiveKeys = environmentKeys.filter((key) => key.revoked);

		return {
			active: activeKeys.length,
			inactive: inactiveKeys.length,
			total: environmentKeys.length
		};
	}, [mode]);

	return (
		<PageLayout
			title={`Welcome back, ${firstName}!`}
			description="Here's a summary of your activity today."
		>
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<MetricCard
					title="API Calls Today"
					value="1,234"
					subtitle="+5.2% from yesterday"
					subtitleColor="success"
				/>
				<MetricCard
					title="Active Keys"
					value={keyMetrics.active}
					subtitle={
						keyMetrics.inactive === 0
							? 'All keys active'
							: `${keyMetrics.inactive} inactive`
					}
					subtitleColor="tertiary"
				/>
				<MetricCard
					title="Error Rate"
					value="1.2%"
					subtitle="-0.3% from yesterday"
					subtitleColor="error"
				/>
			</div>

			{/* Recent Activity and Quick Actions Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
				{/* Recent Activity Section */}
				<div className="lg:col-span-2 flex flex-col gap-4 rounded-xl p-6 bg-surface-dark border border-border-dark shadow-sm-dark transition-colors duration-200">
					<h2 className="text-lg font-semibold text-text-primary-dark">
						Recent Activity
					</h2>
					<ul className="flex flex-col divide-y divide-divider-dark">
						<ActivityItem
							icon={PlusCircle}
							iconColor="info"
							title="New API Key Created"
							description="key_...a4b2"
							timestamp="2m ago"
						/>
						<ActivityItem
							icon={CheckCircle}
							iconColor="success"
							title={
								<>
									API Call -{' '}
									<code className="font-mono bg-white/10 px-1 py-0.5 rounded">
										POST /v1/encrypt
									</code>
								</>
							}
							description="Status: 200 OK"
							timestamp="5m ago"
						/>
						<ActivityItem
							icon={XCircle}
							iconColor="error"
							title={
								<>
									API Call -{' '}
									<code className="font-mono bg-white/10 px-1 py-0.5 rounded">
										GET /v1/status
									</code>
								</>
							}
							description="Status: 401 Unauthorized"
							timestamp="1h ago"
						/>
						<ActivityItem
							icon={AlertTriangle}
							iconColor="warning"
							title="Usage Limit Reached"
							description="85% of monthly quota used"
							timestamp="3h ago"
						/>
					</ul>
				</div>

				{/* Quick Actions Section */}
				<div className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold text-text-primary-dark">
						Quick Actions
					</h2>
					<div className="flex flex-col gap-4">
						<QuickActionCard
							icon={Key}
							title="Create API Key"
							description="Generate a new key for your application."
							href="/keys"
						/>
						<QuickActionCard
							icon={Activity}
							title="View Usage"
							description="Explore your API usage and analytics."
							href="/usage"
						/>
						<QuickActionCard
							icon={FileText}
							title="View Documentation"
							description="Read our guides and tutorials."
							href="/docs"
						/>
					</div>
				</div>
			</div>

			{/* Feature Flags Panel */}
			<FeatureFlagsPanel />
		</PageLayout>
	);
}
