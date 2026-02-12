import axios from 'axios';

const isProd = import.meta.env.PROD;
const baseURL = isProd ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getProjects = (params) => apiClient.get('/projects', { params });
export const getProject = (id) => apiClient.get(`/projects/${id}`);
export const createProject = (data) => apiClient.post('/projects', data);
export const updateProject = (id, data) => apiClient.put(`/projects/${id}`, data);
export const deleteProject = (id) => apiClient.delete(`/projects/${id}`);
export const getDashboardStats = () => apiClient.get('/projects/dashboard');

export default apiClient;
