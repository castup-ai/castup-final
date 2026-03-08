import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const saved = localStorage.getItem('castup_auth_real');
        if (saved) {
            try {
                const { token } = JSON.parse(saved);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error parsing auth data from local storage', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
