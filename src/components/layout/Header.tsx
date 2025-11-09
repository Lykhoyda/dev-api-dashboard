import { Bell, FlaskConical, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getRouteLabel } from '@/config/routes';
import { IconButton } from '@/components/ui/IconButton';

export function Header() {
	const location = useLocation();

	return (
		<header className="flex h-[65px] items-center justify-between border-b border-border-dark px-6 sticky top-0 bg-surface-dark/80 backdrop-blur-sm z-10 transition-colors duration-200">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2">
				<Link
					to="/"
					className="text-text-secondary-dark text-sm font-medium hover:text-text-link-hover-dark transition-colors"
				>
					Home
				</Link>
				<span className="text-text-secondary-dark text-sm font-medium">/</span>
				<span className="text-text-primary-dark text-sm font-medium">
					{getRouteLabel(location.pathname)}
				</span>
			</div>

			{/* Right side actions */}
			<div className="flex items-center gap-4">
				<IconButton icon={Search} aria-label="Search" />
				<IconButton icon={Bell} aria-label="Notifications" />

				{/* Test Mode Badge */}
				<button
					type="button"
					className="flex items-center justify-center rounded-full h-10 px-2 gap-1 bg-warning-dark/[.20] text-warning-dark text-sm font-bold leading-normal tracking-[0.015em]"
				>
					<FlaskConical size={16} />
					<span className="truncate">TEST MODE</span>
				</button>
			</div>
		</header>
	);
}
