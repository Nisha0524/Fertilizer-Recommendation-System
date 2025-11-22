import React from 'react';
import { useLanguage } from '../i18n';
import './Dashboard.css';

const Dashboard = () => {
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
          <h1>{t('modelAccuracy')}</h1>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">{t('accuracy')}</div>
              <div className="metric-value">92.45%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t('precision')}</div>
              <div className="metric-value">0.9458</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t('recall')}</div>
              <div className="metric-value">0.9012</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t('f1Score')}</div>
              <div className="metric-value">0.9229</div>
            </div>
          </div>
          <div className="confusion-matrix-container">
            <h2>Confusion Matrix</h2>
            <img 
              src="http://localhost:5000/static/confusion_matrix.png" 
              alt="Confusion Matrix"
              className="confusion-matrix-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="image-placeholder" style={{display: 'none'}}>
              <p>Confusion matrix will be displayed here after model training.</p>
              <p>Please run: python model_train.py in the backend directory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

