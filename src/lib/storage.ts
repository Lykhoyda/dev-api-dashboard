/**
 * localStorage utilities with safe fallbacks
 */

/**
 * Check if localStorage is available.
 * Returns false in SSR, tests, or hardened browsers.
 */
export function isStorageAvailable(): boolean {
	try {
		return typeof window !== 'undefined' && Boolean(window.localStorage);
	} catch {
		return false;
	}
}

/**
 * Safely get an item from localStorage
 * @param key - The storage key
 * @param fallback - Fallback value if storage is unavailable or key doesn't exist
 * @returns The parsed value or fallback
 */
export function getStorageItem<T>(key: string, fallback: T): T {
	if (!isStorageAvailable()) {
		return fallback;
	}

	try {
		const item = localStorage.getItem(key);
		return item ? (JSON.parse(item) as T) : fallback;
	} catch {
		return fallback;
	}
}

/**
 * Safely set an item in localStorage
 * @param key - The storage key
 * @param value - The value to store (will be JSON stringified)
 * @returns true if successful, false otherwise
 */
export function setStorageItem<T>(key: string, value: T): boolean {
	if (!isStorageAvailable()) {
		return false;
	}

	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

/**
 * Safely remove an item from localStorage
 * @param key - The storage key
 * @returns true if successful, false otherwise
 */
export function removeStorageItem(key: string): boolean {
	if (!isStorageAvailable()) {
		return false;
	}

	try {
		localStorage.removeItem(key);
		return true;
	} catch {
		return false;
	}
}
