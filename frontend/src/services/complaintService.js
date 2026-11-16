import api from './api';
import axios from 'axios';

export const complaintService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.categories;
  },

  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data.departments;
  },

  getDepartmentStaff: async (deptId) => {
    const response = await api.get(`/departments/${deptId}/staff`);
    return response.data.staff;
  },

  aiCategorize: async (title, description) => {
    const response = await api.post('/complaints/ai-categorize', { title, description });
    return response.data;
  },

  checkDuplicates: async (params) => {
    const response = await api.post('/complaints/check-duplicates', params);
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/complaints/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  submitComplaint: async (payload) => {
    const response = await api.post('/complaints', payload);
    return response.data;
  },

  getComplaints: async (filters = {}) => {
    const response = await api.get('/complaints', { params: filters });
    return response.data;
  },

  getMyComplaints: async () => {
    const response = await api.get('/complaints/my');
    return response.data;
  },

  getComplaint: async (identifier) => {
    const response = await api.get(`/complaints/${identifier}`);
    return response.data.complaint;
  },

  updateStatus: async (id, data) => {
    const response = await api.patch(`/complaints/${id}/status`, data);
    return response.data;
  },

  assignComplaint: async (id, data) => {
    const response = await api.post(`/complaints/${id}/assign`, data);
    return response.data;
  },

  linkDuplicate: async (id, parentId) => {
    const response = await api.post(`/complaints/${id}/link-duplicate`, { duplicate_of_id: parentId });
    return response.data;
  },

  // Free OpenStreetMap reverse geocode
  reverseGeocode: async (lat, lon) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          format: 'json',
          lat,
          lon,
          zoom: 18,
          addressdetails: 1,
        },
        headers: {
          'Accept-Language': 'en',
        },
      });
      return res.data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    } catch {
      return `Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
  },
};
