import api from './api.js';

const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data.profile;
  },

  createProfile: async (profileData) => {
    const response = await api.post('/profile', profileData);
    return response.data.profile;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data.profile;
  },
};

export default profileService;
