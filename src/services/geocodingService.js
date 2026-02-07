import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

const geocodingService = {
  // Search for locations by query
  searchLocation: async (query) => {
    try {
      const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'EventOrganizerApp/1.0'
        }
      });
      
      return response.data.map(result => ({
        name: result.display_name,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        type: result.type,
        address: result.address
      }));
    } catch (error) {
      throw new Error('Failed to search location');
    }
  },

  // Reverse geocode (get address from coordinates)
  reverseGeocode: async (lat, lon) => {
    try {
      const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
        params: {
          lat,
          lon,
          format: 'json'
        },
        headers: {
          'User-Agent': 'EventOrganizerApp/1.0'
        }
      });
      
      return {
        name: response.data.display_name,
        address: response.data.address
      };
    } catch (error) {
      throw new Error('Failed to reverse geocode');
    }
  }
};

export default geocodingService;
