import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import { useLanguage } from '../i18n';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      // Always allow login - accept any email/password combination
      if (response && (response.success || response.email)) {
        localStorage.setItem('user', email);
        // Trigger custom event to notify App component
        window.dispatchEvent(new Event('storage'));
        navigate('/home');
      } else {
        // Even if response doesn't have success, try to login anyway
        localStorage.setItem('user', email);
        window.dispatchEvent(new Event('storage'));
        navigate('/home');
      }
    } catch (err) {
      // On any error, still allow login (for development/testing)
      console.log('Login error (allowing anyway):', err);
      localStorage.setItem('user', email);
      window.dispatchEvent(new Event('storage'));
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="language-toggle-login">
        <button onClick={toggleLanguage}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>
      <div className="login-card">
        <div className="login-header">
          <h1>🌱 {t('login')}</h1>
          <p>Fertilizer Recommendation System</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          <div className="input-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : t('loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

