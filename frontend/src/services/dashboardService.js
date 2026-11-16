import api from './api';

export const dashboardService = {
  getPublicStats: async () => {
    const response = await api.get('/dashboard/public-stats');
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin-stats');
    return response.data;
  },

  getHotspots: async (radius = 350, minComplaints = 2) => {
    const response = await api.get('/analytics/hotspots', {
      params: { radius, min_complaints: minComplaints },
    });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },
};
