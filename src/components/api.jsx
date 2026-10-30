import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://p-104-backend.onrender.com/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  console.log(`API ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

export default api
