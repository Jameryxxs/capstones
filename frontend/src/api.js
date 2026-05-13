import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const fishApi = {
    getAll: () => api.get("fish/"),
    getOne: (id) => api.get(`fish/${id}/`),
    create: (data) => api.post("fish/", data, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    update: (id, data) => api.put(`fish/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    delete: (id) => api.delete(`fish/${id}/`),
};

export default api;
