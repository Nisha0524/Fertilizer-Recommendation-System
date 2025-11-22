import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getHistory } from '../api/api';
import './History.css';

const History = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userEmail = localStorage.getItem('user') || 'guest@example.com';
        const response = await getHistory(userEmail);
        if (response && response.success) {
          setHistory(response.history || []);
          setFilteredHistory(response.history || []);
          setError(''); // Clear any previous errors
        } else if (response && response.error) {
          setError(response.error);
        } else {
          setError('Failed to load history');
        }
      } catch (err) {
        console.error('History error:', err);
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:5000');
        } else if (err.response) {
          setError(err.response.data?.error || err.response.data?.message || 'Server error occurred');
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('An error occurred while loading history. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter and sort history
  useEffect(() => {
    let filtered = [...history];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => {
        const searchLower = searchTerm.toLowerCase();
        return (
          entry.inputs.crop?.toLowerCase().includes(searchLower) ||
          entry.recommendation.fertilizer?.toLowerCase().includes(searchLower) ||
          entry.inputs.soil_type?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredHistory(filtered);
  }, [searchTerm, sortBy, history]);

  return (
    <div>
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>
      <div className="container">
        <div className="card">
          <h1>{t('recommendationHistory')}</h1>
          
          {history.length > 0 && (
            <div className="history-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder={t('searchHistory')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="sort-box">
                <label>{t('sortBy')}:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">{t('newestFirst')}</option>
                  <option value="oldest">{t('oldestFirst')}</option>
                </select>
              </div>
            </div>
          )}

          {loading && <p className="loading-text">{t('loading')}...</p>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && history.length === 0 && (
            <div className="no-history">
              <p>{t('noHistory')}</p>
            </div>
          )}
          {!loading && !error && history.length > 0 && filteredHistory.length === 0 && (
            <div className="no-history">
              <p>{t('noResults')}</p>
            </div>
          )}
          {!loading && !error && filteredHistory.length > 0 && (
            <div className="history-stats">
              <p>{t('showing')} {filteredHistory.length} {t('of')} {history.length} {t('recommendations')}</p>
            </div>
          )}
          {!loading && !error && filteredHistory.length > 0 && (
            <div className="history-list">
              {filteredHistory.map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-header">
                    <span className="history-timestamp">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-content">
                    <div className="history-inputs">
                      <h3>{t('inputs')}</h3>
                      <div className="input-grid">
                        <span>N: {entry.inputs.N}</span>
                        <span>P: {entry.inputs.P}</span>
                        <span>K: {entry.inputs.K}</span>
                        <span>Temp: {entry.inputs.temperature}°C</span>
                        <span>Humidity: {entry.inputs.humidity}%</span>
                        <span>pH: {entry.inputs.ph}</span>
                        <span>Moisture: {entry.inputs.moisture}%</span>
                        <span>Crop: {entry.inputs.crop}</span>
                        {entry.inputs.soil_type && <span>Soil: {entry.inputs.soil_type}</span>}
                        {entry.inputs.hectare_area && <span>Area: {entry.inputs.hectare_area} ha</span>}
                      </div>
                    </div>
                    <div className="history-recommendation">
                      <h3>{t('recommendation')}</h3>
                      <div className="recommendation-info">
                        <p><strong>{t('fertilizer')}:</strong> {entry.recommendation.fertilizer}</p>
                        <p><strong>{t('dosage')}:</strong> {entry.recommendation.dosage}</p>
                        <p><strong>{t('remarks')}:</strong> {entry.recommendation.remarks}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

