import {
	Calendar,
	Clock,
	MoreVertical,
	Shield,
	ShieldAlert
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { ApiKeyStatusBadge } from './ApiKeyStatusBadge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	type ApiKey,
	deleteApiKey,
	maskApiKey,
	revokeApiKey
} from '@/lib/apiKeys';
import { formatRelativeTime } from '@/lib/dateUtils';

interface ApiKeyCardProps {
	apiKey: ApiKey;
	onUpdate: () => void;
	onRegenerate: (apiKey: ApiKey) => void;
}

/**
 * Card view component for displaying a single API key
 */
export function ApiKeyCard({
	apiKey,
	onUpdate,
	onRegenerate
}: ApiKeyCardProps) {
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
			<div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-sm-dark transition-shadow hover:shadow-md">
				{/* Header with Name and Actions */}
				<div className="mb-4 flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`rounded-lg p-2 ${
								apiKey.revoked ? 'bg-muted' : 'bg-primary/10'
							}`}
						>
							{apiKey.revoked ? (
								<ShieldAlert className="h-5 w-5 text-muted-foreground" />
							) : (
								<Shield className="h-5 w-5 text-primary" />
							)}
						</div>
						<div>
							<h3 className="font-semibold text-lg">{apiKey.name}</h3>
							<div className="mt-1">
								<ApiKeyStatusBadge revoked={apiKey.revoked} />
							</div>
						</div>
					</div>

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
				</div>

				{/* API Key Value */}
				<div className="mb-4 rounded-lg bg-muted/50 p-3">
					<div className="text-xs font-medium text-muted-foreground mb-1">
						API KEY
					</div>
					<code className="font-mono text-sm">{maskApiKey(apiKey.key)}</code>
				</div>

				{/* Metadata */}
				<div className="space-y-2 text-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>Created {formatRelativeTime(apiKey.createdAt)}</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Clock className="h-4 w-4" />
						<span>Last used: Never</span>
					</div>
				</div>
			</div>

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
