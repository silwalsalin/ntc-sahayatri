// frontend/src/services/complaintService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`📤 Sending ${config.method.toUpperCase()} request to ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log(`📥 Received response from ${response.config.url}:`, response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const complaintService = {
    // Submit new complaint
    submitComplaint: async (complaintData) => {
        try {
            const response = await api.post('/complaints/submit', complaintData);
            return response.data;
        } catch (error) {
            console.error('Error submitting complaint:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Track complaint by ID/Number and password
    trackComplaint: async (complaintId, password) => {
        try {
            const response = await api.get(`/complaints/track/${complaintId}`, {
                params: { password }
            });
            return response.data;
        } catch (error) {
            console.error('Error tracking complaint:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Get all complaints (for admin)
    getAllComplaints: async (page = 1, limit = 10, status = null) => {
        try {
            const params = { page, limit };
            if (status) params.status = status;
            
            const response = await api.get('/complaints', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching complaints:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Update complaint status (for admin)
    updateComplaintStatus: async (id, statusData) => {
        try {
            const response = await api.put(`/complaints/${id}`, statusData);
            return response.data;
        } catch (error) {
            console.error('Error updating complaint:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Get complaint statistics
    getStatistics: async () => {
        try {
            const response = await api.get('/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    }
};

export default complaintService;