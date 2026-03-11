import axios from 'axios';

const isProd = import.meta.env.PROD;
const baseURL = isProd ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to return data directly
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);

export const getProjects = (params) => apiClient.get('/projects', { params });
export const getProjectById = (id) => apiClient.get(`/projects/${id}`);
export const createProject = (data) => apiClient.post('/projects', data);
export const updateProject = (id, data) => apiClient.put(`/projects/${id}`, data);
export const deleteProject = (id) => apiClient.delete(`/projects/${id}`);
export const restoreProject = (data) => apiClient.post('/projects/restore', data);
export const getProjectHistory = (id) => apiClient.get(`/projects/${id}/history`);
export const getDashboardStats = () => apiClient.get('/projects/dashboard');

// Registry
export const getMinistries = () => apiClient.get('/registry/ministries');
export const upsertMinistry = (data) => apiClient.post('/registry/ministries', data);
export const deleteMinistry = (id) => apiClient.delete(`/registry/ministries/${id}`);

export const getDepartments = () => apiClient.get('/registry/departments');
export const upsertDepartment = (data) => apiClient.post('/registry/departments', data);
export const deleteDepartment = (id) => apiClient.delete(`/registry/departments/${id}`);

export const getPersonnel = () => apiClient.get('/registry/personnel');
export const upsertPersonnel = (data) => apiClient.post('/registry/personnel', data);
export const deletePersonnel = (id) => apiClient.delete(`/registry/personnel/${id}`);

export default apiClient;
