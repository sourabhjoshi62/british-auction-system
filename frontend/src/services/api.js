import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// RFQ API
export const rfqApi = {
  getAll: () => api.get('/rfqs'),
  getById: (id) => api.get(`/rfqs/${id}`),
  create: (data) => api.post('/rfqs', data),
  activate: (id) => api.post(`/rfqs/${id}/activate`),
  close: (id) => api.post(`/rfqs/${id}/close`)
}

// Bid API
export const bidApi = {
  getForRfq: (rfqId) => api.get(`/rfqs/${rfqId}/bids`),
  submit: (rfqId, data) => api.post(`/rfqs/${rfqId}/bids`, data)
}

// Supplier API
export const supplierApi = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data)
}

export default api
