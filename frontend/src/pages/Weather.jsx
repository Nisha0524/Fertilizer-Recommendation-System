import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import './Weather.css';

const Weather = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock weather data - in production, integrate with a weather API
  const getWeatherData = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock weather data based on location
      const mockWeather = {
        location: location,
        temperature: Math.floor(Math.random() * 15) + 25, // 25-40°C
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
        rainfall: Math.floor(Math.random() * 50), // 0-50 mm
        forecast: [
          { day: 'Today', temp: Math.floor(Math.random() * 15) + 25, condition: 'Sunny' },
          { day: 'Tomorrow', temp: Math.floor(Math.random() * 15) + 25, condition: 'Partly Cloudy' },
          { day: 'Day 3', temp: Math.floor(Math.random() * 15) + 25, condition: 'Cloudy' }
        ]
      };
      setWeatherData(mockWeather);
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getWeatherData();
  };

  return (
    <div>
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>
      <div className="container">
        <div className="card">
          <h1>{t('weather')}</h1>
          <form onSubmit={handleSubmit} className="weather-form">
            <div className="input-group">
              <label>{t('location')}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('enterLocation')}
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? t('loading') : t('getWeather')}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          {weatherData && (
            <div className="weather-display">
              <div className="weather-header">
                <h2>{weatherData.location}</h2>
                <div className="weather-main">
                  <div className="weather-icon">
                    {weatherData.condition === 'Sunny' ? '☀️' : 
                     weatherData.condition === 'Rainy' ? '🌧️' : 
                     weatherData.condition === 'Cloudy' ? '☁️' : '⛅'}
                  </div>
                  <div className="weather-temp">
                    <span className="temp-value">{weatherData.temperature}°C</span>
                    <span className="temp-condition">{weatherData.condition}</span>
                  </div>
                </div>
              </div>

              <div className="weather-details">
                <div className="weather-detail-item">
                  <span className="detail-label">{t('humidity')}</span>
                  <span className="detail-value">{weatherData.humidity}%</span>
                </div>
                <div className="weather-detail-item">
                  <span className="detail-label">{t('windSpeed')}</span>
                  <span className="detail-value">{weatherData.windSpeed} km/h</span>
                </div>
                <div className="weather-detail-item">
                  <span className="detail-label">{t('rainfall')}</span>
                  <span className="detail-value">{weatherData.rainfall} mm</span>
                </div>
              </div>

              <div className="weather-forecast">
                <h3>{t('forecast')}</h3>
                <div className="forecast-grid">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="forecast-item">
                      <div className="forecast-day">{day.day}</div>
                      <div className="forecast-temp">{day.temp}°C</div>
                      <div className="forecast-condition">{day.condition}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="weather-tips">
                <h3>{t('farmingTips')}</h3>
                <ul>
                  {weatherData.temperature > 35 && (
                    <li>{t('highTempTip')}</li>
                  )}
                  {weatherData.rainfall > 20 && (
                    <li>{t('rainfallTip')}</li>
                  )}
                  {weatherData.humidity > 70 && (
                    <li>{t('highHumidityTip')}</li>
                  )}
                  {weatherData.temperature >= 25 && weatherData.temperature <= 35 && weatherData.rainfall < 10 && (
                    <li>{t('idealConditionsTip')}</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {!weatherData && !loading && (
            <div className="weather-placeholder">
              <p>{t('weatherPlaceholder')}</p>
              <div className="weather-icon">🌤️</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;
