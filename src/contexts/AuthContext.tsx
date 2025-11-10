import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import { isStorageAvailable } from '@/lib/storage';

/**
 * SECURITY NOTE: This is a DEMO implementation for showcase purposes only.
 *
 * Limitations in production:
 * - Tokens stored in plain text in localStorage (vulnerable to XSS)
 * - No server-side validation or refresh token rotation
 * - No CSRF protection
 * - Mock token generation (not cryptographically secure for auth)
 *
 * For production:
 * - Use HTTP-only cookies for tokens
 * - Implement proper OAuth2/OIDC flow
 * - Add server-side session validation
 * - Use secure token generation from auth provider
 * - Implement CSRF protection
 */

// Session duration: 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'auth_session';

interface User {
	id: string;
	name: string;
	email: string;
}

interface Session {
	user: User;
	token: string;
	expiresAt: number;
}

interface AuthContextValue {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email?: string, name?: string) => Promise<boolean>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Generate a mock JWT-style token for demo purposes.
 * In production, this would be provided by an authentication service.
 *
 * Uses crypto.randomUUID() for better entropy than Math.random(),
 * though still not suitable for real authentication.
 */
function generateMockToken(): string {
	// Use crypto.randomUUID() if available, fallback to Math.random()
	const randomPart =
		typeof crypto !== 'undefined' && crypto.randomUUID
			? crypto.randomUUID()
			: Math.random().toString(36).substring(2, 15);
	const timestamp = Date.now().toString(36);
	return `mock_${timestamp}_${randomPart}`;
}

/**
 * Load session from localStorage and validate expiry.
 * Returns null if session is expired, invalid, or storage unavailable.
 */
function loadSession(): Session | null {
	if (!isStorageAvailable()) {
		return null;
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return null;

		const session: Session = JSON.parse(stored);

		// Check if session is expired
		if (Date.now() >= session.expiresAt) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}

		return session;
	} catch (error) {
		console.error('Failed to load session:', error);
		if (isStorageAvailable()) {
			localStorage.removeItem(STORAGE_KEY);
		}
		return null;
	}
}

/**
 * Save session to localStorage.
 * Returns true if successful, false if storage fails or is unavailable.
 */
function saveSession(session: Session): boolean {
	if (!isStorageAvailable()) {
		console.warn('localStorage unavailable - session will not persist');
		return false;
	}

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
		return true;
	} catch (error) {
		console.error('Failed to save session:', error);
		return false;
	}
}

/**
 * Clear session from localStorage.
 */
function clearSession(): void {
	if (!isStorageAvailable()) {
		return;
	}

	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error('Failed to clear session:', error);
	}
}

interface AuthProviderProps {
	children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state.
 * Wraps the application to provide auth context to all components.
 *
 * Features:
 * - Mock session with 24-hour expiry
 * - Persistent sessions via localStorage (with availability checks)
 * - Automatic token expiry handling with timeout
 * - Guest login with customizable user info
 * - Multi-tab synchronization via storage events
 * - Manual login required (no auto-login)
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const expiryTimeoutRef = useRef<number | null>(null);

	/**
	 * Clear any existing expiry timeout.
	 */
	const clearExpiryTimeout = useCallback(() => {
		if (expiryTimeoutRef.current !== null) {
			clearTimeout(expiryTimeoutRef.current);
			expiryTimeoutRef.current = null;
		}
	}, []);

	/**
	 * Set a timeout to auto-logout when session expires.
	 */
	const setExpiryTimeout = useCallback(
		(expiresAt: number) => {
			clearExpiryTimeout();

			const timeUntilExpiry = expiresAt - Date.now();
			if (timeUntilExpiry > 0) {
				expiryTimeoutRef.current = window.setTimeout(() => {
					console.info('Session expired - auto-logout');
					clearSession();
					setSession(null);
				}, timeUntilExpiry);
			}
		},
		[clearExpiryTimeout]
	);

	// Load session on mount and set expiry timeout
	useEffect(() => {
		const loadedSession = loadSession();

		if (loadedSession) {
			setSession(loadedSession);
			setExpiryTimeout(loadedSession.expiresAt);
		}

		setIsLoading(false);
	}, [setExpiryTimeout]);

	/**
	 * Create a guest session with mock user data.
	 * Generates a session token that expires in 24 hours.
	 * Returns true if session was saved successfully, false otherwise.
	 */
	const login = useCallback(
		async (email?: string, name?: string): Promise<boolean> => {
			const user: User = {
				id: `user_${crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11)}`,
				name: name || 'Guest User',
				email: email || 'guest@example.com'
			};

			const newSession: Session = {
				user,
				token: generateMockToken(),
				expiresAt: Date.now() + SESSION_DURATION
			};

			// Attempt to save session
			const saved = saveSession(newSession);

			if (saved) {
				setSession(newSession);
				setExpiryTimeout(newSession.expiresAt);
				return true;
			}

			// If save failed, don't update state to avoid UI showing logged in
			// when session won't persist
			console.error('Failed to persist session - login aborted');
			return false;
		},
		[setExpiryTimeout]
	);

	/**
	 * Clear the current session and remove from storage.
	 */
	const logout = useCallback(() => {
		clearExpiryTimeout();
		clearSession();
		setSession(null);
	}, [clearExpiryTimeout]);

	// Multi-tab synchronization via storage events
	useEffect(() => {
		if (!isStorageAvailable()) {
			return;
		}

		function handleStorageChange(e: StorageEvent) {
			// Only handle changes to our auth session key
			if (e.key !== STORAGE_KEY) {
				return;
			}

			// Session was removed (logout in another tab)
			if (e.newValue === null) {
				clearExpiryTimeout();
				setSession(null);
				return;
			}

			// Session was updated or created in another tab
			try {
				const newSession: Session = JSON.parse(e.newValue);

				// Validate expiry
				if (Date.now() >= newSession.expiresAt) {
					clearExpiryTimeout();
					setSession(null);
					clearSession();
				} else {
					setSession(newSession);
					setExpiryTimeout(newSession.expiresAt);
				}
			} catch (error) {
				console.error('Failed to parse session from storage event:', error);
			}
		}

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, [clearExpiryTimeout, setExpiryTimeout]);

	// Check session validity on visibility change (user returns to tab)
	useEffect(() => {
		function handleVisibilityChange() {
			if (document.visibilityState === 'visible' && session) {
				// Re-validate session when tab becomes visible
				const currentSession = loadSession();
				if (!currentSession) {
					clearExpiryTimeout();
					setSession(null);
				}
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () =>
			document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [session, clearExpiryTimeout]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			clearExpiryTimeout();
		};
	}, [clearExpiryTimeout]);

	const value = useMemo<AuthContextValue>(
		() => ({
			user: session?.user ?? null,
			isAuthenticated: session !== null,
			isLoading,
			login,
			logout
		}),
		[session, isLoading, login, logout]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 *
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login()}>Login as Guest</button>;
 *   }
 *
 *   return <div>Welcome, {user.name}!</div>;
 * }
 */
export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
