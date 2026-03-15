import api from './api';

export const portfolioService = {
    getPortfolio: async (userId) => {
        try {
            const response = await api.get(`/portfolios/${userId}`);
            return { success: true, data: response.data.portfolio };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch portfolio'
            };
        }
    },

    getMyPortfolio: async () => {
        try {
            const response = await api.get('/portfolios/me');
            return { success: true, data: response.data.portfolio };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch your portfolio'
            };
        }
    },

    createOrUpdate: async (portfolioData) => {
        try {
            const response = await api.post('/portfolios', portfolioData);
            return { success: true, data: response.data.portfolio };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update portfolio'
            };
        }
    },

    addMedia: async (mediaData) => {
        try {
            const response = await api.post('/portfolios/media', mediaData);
            return { success: true, data: response.data.portfolio };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to add media'
            };
        }
    }
};
