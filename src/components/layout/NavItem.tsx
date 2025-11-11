import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
	to: string;
	icon: LucideIcon;
	label: string;
	fillWhenActive?: boolean;
}

const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
	isActive
		? 'flex items-center gap-2 px-2 py-2 rounded-lg text-text-primary-dark bg-surface-elevated-dark border-l-2 border-primary-dark transition-colors duration-200'
		: 'flex items-center gap-2 px-2 py-2 rounded-lg text-text-secondary-dark hover:bg-white/5 transition-colors';

export function NavItem({
	to,
	icon: Icon,
	label,
	fillWhenActive = false
}: NavItemProps) {
	return (
		<NavLink to={to} className={getNavLinkClassName}>
			{fillWhenActive ? (
				({ isActive }) => (
					<>
						<Icon
							size={20}
							fill={isActive ? 'currentColor' : 'none'}
							aria-hidden="true"
						/>
						<span className="text-sm font-medium">{label}</span>
					</>
				)
			) : (
				<>
					<Icon size={20} aria-hidden="true" />
					<span className="text-sm font-medium">{label}</span>
				</>
			)}
		</NavLink>
	);
}
