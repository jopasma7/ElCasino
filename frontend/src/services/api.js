// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para añadir token único
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


// Auth API
export const authAPI = {
  login: (password) => api.post('/auth/login', { password }),
  verify: () => api.get('/auth/verify')
}

// Users API
export const userAuthAPI = {
  register: (formData) => api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (data) => api.post('/users/login', data)
}

export const userProfileAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (formData) => api.put('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMe: () => api.delete('/users/me'),
  changePassword: (data) => api.post('/users/change-password', data)
}

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`)
}

// Dishes API
export const dishesAPI = {
  getAll: (params) => api.get('/dishes', { params }),
  getById: (id) => api.get(`/dishes/${id}`),
  create: (formData) => api.post('/dishes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/dishes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/dishes/${id}`)
}

// Gallery API
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (formData) => api.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/gallery/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/gallery/${id}`)
}

// Daily Menu API
export const dailyMenuAPI = {
  getToday: () => api.get('/daily-menu/today'),
  getAll: () => api.get('/daily-menu'),
  getById: (id) => api.get(`/daily-menu/${id}`),
  create: (data) => api.post('/daily-menu', data),
  update: (id, data) => api.put(`/daily-menu/${id}`, data),
  delete: (id) => api.delete(`/daily-menu/${id}`)
}

// Daily Menu Options API
export const dailyMenuOptionsAPI = {
  getAll: () => api.get('/daily-menu-options'),
  create: (data) => api.post('/daily-menu-options', data),
  remove: (id) => api.delete(`/daily-menu-options/${id}`)
}

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  createAdmin: (data) => api.post('/orders/admin', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.delete(`/orders/${id}`)
}

// Reservas API
export const reservasAPI = {
  create: (data, isAdmin = false) => isAdmin ? api.post('/reservas/admin', data) : api.post('/reservas', data),
  getMis: () => api.get('/reservas/mis'),
  getAll: () => api.get('/reservas'),
  updateEstado: (id, estado) => api.put(`/reservas/${id}`, { estado }),
  update: (id, data) => api.put(`/reservas/mis/${id}`, data),
  delete: (id) => api.delete(`/reservas/mis/${id}`),
  deleteAdmin: (id) => api.delete(`/reservas/${id}`)
}

export default api
