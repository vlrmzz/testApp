import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

// Habits API
export const habitsAPI = {
  getHabits: () => api.get('/habits'),
  getHabit: (id) => api.get(`/habits/${id}`),
  createHabit: (habitData) => api.post('/habits', habitData),
  updateHabit: (id, habitData) => api.put(`/habits/${id}`, habitData),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  logEntry: (id, entryData) => api.post(`/habits/${id}/entries`, entryData),
  getEntries: (id, params) => api.get(`/habits/${id}/entries`, { params }),
  getStreak: (id) => api.get(`/habits/${id}/streak`),
};

// Social API
export const socialAPI = {
  searchUsers: (query) => api.get(`/social/users/search?q=${encodeURIComponent(query)}`),
  sendFriendRequest: (userId) => api.post('/social/friends/request', { user_id: userId }),
  getFriendRequests: () => api.get('/social/friends/requests'),
  respondToFriendRequest: (id, action) => api.put(`/social/friends/requests/${id}`, { action }),
  getFriends: () => api.get('/social/friends'),
  removeFriend: (id) => api.delete(`/social/friends/${id}`),
  sendCheer: (cheerData) => api.post('/social/cheers', cheerData),
  getCheers: () => api.get('/social/cheers'),
  getFeed: () => api.get('/social/feed'),
};

export default api;