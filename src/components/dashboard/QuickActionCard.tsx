import type { LucideIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface QuickActionCardProps
	extends Omit<ComponentPropsWithoutRef<typeof Link>, 'to' | 'title'> {
	icon: LucideIcon;
	title: ReactNode;
	description: ReactNode;
	href: string;
}

export function QuickActionCard({
	icon: Icon,
	title,
	description,
	href,
	className = '',
	...props
}: QuickActionCardProps) {
	return (
		<Link
			to={href}
			className={`flex items-center gap-4 p-4 bg-surface-dark border border-border-dark rounded-xl shadow-sm-dark hover:border-primary-dark/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark transition-all hover:shadow-md-dark ${className}`}
			{...props}
		>
			<div
				className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-dark/[.15]"
				aria-hidden="true"
			>
				<Icon className="text-primary-dark" size={24} aria-hidden="true" />
			</div>
			<div>
				<p className="font-semibold text-text-primary-dark">{title}</p>
				<p className="text-sm text-text-secondary-dark">{description}</p>
			</div>
		</Link>
	);
}
