import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';
import { initializeApiKeys } from './lib/apiKeys';

document.documentElement.classList.add('dark');

initializeApiKeys();

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
