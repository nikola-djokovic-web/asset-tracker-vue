import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, getCsrfToken } from '@/api/axios'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const errors = ref<Record<string, string[]>>({})
  const isInitialized = ref(false) // 👈 Dodato za router guard check

  const isAuthenticated = computed(() => !!user.value) // 👈 Dodato

  async function login(credentials: { email: string; password: string }) {
    loading.value = true
    errorMessage.value = null
    errors.value = {}

    try {
      await getCsrfToken()
      const response = await api.post('/login', credentials)
      user.value = response.data.user
      return true
    } catch (error: any) {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors || {}
        errorMessage.value = error.response.data.message || 'Proverite unesene podatke.'
      } else if (error.response?.status === 401) {
        errorMessage.value = 'Neispravna email adresa ili lozinka.'
      } else {
        errorMessage.value = 'Došlo je do greške pri povezivanju sa serverom.'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    try {
      const response = await api.get('/user')
      user.value = response.data
    } catch (error) {
      user.value = null
    } finally {
      isInitialized.value = true // 👈 Označavamo da je provera završena
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (e) {
      console.error(e)
    } finally {
      user.value = null
      window.location.href = '/login'
    }
  }

  return {
    user,
    loading,
    errorMessage,
    errors,
    isInitialized,
    isAuthenticated,
    login,
    fetchUser,
    logout,
  }
})
