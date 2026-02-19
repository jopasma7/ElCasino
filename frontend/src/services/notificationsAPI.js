import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '/api') + '/notifications';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const notificationsAPI = {
  getAll: () => axios.get(API_URL, { headers: getAuthHeaders() }),
  markAsRead: (id) => axios.patch(`${API_URL}/${id}/read`, {}, { headers: getAuthHeaders() }),
  create: (data) => axios.post(API_URL, data, { headers: getAuthHeaders() }),
  delete: (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() })
};
