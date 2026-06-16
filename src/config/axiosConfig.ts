import axios from 'axios';
import { isTokenValid, logoutUser } from '../utils/auth';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
    (config) => {
        const storageStr = localStorage.getItem('auth-storage');
        let token = null;

        if (storageStr) {
            try {
                const parsedStorage = JSON.parse(storageStr);
                token = parsedStorage.state.token; 
            } catch (e) {
                console.error("Failed to parse auth storage");
            }
        }

        if (token) {
            if (isTokenValid(token)) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                logoutUser();
                return Promise.reject(new Error("Session expired. Please log in again."));
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Backend detected invalid/mocked token. Forcing logout.");
            logoutUser();
        }
        
        return Promise.reject(error);
    }
);

export default api;