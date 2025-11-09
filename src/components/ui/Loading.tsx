import type { HTMLAttributes } from 'react';

interface LoadingProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Size of the spinner.
	 * - sm: 16px (for buttons)
	 * - md: 24px (default)
	 * - lg: 48px (for full-page loading)
	 */
	size?: 'sm' | 'md' | 'lg';
	/**
	 * Optional text to display below the spinner.
	 */
	text?: string;
	/**
	 * If true, centers the loading spinner in a full-page container.
	 * If false, renders inline.
	 */
	fullPage?: boolean;
}

const SIZE_CLASSES = {
	sm: 'w-4 h-4 border-2',
	md: 'w-6 h-6 border-2',
	lg: 'w-12 h-12 border-4'
} as const;

/**
 * Loading spinner component with configurable size and layout.
 *
 * Features:
 * - Three sizes: sm (buttons), md (inline), lg (full-page)
 * - Optional text label
 * - Full-page centered or inline layout
 * - Accessible with aria-label
 * - Smooth animation
 *
 * @example
 * // Full-page loading
 * <Loading fullPage size="lg" text="Loading..." />
 *
 * @example
 * // Inline in button
 * <button disabled>
 *   <Loading size="sm" />
 *   <span>Loading...</span>
 * </button>
 */
export function Loading({
	size = 'md',
	text,
	fullPage = false,
	className = '',
	...props
}: LoadingProps) {
	const spinner = (
		<div
			className={`${SIZE_CLASSES[size]} border-primary-dark/30 border-t-primary-dark rounded-full animate-spin ${className}`}
			role="status"
			aria-label={text || 'Loading'}
			{...props}
		/>
	);

	if (fullPage) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background-dark">
				<div className="flex flex-col items-center gap-4">
					{spinner}
					{text && <p className="text-sm text-text-secondary-dark">{text}</p>}
				</div>
			</div>
		);
	}

	if (text) {
		return (
			<div className="flex flex-col items-center gap-4">
				{spinner}
				<p className="text-sm text-text-secondary-dark">{text}</p>
			</div>
		);
	}

	return spinner;
}
