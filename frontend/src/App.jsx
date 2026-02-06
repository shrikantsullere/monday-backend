import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PortfolioPipeline from './components/PortfolioPipeline';
import Board from './components/Board';
// Remove specialized imports if not used anymore
import FileCenter from './components/FileCenter';
import FormsBuilder from './components/FormsBuilder';
import SearchPage from './components/SearchPage';
import SettingsPage from './components/SettingsPage';
import MyWork from './components/MyWork';
import Notifications from './components/Notifications';
import Automations from './components/Automations';
import UsersPage from './components/UsersPage';
import MainLayout from './components/MainLayout';

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pipeline" element={<PortfolioPipeline />} />
        <Route path="/board/:id" element={<Board />} />
        <Route path="/board" element={<Board />} />

        {/* Redirect specialized paths to Board with appropriate IDs if needed, 
            but since we have a dynamic sidebar, we can just use /board/:id */}
        <Route path="/ai-future-projects" element={<Board />} />
        <Route path="/ai-roadmap" element={<Board />} />
        <Route path="/commercial-sira" element={<Board />} />
        <Route path="/dm-inquiries" element={<Board />} />

        <Route path="/files" element={<FileCenter />} />
        <Route path="/board/:id/form" element={<FormsBuilder />} />
        <Route path="/forms" element={<FormsBuilder />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/my-work" element={<MyWork />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated
          ? <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
          : <Login />
      } />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithProvider;
