import axios, { type AxiosError } from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Ključno za slanje HttpOnly kolačića
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Uvek ucitavamo CSRF pre osetljivih zahteva
export const getCsrfToken = async (): Promise<void> => {
  await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
