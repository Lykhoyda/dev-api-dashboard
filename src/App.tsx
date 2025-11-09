import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ApiKeys } from './pages/ApiKeys';
import { Dashboard } from './pages/Dashboard';
import { Documentation } from './pages/Documentation';
import { Usage } from './pages/Usage';

function App() {
	return (
		<div className="dark">
			<BrowserRouter>
				<AppShell>
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/keys" element={<ApiKeys />} />
						<Route path="/usage" element={<Usage />} />
						<Route path="/docs" element={<Documentation />} />
						{/* Redirect any unknown routes to dashboard */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</AppShell>
			</BrowserRouter>
		</div>
	);
}

export default App;
