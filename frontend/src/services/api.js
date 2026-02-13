import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Crear instancias de axios
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})


// Ya no se usa adminApi, solo userApi para todo

const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptores para añadir token


userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})



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
  getAll: () => userApi.get('/users'),
  changeRole: (id, role) => userApi.put(`/users/${id}/role`, { role }),
  delete: (id) => userApi.delete(`/users/${id}`)
}

// Dishes API
export const dishesAPI = {
  getAll: (params) => publicApi.get('/dishes', { params }),
  getById: (id) => publicApi.get(`/dishes/${id}`),
  create: (formData) => userApi.post('/dishes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => userApi.put(`/dishes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => userApi.delete(`/dishes/${id}`)
}

// Gallery API
export const galleryAPI = {
  getAll: (params) => publicApi.get('/gallery', { params }),
  getById: (id) => publicApi.get(`/gallery/${id}`),
  create: (formData) => userApi.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => userApi.put(`/gallery/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => userApi.delete(`/gallery/${id}`)
}

// Daily Menu API
export const dailyMenuAPI = {
  getToday: () => publicApi.get('/daily-menu/today'),
  getAll: () => userApi.get('/daily-menu'),
  getById: (id) => userApi.get(`/daily-menu/${id}`),
  create: (data) => userApi.post('/daily-menu', data),
  update: (id, data) => userApi.put(`/daily-menu/${id}`, data),
  delete: (id) => userApi.delete(`/daily-menu/${id}`)
}

// Daily Menu Options API (admin)
export const dailyMenuOptionsAPI = {
  getAll: () => userApi.get('/daily-menu-options'),
  create: (data) => userApi.post('/daily-menu-options', data),
  remove: (id) => userApi.delete(`/daily-menu-options/${id}`)
}

// Orders API
export const ordersAPI = {
  getAll: (params) => userApi.get('/orders', { params }),
  getById: (id) => userApi.get(`/orders/${id}`),
  create: (data) => userApi.post('/orders', data),
  updateStatus: (id, status) => userApi.put(`/orders/${id}/status`, { status }),
  cancel: (id) => userApi.delete(`/orders/${id}`)
}

export default publicApi
