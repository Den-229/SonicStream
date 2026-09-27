import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

export const apiClient = {
  search: async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/search`, { params: { q: query } });
      return response.data;
    } catch (error) {
      console.warn("Backend not running, falling back to local client simulation");
      return null;
    }
  },
  getSuggestions: async (genre = 'All') => {
    try {
      const response = await axios.get(`${API_BASE}/suggestions`, { params: { genre } });
      return response.data;
    } catch (error) {
      return null;
    }
  },
  triggerDownload: async (trackId, format, bitrate) => {
    try {
      const response = await axios.post(`${API_BASE}/download`, { trackId, format, bitrate });
      return response.data;
    } catch (error) {
      return { status: 'ready', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' };
    }
  }
};
