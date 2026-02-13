import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Crear instancias de axios
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptores para añadir token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: (password) => publicApi.post('/auth/login', { password }),
  verify: () => adminApi.get('/auth/verify')
}

// Users API
export const userAuthAPI = {
  register: (formData) => publicApi.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (data) => publicApi.post('/users/login', data)
}

export const userProfileAPI = {
  getMe: () => userApi.get('/users/me'),
  updateMe: (formData) => userApi.put('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMe: () => userApi.delete('/users/me')
}

export const usersAPI = {
  getAll: () => adminApi.get('/users'),
  changeRole: (id, role) => adminApi.put(`/users/${id}/role`, { role }),
  delete: (id) => adminApi.delete(`/users/${id}`)
}

// Dishes API
export const dishesAPI = {
  getAll: (params) => publicApi.get('/dishes', { params }),
  getById: (id) => publicApi.get(`/dishes/${id}`),
  create: (formData) => adminApi.post('/dishes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => adminApi.put(`/dishes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => adminApi.delete(`/dishes/${id}`)
}

// Gallery API
export const galleryAPI = {
  getAll: (params) => publicApi.get('/gallery', { params }),
  getById: (id) => publicApi.get(`/gallery/${id}`),
  create: (formData) => adminApi.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => adminApi.put(`/gallery/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => adminApi.delete(`/gallery/${id}`)
}

// Daily Menu API
export const dailyMenuAPI = {
  getToday: () => publicApi.get('/daily-menu/today'),
  getAll: () => adminApi.get('/daily-menu'),
  getById: (id) => adminApi.get(`/daily-menu/${id}`),
  create: (data) => adminApi.post('/daily-menu', data),
  update: (id, data) => adminApi.put(`/daily-menu/${id}`, data),
  delete: (id) => adminApi.delete(`/daily-menu/${id}`)
}

// Daily Menu Options API (admin)
export const dailyMenuOptionsAPI = {
  getAll: () => adminApi.get('/daily-menu-options'),
  create: (data) => adminApi.post('/daily-menu-options', data),
  remove: (id) => adminApi.delete(`/daily-menu-options/${id}`)
}

// Orders API
export const ordersAPI = {
  getAll: (params) => adminApi.get('/orders', { params }),
  getById: (id) => adminApi.get(`/orders/${id}`),
  create: (data) => userApi.post('/orders', data),
  updateStatus: (id, status) => adminApi.put(`/orders/${id}/status`, { status }),
  cancel: (id) => adminApi.delete(`/orders/${id}`)
}

export default publicApi
