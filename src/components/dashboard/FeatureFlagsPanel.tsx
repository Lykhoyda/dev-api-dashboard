import { Code, LayoutGrid, Table } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

/**
 * Feature Flags Panel Component
 * Displays and allows toggling of feature flags for development
 */
export function FeatureFlagsPanel() {
	const { toggleFlag, isEnabled } = useFeatureFlags();

	return (
		<div className="rounded-xl border bg-surface-dark p-6 shadow-sm-dark border-border-dark">
			<div className="mb-4 flex items-center gap-2">
				<Code className="h-5 w-5 text-primary" />
				<h2 className="text-lg font-semibold text-text-primary-dark">
					Developer Settings
				</h2>
				<Badge variant="secondary" className="ml-auto">
					Beta
				</Badge>
			</div>

			<p className="mb-6 text-sm text-text-secondary-dark">
				Toggle experimental features to preview upcoming functionality
			</p>

			<div className="space-y-4">
				{/* Card View for API Keys Toggle */}
				<div className="flex items-center justify-between rounded-lg border border-border-dark bg-muted p-4 transition-colors hover:bg-muted/80">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							{isEnabled('cardViewForApiKeys') ? (
								<LayoutGrid className="h-5 w-5 text-primary" />
							) : (
								<Table className="h-5 w-5 text-primary" />
							)}
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="font-medium text-text-primary-dark">
									Card View for API Keys
								</span>
								<Badge
									variant={
										isEnabled('cardViewForApiKeys') ? 'success' : 'secondary'
									}
									className="text-xs"
								>
									{isEnabled('cardViewForApiKeys') ? 'Enabled' : 'Disabled'}
								</Badge>
							</div>
							<p className="text-sm text-text-secondary-dark">
								Switch between table and card layouts on the API Keys page
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={() => toggleFlag('cardViewForApiKeys')}
						className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-dark ${
							isEnabled('cardViewForApiKeys')
								? 'bg-primary'
								: 'bg-muted-foreground/20'
						}`}
						role="switch"
						aria-checked={isEnabled('cardViewForApiKeys')}
						aria-label="Toggle card view for API keys"
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								isEnabled('cardViewForApiKeys')
									? 'translate-x-6'
									: 'translate-x-1'
							}`}
						/>
					</button>
				</div>
			</div>

			<div className="mt-4 rounded-lg bg-blue-500/10 p-3 text-xs text-blue-400">
				<strong>Note:</strong> Feature flags are stored locally and will persist
				across sessions
			</div>
		</div>
	);
}
