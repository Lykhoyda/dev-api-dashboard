import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

type IconColor = 'success' | 'error' | 'warning' | 'info';

interface ActivityItemProps
	extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
	icon: LucideIcon;
	iconColor: IconColor;
	title: ReactNode;
	description: ReactNode;
	timestamp: string;
	/** ISO 8601 datetime string for the time element's dateTime attribute */
	dateTime?: string;
}

const ICON_COLOR_CLASSES: Record<IconColor, { bg: string; text: string }> = {
	success: {
		bg: 'bg-success-dark/[.15]',
		text: 'text-success-dark'
	},
	error: {
		bg: 'bg-error-dark/[.15]',
		text: 'text-error-dark'
	},
	warning: {
		bg: 'bg-warning-dark/[.15]',
		text: 'text-warning-dark'
	},
	info: {
		bg: 'bg-info-dark/[.15]',
		text: 'text-info-dark'
	}
} as const;

export function ActivityItem({
	icon: Icon,
	iconColor,
	title,
	description,
	timestamp,
	dateTime,
	className = '',
	...props
}: ActivityItemProps) {
	const iconColorClass = ICON_COLOR_CLASSES[iconColor];

	return (
		<li
			className={`flex items-center justify-between py-4 ${className}`}
			{...props}
		>
			<div className="flex items-center gap-4">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-full ${iconColorClass.bg}`}
					aria-hidden="true"
				>
					<Icon className={iconColorClass.text} size={20} aria-hidden="true" />
				</div>
				<div>
					<p className="text-sm font-medium text-text-primary-dark">{title}</p>
					<p className="text-xs text-text-secondary-dark">{description}</p>
				</div>
			</div>
			{dateTime ? (
				<time className="text-sm text-text-secondary-dark" dateTime={dateTime}>
					{timestamp}
				</time>
			) : (
				<p className="text-sm text-text-secondary-dark">{timestamp}</p>
			)}
		</li>
	);
}
