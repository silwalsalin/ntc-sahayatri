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
        console.log(`📥 Response from ${response.config.url}:`, response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const complaintService = {
    // Submit complaint (handles both general and regarding)
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
    
    // Get all complaints
    getAllComplaints: async () => {
        try {
            const response = await api.get('/complaints');
            return response.data;
        } catch (error) {
            console.error('Error fetching complaints:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Get complaints by category
    getComplaintsByCategory: async (category) => {
        try {
            const response = await api.get(`/complaints/category/${category}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching complaints by category:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Update complaint status
    updateComplaintStatus: async (id, statusData) => {
        try {
            const response = await api.put(`/complaints/${id}`, statusData);
            return response.data;
        } catch (error) {
            console.error('Error updating complaint:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Get statistics
    getStatistics: async () => {
        try {
            const response = await api.get('/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },
    
    // Health check
    healthCheck: async () => {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }
};

export default complaintService;