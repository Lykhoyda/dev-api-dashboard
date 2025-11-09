import type { LucideIcon } from 'lucide-react';
import { BarChart3, BookOpen, Key, LayoutDashboard } from 'lucide-react';

export interface RouteConfig {
	to: string;
	icon: LucideIcon;
	label: string;
	fillWhenActive?: boolean;
}

/**
 * Centralized route configuration for the application.
 * Single source of truth for all navigation-related data.
 * Used by: AppShell (sidebar navigation), Header (breadcrumbs)
 */
export const ROUTES: RouteConfig[] = [
	{ to: '/', icon: LayoutDashboard, label: 'Dashboard', fillWhenActive: true },
	{ to: '/keys', icon: Key, label: 'API Keys' },
	{ to: '/usage', icon: BarChart3, label: 'Usage' },
	{ to: '/docs', icon: BookOpen, label: 'Documentation' }
] as const;

/**
 * Get route label by path. Returns 'Dashboard' as fallback.
 * Used by Header component for breadcrumb generation.
 */
export function getRouteLabel(pathname: string): string {
	const route = ROUTES.find((r) => r.to === pathname);
	return route?.label ?? 'Dashboard';
}
