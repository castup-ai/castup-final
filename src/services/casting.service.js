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

    getJobApplicants: async (id) => {
        try {
            const response = await api.get(`/casting/${id}/applicants`);
            return { success: true, data: response.data.applicants };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch applicants'
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
                error: error.response?.data?.error || 'Failed to create casting call',
                details: error.response?.data?.details,
                code: error.response?.data?.code
            };
        }
    },

    apply: async (id, data) => {
        try {
            const response = await api.post(`/casting/${id}/apply`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to apply'
            };
        }
    },

    delete: async (id) => {
        try {
            await api.delete(`/casting/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete job posting'
            };
        }
    },

    getMyApplications: async () => {
        try {
            const response = await api.get('/casting/applications/me');
            return { success: true, data: response.data.applications };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch your applications'
            };
        }
    },

    async update(id, data) {
        const res = await api.put(`/casting/${id}`, data);
        return res.data;
    }
};
