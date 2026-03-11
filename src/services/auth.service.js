import api from './api';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch profile'
            };
        }
    },

    updateProfile: async (userData) => {
        try {
            const response = await api.put('/users/profile', userData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update profile'
            };
        }
    },

    getAllUsers: async () => {
        try {
            const response = await api.get('/users');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch users'
            };
        }
    }
};
