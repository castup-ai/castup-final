import api from './api';

export const adminService = {
    getStats: async () => {
        try {
            const response = await api.get('/admin/stats');
            return { success: true, data: response.data.stats };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch admin stats'
            };
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete user'
            };
        }
    },

    deleteJob: async (jobId) => {
        try {
            const response = await api.delete(`/admin/jobs/${jobId}`);
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete job'
            };
        }
    },
    
    getAllWorks: async () => {
        try {
            const response = await api.get('/admin/works');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch works'
            };
        }
    },

    deleteWork: async (workId, userId, isPortfolio) => {
        try {
            const url = isPortfolio 
                ? `/admin/works/\${workId}?isPortfolio=true&userId=\${userId}` 
                : `/admin/works/\${workId}`;
            const response = await api.delete(url);
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete work'
            };
        }
    }
};
