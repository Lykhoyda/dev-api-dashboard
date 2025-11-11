import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Login page component with guest authentication.
 * Provides a simple "Sign in as Guest" flow without requiring credentials.
 *
 * Features:
 * - Guest sign-in button with loading state
 * - Automatic redirect to dashboard after successful login
 * - Redirects authenticated users away from login page
 * - Error handling for localStorage unavailability
 *
 * @example
 * <Route path="/login" element={<Login />} />
 */
export function Login() {
	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/', { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const handleGuestLogin = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await new Promise((resolve) => setTimeout(resolve, 500));

			const success = await login('guest@example.com', 'Guest User');

			if (success) {
				navigate('/', { replace: true });
			} else {
				setError(
					'Unable to save session. Please check that localStorage is enabled in your browser.'
				);
			}
		} catch (err) {
			console.error('Login failed:', err);
			setError('An unexpected error occurred during login. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
			<div className="w-full max-w-md">
				<div className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-dark/10 border border-primary-dark/20 mb-6">
						<LogIn className="w-8 h-8 text-primary-dark" aria-hidden="true" />
					</div>
					<h1 className="text-3xl font-bold tracking-tight text-text-primary-dark mb-2">
						Welcome to Dev Console
					</h1>
					<p className="text-base text-text-secondary-dark">
						Sign in to manage your API keys and view analytics
					</p>
				</div>

				<div className="rounded-xl p-8 bg-surface-dark border border-border-dark shadow-md-dark">
					<div className="flex flex-col gap-6">
						{error && (
							<div
								className="p-4 rounded-lg bg-error-dark/10 border border-error-dark/20"
								role="alert"
							>
								<p className="text-sm text-error-dark">{error}</p>
							</div>
						)}

						<button
							type="button"
							onClick={handleGuestLogin}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-dark text-white font-medium transition-all duration-200 hover:bg-primary-dark/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
							aria-label="Sign in as guest user"
						>
							{isLoading ? (
								<>
									<Loading size="sm" />
									<span>Signing in...</span>
								</>
							) : (
								<>
									<LogIn className="w-5 h-5" aria-hidden="true" />
									<span>Sign in as Guest</span>
								</>
							)}
						</button>

						<div className="pt-4 border-t border-divider-dark">
							<p className="text-xs text-text-tertiary-dark text-center">
								This is a demo application. Guest sign-in creates a mock session
								without requiring real credentials.
							</p>
						</div>
					</div>
				</div>

				<p className="text-xs text-text-tertiary-dark text-center mt-8">
					Session expires after 24 hours
				</p>
			</div>
		</div>
	);
}
