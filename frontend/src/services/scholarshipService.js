import api from './api.js';

const scholarshipService = {
  getScholarshipFeed: async (tags, minAmount, maxAmount, deadlineAfter, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) params.append('tags', tags.join(','));
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);
    if (deadlineAfter) params.append('deadlineAfter', deadlineAfter);
    params.append('page', page);
    params.append('limit', limit);

    const response = await api.get(`/scholarships/feed?${params.toString()}`);
    return response.data;
  },

  swipeScholarship: async (scholarshipId, swipeDirection) => {
    const response = await api.post('/scholarships/swipe', {
      scholarshipId,
      swipe_direction: swipeDirection,
    });
    return response.data;
  },

  getLikedScholarships: async () => {
    const response = await api.get('/scholarships/liked');
    return response.data.scholarships;
  },

  undoSwipe: async (scholarshipId) => {
    const response = await api.delete(`/scholarships/swipe/${scholarshipId}`);
    return response.data;
  },

  updateSwipe: async (scholarshipId, swipeDirection) => {
    const response = await api.put(`/scholarships/swipe/${scholarshipId}`, {
      swipe_direction: swipeDirection,
    });
    return response.data;
  },

  resetDislikes: async () => {
    const response = await api.put('/scholarships/reset/dislikes');
    return response.data;
  },
};

export default scholarshipService;
