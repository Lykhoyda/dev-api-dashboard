import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react';
import { isStorageAvailable } from '@/lib/storage';

/**
 * Environment modes supported by the application.
 * - test: Sandbox mode for testing with synthetic data
 * - production: Live mode with real data (future implementation)
 */
export type EnvironmentMode = 'test' | 'production';

const STORAGE_KEY = 'environment_mode';
const DEFAULT_MODE: EnvironmentMode = 'test';

interface EnvironmentContextValue {
	mode: EnvironmentMode;
	isTestMode: boolean;
	isProductionMode: boolean;
	setMode: (mode: EnvironmentMode) => void;
	toggleMode: () => void;
}

const EnvironmentContext = createContext<EnvironmentContextValue | undefined>(
	undefined
);

/**
 * Load environment mode from localStorage.
 * Returns default mode if not found, invalid, or storage unavailable.
 */
function loadMode(): EnvironmentMode {
	if (!isStorageAvailable()) {
		return DEFAULT_MODE;
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'test' || stored === 'production') {
			return stored;
		}
		return DEFAULT_MODE;
	} catch (error) {
		console.error('Failed to load environment mode:', error);
		return DEFAULT_MODE;
	}
}

/**
 * Save environment mode to localStorage.
 * Returns true if successful, false if storage fails or is unavailable.
 */
function saveMode(mode: EnvironmentMode): boolean {
	if (!isStorageAvailable()) {
		console.warn(
			'localStorage unavailable - environment mode will not persist'
		);
		return false;
	}

	try {
		localStorage.setItem(STORAGE_KEY, mode);
		return true;
	} catch (error) {
		console.error('Failed to save environment mode:', error);
		return false;
	}
}

interface EnvironmentProviderProps {
	children: ReactNode;
}

/**
 * EnvironmentProvider component that manages environment mode state.
 * Wraps the application to provide environment context to all components.
 *
 * Features:
 * - Test/production mode management
 * - Persistent mode via localStorage (with availability checks)
 * - Type-safe mode values
 * - Toggle function for easy switching
 * - Multi-tab synchronization via storage events
 * - Defaults to test mode for safety
 *
 * @example
 * <EnvironmentProvider>
 *   <App />
 * </EnvironmentProvider>
 */
export function EnvironmentProvider({ children }: EnvironmentProviderProps) {
	const [mode, setModeState] = useState<EnvironmentMode>(() => loadMode());

	/**
	 * Set environment mode and persist to localStorage.
	 * Updates state even if storage fails (mode active in current session only).
	 */
	const setMode = useCallback((newMode: EnvironmentMode) => {
		setModeState(newMode);
		const saved = saveMode(newMode);

		if (!saved) {
			console.warn('Mode changed to', newMode, 'but will not persist');
		}
	}, []);

	/**
	 * Toggle between test and production modes.
	 */
	const toggleMode = useCallback(() => {
		setMode(mode === 'test' ? 'production' : 'test');
	}, [mode, setMode]);

	// Multi-tab synchronization via storage events
	useEffect(() => {
		if (!isStorageAvailable()) {
			return;
		}

		function handleStorageChange(e: StorageEvent) {
			// Only handle changes to our environment mode key
			if (e.key !== STORAGE_KEY) {
				return;
			}

			// Mode was updated in another tab
			if (e.newValue === 'test' || e.newValue === 'production') {
				setModeState(e.newValue);
			} else {
				// Invalid value or key removed - reset to default
				setModeState(DEFAULT_MODE);
			}
		}

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	// Sync mode with localStorage on mount
	useEffect(() => {
		const loadedMode = loadMode();
		if (loadedMode !== mode) {
			setModeState(loadedMode);
		}
	}, [mode]);

	const value = useMemo<EnvironmentContextValue>(
		() => ({
			mode,
			isTestMode: mode === 'test',
			isProductionMode: mode === 'production',
			setMode,
			toggleMode
		}),
		[mode, setMode, toggleMode]
	);

	return (
		<EnvironmentContext.Provider value={value}>
			{children}
		</EnvironmentContext.Provider>
	);
}

/**
 * Hook to access environment context.
 * Must be used within an EnvironmentProvider.
 *
 * @example
 * function MyComponent() {
 *   const { mode, isTestMode, toggleMode } = useEnvironment();
 *
 *   return (
 *     <div>
 *       Current mode: {mode}
 *       <button onClick={toggleMode}>
 *         Switch to {isTestMode ? 'Production' : 'Test'}
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useEnvironment(): EnvironmentContextValue {
	const context = useContext(EnvironmentContext);
	if (context === undefined) {
		throw new Error(
			'useEnvironment must be used within an EnvironmentProvider'
		);
	}
	return context;
}
