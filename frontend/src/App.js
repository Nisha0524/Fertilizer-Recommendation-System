import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import About from './pages/About';
import PlannerPage from './pages/PlannerPage';
import Tutorials from './pages/Tutorials';
import Weather from './pages/Weather';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import CropCalendar from './pages/CropCalendar';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));

  useEffect(() => {
    // Check login status on route change
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem('user'));
    };
    
    checkLogin();
    // Listen for storage changes (when user logs in/out)
    window.addEventListener('storage', checkLogin);
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(checkLogin, 100);
    
    return () => {
      window.removeEventListener('storage', checkLogin);
      clearInterval(interval);
    };
  }, [location]);

  const showNavbar = isLoggedIn && location.pathname !== '/login';

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/home" />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
        <Route path="/tutorials" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;

