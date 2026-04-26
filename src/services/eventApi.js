import axios from 'axios';
import authService from './authService';

const BASE_URL = 'https://apieventra.vercel.app';

// Attach token to every request automatically
const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const eventApi = {
  getAllEvents: async () => {
    try {
      const response = await axios.get(`https://apieventra.vercel.app/api/getevents`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  createEvent: async (eventData) => {
    try {
      const payload = {
        role: eventData.role || 'user',
        event_name: eventData.event_name,
        desc: eventData.desc,
        location: eventData.location,
        landmark_name: eventData.landmark_name || '',
        user_name: eventData.user_name,
        email: eventData.email,
        start_date: eventData.start_date,
        end_date: eventData.end_date || '0000-00-00',
        is_deleted: false,
      };
      const response = await axios.post(`https://apieventra.vercel.app/api/events`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await axios.put(`https://apieventra.vercel.app/api/events/${id}`, eventData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await axios.delete(`https://apieventra.vercel.app/api/events/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  },
};

export default eventApi;
