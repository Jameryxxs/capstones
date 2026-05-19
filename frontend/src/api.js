import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

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

