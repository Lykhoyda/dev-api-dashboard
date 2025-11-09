import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Lucide icon component to render */
	icon: LucideIcon;
	/** Icon size in pixels */
	size?: number;
	/** Accessible label for screen readers */
	'aria-label': string;
}

/**
 * Reusable icon button component with consistent styling.
 * Used in Header for Search, Notifications, and other icon-only actions.
 *
 * @example
 * <IconButton
 *   icon={Search}
 *   aria-label="Search"
 *   onClick={handleSearch}
 * />
 */
export function IconButton({
	icon: Icon,
	size = 20,
	className = '',
	...props
}: IconButtonProps) {
	return (
		<button
			type="button"
			className={`flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark transition-colors text-text-secondary-dark hover:text-text-primary-dark ${className}`}
			{...props}
		>
			<Icon size={size} aria-hidden="true" />
		</button>
	);
}
