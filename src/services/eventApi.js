import axios from 'axios';

const API_BASE_URL = '/api';

const eventApi = {
  // Get all events
  getAllEvents: async () => {
    try {
      const response = await axios.get(`https://eventra-18by.onrender.com/api/getevents`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  // Create new event
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
        is_deleted: false
      };
      
      const response = await axios.post(`https://eventra-18by.onrender.com/api/events`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  // Update event (if needed in future)
  updateEvent: async (id, eventData) => {
    try {
      const response = await axios.put(`https://eventra-18by.onrender.com/api/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  // Delete event (soft delete)
  deleteEvent: async (id) => {
    try {
      const response = await axios.delete(`https://eventra-18by.onrender.com/api/events/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  }
};

export default eventApi;
