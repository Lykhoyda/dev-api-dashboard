import type { HTMLAttributes, ReactNode } from 'react';

interface PageLayoutProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
	/** Page title displayed as H1 */
	title: ReactNode;
	/** Page description displayed below title */
	description?: ReactNode;
	/** Page content */
	children?: ReactNode;
}

/**
 * Standardized page layout wrapper used across all pages.
 * Provides consistent spacing, typography, and structure.
 *
 * @example
 * <PageLayout
 *   title="API Keys"
 *   description="Manage your API keys and access credentials."
 * >
 *   <div>Page content here</div>
 * </PageLayout>
 */
export function PageLayout({
	title,
	description,
	children,
	className = '',
	...props
}: PageLayoutProps) {
	return (
		<main className={`flex-1 p-6 md:p-12 ${className}`} {...props}>
			<div className="flex flex-col gap-12">
				{/* Page Header */}
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-bold tracking-tight text-text-primary-dark">
						{title}
					</h1>
					{description && (
						<p className="text-base text-text-secondary-dark">{description}</p>
					)}
				</div>

				{/* Page Content */}
				{children}
			</div>
		</main>
	);
}
