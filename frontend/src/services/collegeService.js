import api from './api.js';

const collegeService = {
  searchColleges: async (query, state, type, page = 1, limit = 10, useAI = false) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (state) params.append('state', state);
    if (type) params.append('type', type);
    if (useAI) params.append('useAI', 'true');
    params.append('page', page);
    params.append('limit', limit);

    const response = await api.get(`/colleges?${params.toString()}`);
    return response.data;
  },

  getCollege: async (id) => {
    const response = await api.get(`/colleges/${id}`);
    return response.data.college;
  },

  estimateFinancialAid: async (collegeName) => {
    const response = await api.post('/colleges/estimate', {
      collegeName,
    });
    return response.data;
  },

  getEstimationStatus: async (jobId) => {
    const response = await api.get(`/colleges/estimate/${jobId}`);
    return response.data;
  },

  getUserEstimates: async () => {
    const response = await api.get('/colleges/user/estimates');
    return response.data.estimates;
  },

  // Polling helper
  pollEstimationStatus: async (jobId, maxAttempts = 120, delayMs = 1000) => {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await collegeService.getEstimationStatus(jobId);

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(status.error || 'Estimation failed'));
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              reject(new Error('Estimation timeout'));
            } else {
              setTimeout(poll, delayMs);
            }
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  },

  // User college list management
  getUserColleges: async () => {
    const response = await api.get('/colleges/user/list');
    return response.data.colleges;
  },

  addCollegeToList: async (collegeId, notes) => {
    const response = await api.post(`/colleges/user/list/${collegeId}`, { notes });
    return response.data.college;
  },

  removeCollegeFromList: async (collegeId) => {
    const response = await api.delete(`/colleges/user/list/${collegeId}`);
    return response.data;
  },

  updateCollegeStatus: async (collegeId, applicationStatus, notes) => {
    const response = await api.put(`/colleges/user/list/${collegeId}`, {
      application_status: applicationStatus,
      notes,
    });
    return response.data.college;
  },
};

export default collegeService;
