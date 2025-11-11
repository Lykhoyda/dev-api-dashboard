import { AlertCircle, Database, Key } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useEnvironment } from '@/contexts/EnvironmentContext';

/**
 * Info card component for features/sections
 */
function InfoCard({
	icon,
	title,
	children
}: {
	icon: ReactNode;
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="rounded-lg border border-border-dark bg-surface-dark p-6">
			<div className="mb-4 flex items-center gap-3">
				<div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
				<h3 className="font-semibold">{title}</h3>
			</div>
			<div className="space-y-2 text-sm text-muted-foreground">{children}</div>
		</div>
	);
}

/**
 * Section component for documentation sections
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-bold tracking-tight">{title}</h2>
			{children}
		</section>
	);
}

export function Documentation() {
	const { mode } = useEnvironment();

	return (
		<div className="flex-1 p-6 md:p-12">
			<div className="mx-auto max-w-4xl space-y-12">
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<h1 className="text-3xl font-bold tracking-tight">
							Sandbox Console Documentation
						</h1>
						<Badge variant={mode === 'test' ? 'warning' : 'default'}>
							{mode.toUpperCase()} MODE
						</Badge>
					</div>
					<p className="text-lg text-muted-foreground">
						Learn how to use this demo console, where data is stored, and how
						the sandbox works.
					</p>
				</div>

				<div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
					<div className="flex gap-4">
						<AlertCircle className="h-6 w-6 flex-shrink-0 text-primary" />
						<div className="space-y-3">
							<h2 className="text-xl font-bold">About This Sandbox</h2>
							<p className="text-sm text-muted-foreground">
								This is a <strong>client-side demonstration</strong> of an API
								management console. Everything runs in your browser - no backend
								servers, no real API calls, no data leaves your device.
							</p>
							<div className="grid gap-2 text-sm">
								<div className="flex gap-2">
									<span className="text-green-600 dark:text-green-400">✓</span>
									<span className="text-muted-foreground">
										Mock authentication (localStorage tokens)
									</span>
								</div>
								<div className="flex gap-2">
									<span className="text-green-600 dark:text-green-400">✓</span>
									<span className="text-muted-foreground">
										API key generation and management
									</span>
								</div>
								<div className="flex gap-2">
									<span className="text-green-600 dark:text-green-400">✓</span>
									<span className="text-muted-foreground">
										Synthetic usage analytics from static JSON files
									</span>
								</div>
								<div className="flex gap-2">
									<span className="text-green-600 dark:text-green-400">✓</span>
									<span className="text-muted-foreground">
										Educational code examples for learning API patterns
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Section title="Getting Started">
					<div className="space-y-4">
						<p className="text-muted-foreground">
							Follow these steps to explore the sandbox console:
						</p>
						<ol className="space-y-4 pl-5">
							<li className="text-muted-foreground">
								<span className="font-semibold text-foreground">
									1. Create an API Key
								</span>
								<p className="mt-1">
									Navigate to the{' '}
									<Link to="/keys" className="text-primary hover:underline">
										API Keys
									</Link>{' '}
									page and click "Create New Key". Choose Test or Production
									mode (both are simulated). Your key is generated using{' '}
									<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
										crypto.randomUUID()
									</code>{' '}
									and stored in browser localStorage.
								</p>
							</li>
							<li className="text-muted-foreground">
								<span className="font-semibold text-foreground">
									2. View Synthetic Analytics
								</span>
								<p className="mt-1">
									Go to the{' '}
									<Link to="/usage" className="text-primary hover:underline">
										Usage
									</Link>{' '}
									page to see pre-generated analytics. Data is loaded from
									static JSON files in{' '}
									<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
										/public/data/
									</code>
									. This data won't change based on your actions - it's for
									demonstration only.
								</p>
							</li>
							<li className="text-muted-foreground">
								<span className="font-semibold text-foreground">
									3. Explore API Key Management
								</span>
								<p className="mt-1">
									Try revoking, regenerating, and deleting keys to understand
									the security lifecycle. Keys are masked in the table view and
									only revealed once during creation (following industry best
									practices).
								</p>
							</li>
							<li className="text-muted-foreground">
								<span className="font-semibold text-foreground">
									4. Toggle Between Environments
								</span>
								<p className="mt-1">
									Use the Test/Production toggle in the header to switch
									environments. Each environment has separate keys and separate
									analytics data, demonstrating environment isolation patterns.
								</p>
							</li>
						</ol>
					</div>
				</Section>

				<Section title="Technical Architecture">
					<div className="space-y-4">
						<p className="text-muted-foreground">
							Understanding how data is stored and where it comes from:
						</p>

						<div className="grid gap-4 md:grid-cols-2">
							<InfoCard
								icon={<Database className="h-5 w-5" />}
								title="Data Storage"
							>
								<p>
									All data is stored in browser{' '}
									<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
										localStorage
									</code>{' '}
									and persists until you clear browser data.
								</p>
								<div className="mt-3 space-y-2">
									<div>
										<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
											api_keys
										</code>
										<p className="mt-1 text-xs">
											Array of your generated API keys with metadata
										</p>
									</div>
									<div>
										<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
											auth_token
										</code>
										<p className="mt-1 text-xs">Mock session token</p>
									</div>
								</div>
								<p className="mt-3 text-xs">
									<strong>To reset:</strong> Clear localStorage in browser
									DevTools (Application → Local Storage → Clear All)
								</p>
							</InfoCard>

							<InfoCard
								icon={<Key className="h-5 w-5" />}
								title="API Key Generation"
							>
								<p>
									Keys are generated using the browser's{' '}
									<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
										crypto.randomUUID()
									</code>{' '}
									API for cryptographically secure randomness.
								</p>
								<div className="mt-3 space-y-2">
									<div>
										<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
											sk_test_*
										</code>
										<p className="mt-1 text-xs">Test environment keys</p>
									</div>
									<div>
										<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
											sk_live_*
										</code>
										<p className="mt-1 text-xs">Production environment keys</p>
									</div>
								</div>
								<p className="mt-3 text-xs">
									Format matches industry standards (Stripe, OpenAI) for
									educational purposes.
								</p>
							</InfoCard>
						</div>

						<div className="rounded-lg border border-border-dark bg-surface-dark p-4">
							<h4 className="mb-3 font-semibold">Synthetic Data Sources</h4>
							<div className="space-y-2 text-sm text-muted-foreground">
								<p>
									Usage analytics are loaded from pre-generated static JSON
									files:
								</p>
								<ul className="space-y-1 pl-4">
									<li>
										<strong>Test mode:</strong>{' '}
										<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
											/public/data/usage-test.json
										</code>{' '}
										(~9,500 requests over 14 days)
									</li>
									<li>
										<strong>Production mode:</strong>{' '}
										<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
											/public/data/usage-production.json
										</code>{' '}
										(~3,800 requests over 14 days)
									</li>
								</ul>
								<p className="mt-3">
									These files contain realistic traffic patterns (weekday peaks,
									business hours activity, occasional error spikes) but don't
									reflect actual API usage since there is no real API.
								</p>
							</div>
						</div>
					</div>
				</Section>

				<Section title="Troubleshooting">
					<div className="space-y-4">
						<p className="text-muted-foreground">
							Common issues when using the sandbox console:
						</p>

						<div className="space-y-4">
							<div className="rounded-lg border border-border-dark bg-surface-dark p-4">
								<h3 className="mb-2 font-semibold">
									"No API keys found" or empty key list
								</h3>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>
										• You haven't created any keys yet - go to the{' '}
										<Link to="/keys" className="text-primary hover:underline">
											API Keys
										</Link>{' '}
										page and click "Create New Key"
									</li>
									<li>
										• Your localStorage was cleared - keys are stored locally
										and not recoverable after deletion
									</li>
									<li>
										• You're viewing the wrong environment - use the
										Test/Production toggle in the header
									</li>
								</ul>
							</div>

							<div className="rounded-lg border border-border-dark bg-surface-dark p-4">
								<h3 className="mb-2 font-semibold">
									Analytics data not updating
								</h3>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>
										• This is expected - analytics data is static and loaded
										from JSON files
									</li>
									<li>
										• The data represents a pre-generated 14-day period for
										demonstration
									</li>
									<li>
										• Toggle between Test and Production modes to see different
										datasets
									</li>
									<li>
										• No actions in the console will change the analytics (it's
										a demo)
									</li>
								</ul>
							</div>

							<div className="rounded-lg border border-border-dark bg-surface-dark p-4">
								<h3 className="mb-2 font-semibold">
									Issues with Private/Incognito mode
								</h3>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>
										• This sandbox requires localStorage to function properly
									</li>
									<li>
										• Private browsing modes may not persist data between
										sessions
									</li>
									<li>
										• Some browsers block localStorage in private mode entirely
									</li>
									<li>
										• For best experience, use regular browsing mode or allow
										localStorage in your browser settings
									</li>
								</ul>
							</div>

							<div className="rounded-lg border border-border-dark bg-surface-dark p-4">
								<h3 className="mb-2 font-semibold">How to reset the sandbox</h3>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>• Open browser DevTools (F12 or Cmd+Option+I on Mac)</li>
									<li>• Go to Application → Local Storage</li>
									<li>
										• Find the entry for this site (
										<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
											localhost:5173
										</code>{' '}
										or your deployed domain)
									</li>
									<li>• Click "Clear All" to remove all stored data</li>
									<li>• Refresh the page to start fresh</li>
								</ul>
							</div>
						</div>
					</div>
				</Section>
			</div>
		</div>
	);
}
