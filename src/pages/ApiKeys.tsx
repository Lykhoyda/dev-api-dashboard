import {
	ArrowUpDown,
	FlaskConical,
	MoreVertical,
	Plus,
	Search
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreateKeyModal } from '@/components/api-keys/CreateKeyModal';
import { RegenerateKeyModal } from '@/components/api-keys/RegenerateKeyModal';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import {
	type ApiKey,
	deleteApiKey,
	getApiKeys,
	maskApiKey,
	revokeApiKey
} from '@/lib/apiKeys';

/**
 * Format a date string to relative time (e.g., "2 weeks ago")
 */
function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const intervals = {
		year: 31536000,
		month: 2592000,
		week: 604800,
		day: 86400,
		hour: 3600,
		minute: 60
	};

	for (const [unit, secondsInUnit] of Object.entries(intervals)) {
		const interval = Math.floor(seconds / secondsInUnit);
		if (interval >= 1) {
			return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
		}
	}

	return 'Just now';
}

export function ApiKeys() {
	const { mode } = useEnvironment();
	const [searchQuery, setSearchQuery] = useState('');
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
	const [keyToRegenerate, setKeyToRegenerate] = useState<ApiKey | null>(null);
	const [, forceUpdate] = useState(0);

	// Trigger re-render after key operations
	const handleKeyUpdate = useCallback(() => {
		forceUpdate((prev) => prev + 1);
	}, []);

	// Listen for storage changes in other tabs
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'api_keys') {
				handleKeyUpdate();
				toast.info('API keys updated in another tab');
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, [handleKeyUpdate]);

	// Get all keys (memoized to avoid unnecessary localStorage reads)
	// Using forceUpdate state as dependency to trigger re-fetch
	// biome-ignore lint/correctness/useExhaustiveDependencies: forceUpdate counter intentionally triggers refetch
	const allKeys = useMemo(() => getApiKeys(), [forceUpdate]);

	// Filter by current environment (memoized with proper dependencies)
	const environmentKeys = useMemo(
		() => allKeys.filter((key) => key.environment === mode),
		[allKeys, mode]
	);

	// Filter keys by search query
	const filteredKeys = useMemo(() => {
		if (!searchQuery.trim()) {
			return environmentKeys;
		}

		const query = searchQuery.toLowerCase();
		return environmentKeys.filter(
			(key) =>
				key.name.toLowerCase().includes(query) ||
				key.key.toLowerCase().includes(query)
		);
	}, [environmentKeys, searchQuery]);

	return (
		<div className="flex-1 p-6 md:p-12">
			<div className="flex flex-col gap-6">
				{/* Page Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
							{mode === 'test' && (
								<Badge variant="warning" className="gap-1">
									<FlaskConical className="h-3 w-3" />
									TEST MODE
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground">
							Manage authentication credentials for API access.
						</p>
					</div>

					<div className="flex items-center gap-3">
						{/* Search Input */}
						<div className="relative w-full md:w-64">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Filter keys..."
								className="pl-9"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* Create Button */}
						<Button
							className="gap-2 whitespace-nowrap"
							onClick={() => setCreateModalOpen(true)}
						>
							<Plus className="h-4 w-4" />
							Create API Key
						</Button>
					</div>
				</div>

				{/* Data Table */}
				<div className="overflow-hidden rounded-xl border shadow-sm">
					{filteredKeys.length === 0 ? (
						<EmptyState
							hasSearch={Boolean(searchQuery.trim())}
							onCreateClick={() => setCreateModalOpen(true)}
						/>
					) : (
						<>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-1/4">
												<div className="flex items-center gap-1">
													Name
													<ArrowUpDown className="h-4 w-4" />
												</div>
											</TableHead>
											<TableHead className="w-1/4">API Key</TableHead>
											<TableHead className="w-1/6">
												<div className="flex items-center gap-1">
													Created
													<ArrowUpDown className="h-4 w-4" />
												</div>
											</TableHead>
											<TableHead className="w-1/6">Last Used</TableHead>
											<TableHead className="w-1/12">Status</TableHead>
											<TableHead className="w-[60px] text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredKeys.map((key) => (
											<KeyRow
												key={key.id}
												apiKey={key}
												onUpdate={handleKeyUpdate}
												onRegenerate={(apiKey) => {
													setKeyToRegenerate(apiKey);
													setRegenerateModalOpen(true);
												}}
											/>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination Footer */}
							<div className="flex items-center justify-between border-t px-4 py-3">
								<div className="text-sm text-muted-foreground">
									Showing {filteredKeys.length} of {environmentKeys.length} keys
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Create Key Modal */}
			<CreateKeyModal
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
				onKeyCreated={handleKeyUpdate}
			/>

			{/* Regenerate Key Modal */}
			<RegenerateKeyModal
				open={regenerateModalOpen}
				onOpenChange={setRegenerateModalOpen}
				apiKey={keyToRegenerate}
				onKeyRegenerated={() => {
					if (keyToRegenerate) {
						const wasRevoked = keyToRegenerate.revoked;
						if (wasRevoked) {
							toast.success(
								`API key "${keyToRegenerate.name}" has been regenerated and reactivated`
							);
						} else {
							toast.success(
								`API key "${keyToRegenerate.name}" has been regenerated`
							);
						}
					}
					handleKeyUpdate();
				}}
			/>
		</div>
	);
}

/**
 * Table row component for a single API key
 * Note: Copy functionality is intentionally removed - full keys are only revealed during creation
 */
function KeyRow({
	apiKey,
	onUpdate,
	onRegenerate
}: {
	apiKey: ApiKey;
	onUpdate: () => void;
	onRegenerate: (apiKey: ApiKey) => void;
}) {
	const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleRevokeConfirm = () => {
		const success = revokeApiKey(apiKey.id);
		if (success) {
			toast.success(`API key "${apiKey.name}" has been revoked`);
			onUpdate();
		} else {
			toast.error('Failed to revoke API key');
		}
		setRevokeDialogOpen(false);
	};

	const handleDeleteConfirm = () => {
		const success = deleteApiKey(apiKey.id);
		if (success) {
			toast.success(`API key "${apiKey.name}" has been deleted`);
			onUpdate();
		} else {
			toast.error('Failed to delete API key');
		}
		setDeleteDialogOpen(false);
	};

	return (
		<>
			<TableRow>
				{/* Name */}
				<TableCell className="font-semibold">{apiKey.name}</TableCell>

				{/* Masked Key - No copy allowed after creation */}
				<TableCell>
					<code className="font-mono text-sm text-muted-foreground">
						{maskApiKey(apiKey.key)}
					</code>
				</TableCell>

				{/* Created */}
				<TableCell className="text-muted-foreground">
					{formatRelativeTime(apiKey.createdAt)}
				</TableCell>

				{/* Last Used */}
				<TableCell className="text-muted-foreground">Never</TableCell>

				{/* Status */}
				<TableCell>
					{apiKey.revoked ? (
						<Badge variant="secondary" className="gap-1.5">
							<span className="h-2 w-2 rounded-full bg-muted-foreground" />
							Revoked
						</Badge>
					) : (
						<Badge variant="success" className="gap-1.5">
							<span className="h-2 w-2 rounded-full bg-green-500" />
							Active
						</Badge>
					)}
				</TableCell>

				{/* Actions */}
				<TableCell className="text-right">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreVertical className="h-4 w-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onRegenerate(apiKey)}>
								Regenerate
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => {
									if (apiKey.revoked) {
										setDeleteDialogOpen(true);
									} else {
										setRevokeDialogOpen(true);
									}
								}}
							>
								{apiKey.revoked ? 'Delete' : 'Revoke'}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</TableCell>
			</TableRow>

			{/* Revoke Confirmation Dialog */}
			<AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to revoke "{apiKey.name}"? This action will
							immediately invalidate the key and prevent it from making any
							further API requests.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRevokeConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Revoke Key
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete API Key?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to permanently delete "{apiKey.name}"? This
							action cannot be undone. The key is already revoked and inactive.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete Key
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

/**
 * Empty state component when no keys exist
 */
function EmptyState({
	hasSearch,
	onCreateClick
}: {
	hasSearch: boolean;
	onCreateClick: () => void;
}) {
	if (hasSearch) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<Search className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 text-lg font-semibold">No keys found</h3>
				<p className="mb-6 text-sm text-muted-foreground">
					Try adjusting your search query
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<Plus className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="mb-2 text-lg font-semibold">No API keys yet</h3>
			<p className="mb-6 text-sm text-muted-foreground">
				Get started by creating your first API key
			</p>
			<Button className="gap-2" onClick={onCreateClick}>
				<Plus className="h-4 w-4" />
				Create API Key
			</Button>
		</div>
	);
}
