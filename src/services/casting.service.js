import api from './api';

export const castingService = {
    getAll: async (status = 'open') => {
        try {
            const response = await api.get(`/casting?status=${status}`);
            return { success: true, data: response.data.castingCalls };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch casting calls'
            };
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/casting/${id}`);
            return { success: true, data: response.data.castingCall };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch casting call'
            };
        }
    },

    create: async (jobData) => {
        try {
            const response = await api.post('/casting', jobData);
            return { success: true, data: response.data.castingCall };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create casting call'
            };
        }
    },

    apply: async (id, message = '') => {
        try {
            const response = await api.post(`/casting/${id}/apply`, { message });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to apply'
            };
        }
    }
};
