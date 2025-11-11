import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { Toaster } from './components/ui/sonner';
import { ApiKeys } from './pages/ApiKeys';
import { Dashboard } from './pages/Dashboard';
import { Documentation } from './pages/Documentation';
import { Login } from './pages/Login';
import { Usage } from './pages/Usage';

function App() {
	return (
		<div className="dark">
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />

					<Route
						path="/"
						element={
							<ProtectedRoute>
								<AppShell>
									<Dashboard />
								</AppShell>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/keys"
						element={
							<ProtectedRoute>
								<AppShell>
									<ApiKeys />
								</AppShell>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/usage"
						element={
							<ProtectedRoute>
								<AppShell>
									<Usage />
								</AppShell>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/docs"
						element={
							<ProtectedRoute>
								<AppShell>
									<Documentation />
								</AppShell>
							</ProtectedRoute>
						}
					/>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
				<Toaster />
			</BrowserRouter>
		</div>
	);
}

export default App;
