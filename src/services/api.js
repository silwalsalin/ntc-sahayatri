// frontend/src/services/api.js
import axios from 'axios';

// Connect to Node.js backend on port 5000
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const complaintAPI = {
  // Health check
  healthCheck: () => api.get('/health'),
  
  // Get all complaints
  getComplaints: () => api.get('/complaints'),
  
  // Get single complaint
  getComplaint: (id) => api.get(`/complaints/${id}`),
  
  // Submit complaint
  submitComplaint: (data) => api.post('/complaints', data),
  
  // Landing data
  getLandingData: () => api.get('/landing'),
};

export default api;