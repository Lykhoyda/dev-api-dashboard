import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState
} from 'react';

/**
 * Feature flags configuration
 * Add new flags here as the product evolves
 */
interface FeatureFlags {
	cardViewForApiKeys: boolean;
}

interface FeatureFlagsContextType {
	flags: FeatureFlags;
	toggleFlag: (flag: keyof FeatureFlags) => void;
	isEnabled: (flag: keyof FeatureFlags) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
	undefined
);

/**
 * Default feature flag values
 * Set to false for new features (gradual rollout)
 */
const DEFAULT_FLAGS: FeatureFlags = {
	cardViewForApiKeys: false
};

const STORAGE_KEY = 'feature_flags';

/**
 * Feature Flags Provider
 * Manages feature flag state with localStorage persistence
 */
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
	const [flags, setFlags] = useState<FeatureFlags>(() => {
		if (typeof window === 'undefined') return DEFAULT_FLAGS;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as Partial<FeatureFlags>;
				return { ...DEFAULT_FLAGS, ...parsed };
			}
		} catch (error) {
			console.error('Failed to load feature flags from localStorage:', error);
		}

		return DEFAULT_FLAGS;
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
		} catch (error) {
			console.error('Failed to save feature flags to localStorage:', error);
		}
	}, [flags]);

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === STORAGE_KEY && e.newValue) {
				try {
					const parsed = JSON.parse(e.newValue) as Partial<FeatureFlags>;
					setFlags({ ...DEFAULT_FLAGS, ...parsed });
				} catch (error) {
					console.error(
						'Failed to parse feature flags from storage event:',
						error
					);
				}
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	const toggleFlag = (flag: keyof FeatureFlags) => {
		setFlags((prev) => ({
			...prev,
			[flag]: !prev[flag]
		}));
	};

	const isEnabled = (flag: keyof FeatureFlags): boolean => {
		return flags[flag];
	};

	return (
		<FeatureFlagsContext.Provider value={{ flags, toggleFlag, isEnabled }}>
			{children}
		</FeatureFlagsContext.Provider>
	);
}

/**
 * Hook to access feature flags
 * @throws Error if used outside FeatureFlagsProvider
 */
export function useFeatureFlags() {
	const context = useContext(FeatureFlagsContext);
	if (!context) {
		throw new Error(
			'useFeatureFlags must be used within a FeatureFlagsProvider'
		);
	}
	return context;
}
