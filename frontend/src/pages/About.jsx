import React from 'react';
import { useLanguage } from '../i18n';
import './About.css';

const About = () => {
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <div>
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>
      <div className="container">
        <div className="card">
          <h1>{t('aboutTitle')}</h1>
          <div className="about-content">
            <p>{t('aboutContent')}</p>
            <div className="about-features">
              <h2>Key Features:</h2>
              <ul>
                <li>Machine Learning-based fertilizer recommendation</li>
                <li>Decision Tree Classifier with ~92% accuracy</li>
                <li>Support for multiple crops (tomato, rice, wheat, maize, sugarcane, cotton, brinjal)</li>
                <li>Multilingual interface (English/Tamil)</li>
                <li>PDF report generation</li>
                <li>Recommendation history tracking</li>
                <li>Dashboard with model performance metrics</li>
              </ul>
            </div>
            <div className="about-tech">
              <h2>Technology Stack:</h2>
              <ul>
                <li><strong>Frontend:</strong> React.js</li>
                <li><strong>Backend:</strong> Python Flask</li>
                <li><strong>Database:</strong> MongoDB</li>
                <li><strong>ML Model:</strong> Decision Tree Classifier (scikit-learn)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

