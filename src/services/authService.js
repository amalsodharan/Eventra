import axios from 'axios';

const BASE_URL = 'https://eventra-18by.onrender.com';

// Decode JWT payload without external library
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`https://eventra-18by.onrender.com/api/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem('eventra_token', response.data.token);
        const decoded = decodeToken(response.data.token);
        localStorage.setItem('eventra_user', JSON.stringify({
          email,
          id: decoded?.id,
          role: decoded?.role,
        }));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`https://eventra-18by.onrender.com/api/createUser`, userData);
      if (response.data.token) {
        localStorage.setItem('eventra_token', response.data.token);
        const decoded = decodeToken(response.data.token);
        localStorage.setItem('eventra_user', JSON.stringify({
          email: userData.email,
          id: decoded?.id,
          role: decoded?.role,
        }));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('eventra_token');
    localStorage.removeItem('eventra_user');
  },

  getToken: () => localStorage.getItem('eventra_token'),

  isAuthenticated: () => {
    const token = localStorage.getItem('eventra_token');
    if (!token) return false;
    const decoded = decodeToken(token);
    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('eventra_token');
      localStorage.removeItem('eventra_user');
      return false;
    }
    return true;
  },

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('eventra_user'));
    } catch {
      return null;
    }
  },

  getCurrentUserId: () => {
    try {
      const user = JSON.parse(localStorage.getItem('eventra_user'));
      return user?.id || null;
    } catch {
      return null;
    }
  },
};

export default authService;
