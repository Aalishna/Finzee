import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import FloatingAddButton from './components/FloatingAddButton';
import AddExpenseModal from './components/AddExpenseModal';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Insights from './pages/Insights';
import Goals from './pages/Goals';
import HealthScore from './pages/HealthScore';
import Settings from './pages/Settings';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {React.cloneElement(children, { key: refreshKey })}
      </main>
      <FloatingAddButton onClick={() => setShowAddModal(true)} />
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleExpenseAdded}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route path="/dashboard" element={
              <PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>
            } />
            <Route path="/expenses" element={
              <PrivateRoute><AppLayout><Expenses /></AppLayout></PrivateRoute>
            } />
            <Route path="/budget" element={
              <PrivateRoute><AppLayout><Budget /></AppLayout></PrivateRoute>
            } />
            <Route path="/insights" element={
              <PrivateRoute><AppLayout><Insights /></AppLayout></PrivateRoute>
            } />
            <Route path="/goals" element={
              <PrivateRoute><AppLayout><Goals /></AppLayout></PrivateRoute>
            } />
            <Route path="/health-score" element={
              <PrivateRoute><AppLayout><HealthScore /></AppLayout></PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute><AppLayout><Settings /></AppLayout></PrivateRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
