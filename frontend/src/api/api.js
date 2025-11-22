import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      error.message = 'Cannot connect to server. Please ensure the backend is running.';
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getRecommendation = async (data) => {
  const response = await api.post('/recommend', data);
  return response.data;
};

export const getHistory = async (userEmail) => {
  const response = await api.get('/history', {
    params: { user_email: userEmail },
  });
  return response.data;
};

export const getYouTubeVideos = async (crop) => {
  const response = await api.get('/youtube-videos', {
    params: { crop },
  });
  return response.data;
};

export default api;

