import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const userService = {
  getAllUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const boardService = {
  getAllBoards: () => api.get('/boards'),
  createBoard: (boardData) => api.post('/boards', boardData),
};

export const itemService = {
  createItem: (itemData) => api.post('/items', itemData),
  updateItem: (id, updates) => api.patch(`/items/${id}`, updates),
  getMyItems: () => api.get('/items/my'),
};

export const searchService = {
  search: (query) => api.get(`/search?q=${query}`),
};

export const fileService = {
  getFiles: () => api.get('/files'),
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

export const formService = {
  getForms: () => api.get('/forms'),
  createForm: (formData) => api.post('/forms', formData),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}`),
};

export default api;
