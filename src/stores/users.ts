import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UsersApi, type UserCreatePayload, type UserUpdatePayload } from '@/api/users'
import { useToastStore } from '@/stores/toast'
import type { User } from '@/types'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const toast = useToastStore()

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 100,
    total: 0,
  })

  async function fetchUsers(params?: {
    search?: string
    role?: string
    per_page?: number
    page?: number
  }) {
    loading.value = true
    try {
      const response = await UsersApi.getAll({
        per_page: params?.per_page || pagination.value.perPage,
        page: params?.page || pagination.value.currentPage,
        search: params?.search,
        role: params?.role,
      })

      const resData = response.data

      // Obrada u zavisnosti od toga da li backend vraća Resource kolekciju sa data/meta ili direktan niz
      if (Array.isArray(resData)) {
        users.value = resData
      } else if (resData.data) {
        users.value = resData.data
        if (resData.meta) {
          pagination.value = {
            currentPage: resData.meta.current_page,
            lastPage: resData.meta.last_page,
            perPage: resData.meta.per_page,
            total: resData.meta.total,
          }
        }
      }
    } catch (error: any) {
      console.error('Greška pri dohvatanju korisnika:', error)
      const errorMsg = error.response?.data?.message || 'Neuspešno dohvatanje korisnika.'
      toast.error(errorMsg)
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: UserCreatePayload) {
    loading.value = true
    try {
      const response = await UsersApi.create(payload)
      toast.success('Korisnik je uspešno kreiran.')
      await fetchUsers()
      return response.data
    } catch (error: any) {
      console.error('Greška pri kreiranju korisnika:', error)
      const errorMsg = error.response?.data?.message || 'Greška pri kreiranju korisnika.'
      toast.error(errorMsg)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: string, payload: UserUpdatePayload) {
    loading.value = true
    try {
      const response = await UsersApi.update(id, payload)
      toast.success('Korisnik je uspešno ažuriran.')
      await fetchUsers()
      return response.data
    } catch (error: any) {
      console.error('Greška pri ažuriranju korisnika:', error)
      const errorMsg = error.response?.data?.message || 'Greška pri ažuriranju korisnika.'
      toast.error(errorMsg)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: string) {
    loading.value = true
    try {
      await UsersApi.delete(id)
      toast.success('Korisnik je uspešno obrisan.')
      await fetchUsers()
    } catch (error: any) {
      console.error('Greška pri brisanju korisnika:', error)
      const errorMsg = error.response?.data?.message || 'Greška pri brisanju korisnika.'
      toast.error(errorMsg)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
})
