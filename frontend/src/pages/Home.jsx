import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import './Home.css';

const Home = () => {
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <div>
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>
      <div className="container">
        <div className="home-hero">
          <h1>{t('welcome')}</h1>
          <p>{t('description')}</p>
          <div className="home-actions">
            <Link to="/planner" className="btn btn-primary">
              {t('planner')}
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              {t('dashboard')}
            </Link>
          </div>
        </div>
        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">🌾</div>
            <h3>AI-Powered Recommendations</h3>
            <p>Get accurate fertilizer recommendations using Machine Learning</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard Analytics</h3>
            <p>View model performance metrics and accuracy</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📜</div>
            <h3>History Tracking</h3>
            <p>Keep track of all your past recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

