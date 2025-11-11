import type { ReactNode } from 'react';
import { ROUTES } from '@/config/routes';
import { Header } from './Header';
import { NavItem } from './NavItem';

interface AppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside className="w-[280px] flex-col border-r border-border-dark bg-surface-dark hidden md:flex transition-colors duration-200">
				<div className="flex h-full flex-col p-4">
					<div className="flex flex-col gap-12">
						<div className="flex items-center gap-2 px-2 pt-2">
							<div className="flex flex-col">
								<p className="text-sm text-text-secondary-dark">Dev Console</p>
							</div>
						</div>

						{/* Navigation */}
						<nav className="flex flex-col gap-1" aria-label="Main navigation">
							{ROUTES.map((route) => (
								<NavItem key={route.to} {...route} />
							))}
						</nav>
					</div>
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col">
				<Header />
				{children}
			</div>
		</div>
	);
}
