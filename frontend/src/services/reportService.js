import api from './api.js';

const reportService = {
  // Generate financial aid report for a college
  generateReport: async (collegeId, force = false) => {
    const url = force ? `/colleges/${collegeId}/report?force=true` : `/colleges/${collegeId}/report`;
    const response = await api.post(url);
    return response.data;
  },

  // Get a specific report
  getReport: async (reportId) => {
    const response = await api.get(`/colleges/reports/${reportId}`);
    return response.data.report;
  },

  // Get all user reports
  getUserReports: async () => {
    const response = await api.get('/colleges/reports/all');
    return response.data.reports;
  },

  // Delete a report
  deleteReport: async (reportId) => {
    const response = await api.delete(`/colleges/reports/${reportId}`);
    return response.data;
  },

  // Compare multiple colleges
  compareColleges: async (collegeIds) => {
    const response = await api.post('/colleges/reports/compare', {
      collegeIds,
    });
    return response.data;
  },

  // Format currency
  formatCurrency: (value) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },
};

export default reportService;
