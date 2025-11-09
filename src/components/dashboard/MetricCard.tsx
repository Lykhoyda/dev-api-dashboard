import type { HTMLAttributes, ReactNode } from 'react';

type SubtitleColor =
	| 'success'
	| 'error'
	| 'warning'
	| 'info'
	| 'tertiary'
	| 'secondary';

interface MetricCardProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
	title: ReactNode;
	value: ReactNode;
	subtitle: ReactNode;
	subtitleColor?: SubtitleColor;
}

const SUBTITLE_COLOR_CLASSES: Record<SubtitleColor, string> = {
	success: 'text-success-dark',
	error: 'text-error-dark',
	warning: 'text-warning-dark',
	info: 'text-info-dark',
	tertiary: 'text-text-tertiary-dark',
	secondary: 'text-text-secondary-dark'
} as const;

export function MetricCard({
	title,
	value,
	subtitle,
	subtitleColor = 'tertiary',
	className = '',
	...props
}: MetricCardProps) {
	const subtitleColorClass = SUBTITLE_COLOR_CLASSES[subtitleColor];

	return (
		<div
			className={`flex flex-col gap-2 rounded-xl p-6 bg-surface-dark border border-border-dark shadow-sm-dark transition-colors duration-200 ${className}`}
			{...props}
		>
			<p className="text-sm font-medium text-text-secondary-dark">{title}</p>
			<p className="text-3xl font-bold tracking-tight text-text-primary-dark">
				{value}
			</p>
			<p className={`text-sm font-medium ${subtitleColorClass}`}>{subtitle}</p>
		</div>
	);
}
