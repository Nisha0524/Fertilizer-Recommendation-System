import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Trigger custom event to notify App component
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <span>🌱</span> Fertilizer System
        </div>
        <div className="nav-links">
          <Link to="/home">{t('home')}</Link>
          <Link to="/about">{t('about')}</Link>
          <Link to="/planner">{t('planner')}</Link>
          <Link to="/tutorials">{t('videoTutorials') || 'Video Tutorials'}</Link>
          <Link to="/weather">{t('weather')}</Link>
          <Link to="/calendar">{t('calendar')}</Link>
          <Link to="/dashboard">{t('dashboard')}</Link>
          <Link to="/history">{t('history')}</Link>
          <button onClick={handleLogout} className="nav-logout">
            {t('logout')}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

