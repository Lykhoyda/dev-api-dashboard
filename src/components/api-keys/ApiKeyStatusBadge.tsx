import { Badge } from '@/components/ui/badge';

interface ApiKeyStatusBadgeProps {
	revoked: boolean;
}

/**
 * Badge component for displaying API key status (Active or Revoked)
 */
export function ApiKeyStatusBadge({ revoked }: ApiKeyStatusBadgeProps) {
	if (revoked) {
		return (
			<Badge variant="secondary" className="gap-1.5">
				<span className="h-2 w-2 rounded-full bg-muted-foreground" />
				Revoked
			</Badge>
		);
	}

	return (
		<Badge variant="success" className="gap-1.5">
			<span className="h-2 w-2 rounded-full bg-green-500" />
			Active
		</Badge>
	);
}
