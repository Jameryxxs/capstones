import axios from "axios";

const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    // If we're on localhost or similar, assume the backend is also local
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return `http://${hostname}:8000/api/`;
    }
    // Fallback/Production URL
    return `http://${hostname}:8000/api/`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle 401 errors (Session Expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login if not already there
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (credentials) => api.post("auth/login/", credentials),
    register: (userData) => api.post("auth/register/", userData),
    refresh: () => api.post("auth/refresh/", { refresh: localStorage.getItem("refresh_token") }),
};

export const getUserRole = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload).role;
    } catch (e) {
        return null;
    }
};

export const fishApi = {
    getAll: () => api.get("fish/"),
    getOne: (id) => api.get(`fish/${id}/`),
    create: (data) => api.post("fish/", data, { headers: { "Content-Type": "multipart/form-data" } }),
    update: (id, data) => api.put(`fish/${id}/`, data, { headers: { "Content-Type": "multipart/form-data" } }),
    delete: (id) => api.delete(`fish/${id}/`),
    getForecast: (id) => api.get(`forecast/${id}/`),
};

export const retailerApi = {
    getAll: () => api.get("retailers/"),
    create: (data) => api.post("retailers/", data),
    update: (id, data) => api.put(`retailers/${id}/`, data),
    delete: (id) => api.delete(`retailers/${id}/`),
};

export const priceApi = {
    getAll: () => api.get("fish-prices/"),
    create: (data) => api.post("fish-prices/", data),
    update: (id, data) => api.put(`fish-prices/${id}/`, data),
    delete: (id) => api.delete(`fish-prices/${id}/`),
};

export default api;

