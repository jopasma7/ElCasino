import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/tickets`
  : 'http://localhost:4000/api/tickets';

export const ticketsAPI = {
  getTicket: (mesa) => axios.get(`${API_URL}/${mesa}`),
  updateTicket: (mesa, data) => axios.post(`${API_URL}/${mesa}`, data),
  closeTicket: (mesa) => axios.post(`${API_URL}/${mesa}/close`)
}
