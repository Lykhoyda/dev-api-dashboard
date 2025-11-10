import { AlertTriangle, FlaskConical, Rocket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	type EnvironmentMode,
	useEnvironment
} from '@/contexts/EnvironmentContext';

/**
 * EnvironmentToggle - Segmented control for switching between test and production modes.
 *
 * Design follows industry best practices from Stripe, Vercel, and Twilio:
 * - Both options always visible (segmented control pattern)
 * - Active segment has filled background with brand color
 * - Inactive segment has neutral styling with hover states
 * - Smooth sliding animation on mode change
 * - Full keyboard navigation support
 * - Screen reader accessible
 * - Confirmation dialog when switching to production (safety check)
 *
 * Safety Features:
 * - Shows warning dialog before switching to production mode
 * - Prevents accidental activation of production mode
 * - No confirmation needed when switching back to test mode
 * - Works for both click and keyboard navigation
 *
 * Accessibility:
 * - role="radiogroup" for the container
 * - role="radio" for each segment
 * - Arrow keys to navigate between options
 * - Space/Enter to activate selected option
 * - Focus visible styles for keyboard users
 * - Announces current selection to screen readers
 * - Dialog accessible with keyboard (Esc to cancel)
 *
 * @example
 * <EnvironmentToggle />
 */
export function EnvironmentToggle() {
	const { mode, setMode } = useEnvironment();
	const testRef = useRef<HTMLButtonElement>(null);
	const productionRef = useRef<HTMLButtonElement>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	// Handle keyboard navigation
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const target = event.target as HTMLElement;
			if (
				!target.matches('[role="radio"]') ||
				!target.closest('[data-environment-toggle]')
			) {
				return;
			}

			switch (event.key) {
				case 'ArrowLeft':
				case 'ArrowUp':
					event.preventDefault();
					if (mode === 'production') {
						setMode('test');
						testRef.current?.focus();
					}
					break;
				case 'ArrowRight':
				case 'ArrowDown':
					event.preventDefault();
					if (mode === 'test') {
						setShowConfirmDialog(true);
					}
					break;
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [mode, setMode]);

	const handleModeChange = (newMode: EnvironmentMode) => {
		if (newMode === 'production' && mode === 'test') {
			setShowConfirmDialog(true);
		} else {
			setMode(newMode);
		}
	};

	const handleConfirmProduction = () => {
		setMode('production');
		setShowConfirmDialog(false);
		productionRef.current?.focus();
	};

	const handleCancelProduction = () => {
		setShowConfirmDialog(false);
		testRef.current?.focus();
	};

	return (
		<>
			<div
				role="radiogroup"
				aria-label="Environment mode"
				data-environment-toggle
				className="inline-flex items-center gap-0 p-1 rounded-full bg-surface-elevated-dark border border-border-dark"
			>
				{/* Test Mode Segment */}
				<button
					ref={testRef}
					type="button"
					role="radio"
					aria-checked={mode === 'test'}
					tabIndex={mode === 'test' ? 0 : -1}
					onClick={() => handleModeChange('test')}
					className={`
					relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
					transition-all duration-200 ease-out
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark
					${
						mode === 'test'
							? 'bg-warning-dark/20 text-warning-dark shadow-sm'
							: 'text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5'
					}
				`}
				>
					<FlaskConical
						size={14}
						className={`transition-opacity duration-200 ${mode === 'test' ? 'opacity-100' : 'opacity-70'}`}
						aria-hidden="true"
					/>
					<span className="whitespace-nowrap">Test</span>
				</button>

				{/* Production Mode Segment */}
				<button
					ref={productionRef}
					type="button"
					role="radio"
					aria-checked={mode === 'production'}
					tabIndex={mode === 'production' ? 0 : -1}
					onClick={() => handleModeChange('production')}
					className={`
					relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
					transition-all duration-200 ease-out
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark
					${
						mode === 'production'
							? 'bg-success-dark/20 text-success-dark shadow-sm'
							: 'text-text-secondary-dark hover:text-text-primary-dark hover:bg-white/5'
					}
				`}
				>
					<Rocket
						size={14}
						className={`transition-opacity duration-200 ${mode === 'production' ? 'opacity-100' : 'opacity-70'}`}
						aria-hidden="true"
					/>
					<span className="whitespace-nowrap">Production</span>
				</button>
			</div>

			{/* Production Mode Confirmation Dialog */}
			<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<DialogContent className="bg-surface-dark border-border-dark">
					<DialogHeader>
						<div className="flex items-center gap-3 mb-2">
							<div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning-dark/20">
								<AlertTriangle
									className="w-5 h-5 text-warning-dark"
									aria-hidden="true"
								/>
							</div>
							<DialogTitle className="text-text-primary-dark text-xl">
								Switch to Production Mode?
							</DialogTitle>
						</div>
						<DialogDescription className="text-text-secondary-dark text-base">
							You're about to switch to production mode. This will display real
							data instead of test data. Any API keys you create will be live
							keys.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-6">
						<button
							type="button"
							onClick={handleCancelProduction}
							className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary-dark bg-surface-elevated-dark border border-border-dark hover:bg-surface-elevated-dark/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleConfirmProduction}
							className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-success-dark hover:bg-success-dark/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark"
						>
							Switch to Production
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
