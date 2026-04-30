import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Global auth error handler
api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api