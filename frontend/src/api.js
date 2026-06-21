import axios from "axios";

const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    // Dynamically use the current hostname to connect to the backend
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
    getMe: () => api.get("users/me/"),
    updateMe: (data) => api.patch("users/me/", data),
    changePassword: (data) => api.post("users/change_password/", data),
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
    getMe: () => api.get("retailers/me/"),
    updateMe: (data) => api.patch("retailers/me/", data),
    create: (data) => api.post("retailers/", data),
    update: (id, data) => api.put(`retailers/${id}/`, data),
    delete: (id) => api.delete(`retailers/${id}/`),
};

export const priceApi = {
    getAll: () => api.get("fish-prices/"),
    getMine: () => api.get("fish-prices/?mine=true"),
    create: (data) => api.post("fish-prices/", data),
    update: (id, data) => api.put(`fish-prices/${id}/`, data),
    delete: (id) => api.delete(`fish-prices/${id}/`),
};

export const supplyApi = {
    getAll: () => api.get("supply-sources/"),
    getOne: (id) => api.get(`supply-sources/${id}/`),
    create: (data) => api.post("supply-sources/", data),
    update: (id, data) => api.patch(`supply-sources/${id}/`, data),
    delete: (id) => api.delete(`supply-sources/${id}/`),
};

export const deliveryApi = {
    getAll: () => api.get("deliveries/"),
    create: (data) => api.post("deliveries/", data),
};

export default api;

