import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TableManagementPage from './pages/TableManagementPage';
import MenuManagementPage from './pages/MenuManagementPage';
import CategoryManagementPage from './pages/CategoryManagementPage';

function App() {
  const { login, logout, isLoggedIn, session } = useAuth();

  if (!isLoggedIn) {
    return (
      <BrowserRouter>
        <LoginPage onLogin={login} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout storeName={session?.username ?? '관리자'} onLogout={logout} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tables" element={<TableManagementPage />} />
          <Route path="/menus" element={<MenuManagementPage />} />
          <Route path="/categories" element={<CategoryManagementPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
