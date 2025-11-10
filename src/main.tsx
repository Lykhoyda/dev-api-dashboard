import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';
import { initializeSampleKeys } from './lib';

// Apply dark theme
document.documentElement.classList.add('dark');

// Initialize sample API keys if none exist
initializeSampleKeys();

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Root element not found');
}

createRoot(rootElement).render(
	<StrictMode>
		<AuthProvider>
			<EnvironmentProvider>
				<FeatureFlagsProvider>
					<App />
				</FeatureFlagsProvider>
			</EnvironmentProvider>
		</AuthProvider>
	</StrictMode>
);
