import { LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EnvironmentToggle } from '@/components/environment/EnvironmentToggle';
import { getRouteLabel } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	return (
		<header className="flex h-[65px] items-center justify-between border-b border-border-dark px-6 sticky top-0 bg-surface-dark/80 backdrop-blur-sm z-10 transition-colors duration-200">
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

			<div className="flex items-center gap-4">
				<EnvironmentToggle />

				<div className="flex items-center gap-2 pl-2 border-l border-divider-dark">
					<div className="flex items-center gap-2 px-2 py-1">
						<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-dark/10 border border-primary-dark/20">
							<User className="w-4 h-4 text-primary-dark" aria-hidden="true" />
						</div>
						<span className="text-sm font-medium text-text-primary-dark">
							{user?.name}
						</span>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary-dark hover:text-error-dark hover:bg-error-dark/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark"
						aria-label="Sign out"
					>
						<LogOut className="w-4 h-4" aria-hidden="true" />
						<span className="text-sm font-medium">Sign Out</span>
					</button>
				</div>
			</div>
		</header>
	);
}
