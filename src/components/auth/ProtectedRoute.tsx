import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
	children: ReactNode;
}

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 *
 * Features:
 * - Checks authentication state from AuthContext
 * - Shows loading state while authentication is being verified
 * - Redirects to /login if user is not authenticated
 * - Renders children if user is authenticated
 *
 * @example
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   }
 * />
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <Loading fullPage size="lg" text="Loading..." />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}
