import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.message === 'Network Error' || !error.response) {
      error.message = 'Unable to connect to backend server. Please ensure it is running on port 5000.'
    }
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data)
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/api/auth/profile')
    return response.data
  },
}

// Tax APIs
export const taxAPI = {
  calculateTax: async (data: any) => {
    const response = await api.post('/api/tax/calculate', data)
    return response.data
  },
  
  calculateHRA: async (data: any) => {
    const response = await api.post('/api/tax/calculate-hra', data)
    return response.data
  },
  
  optimizeDeductions: async (data: any) => {
    const response = await api.post('/api/tax/optimize-deductions', data)
    return response.data
  },
  
  createReturn: async (data: any) => {
    const response = await api.post('/api/tax/returns', data)
    return response.data
  },
  
  getReturns: async () => {
    const response = await api.get('/api/tax/returns')
    return response.data
  },
  
  getReturnDetails: async (returnId: string) => {
    const response = await api.get(`/api/tax/returns/${returnId}`)
    return response.data
  },
}

// Document APIs
export const documentAPI = {
  upload: async (file: File, documentType: string, returnId?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)
    if (returnId) formData.append('returnId', returnId)
    
    const response = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  getDocuments: async () => {
    const response = await api.get('/api/documents')
    return response.data
  },
}

export default api
