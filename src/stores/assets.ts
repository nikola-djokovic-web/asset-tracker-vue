import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  AssetsApi,
  type FetchAssetsParams,
  type CheckoutPayload,
  type CheckinPayload,
} from '@/api/assets'
import type { Asset } from '@/types'
import { useToastStore } from '@/stores/toast'

export const useAssetStore = defineStore('assets', () => {
  const toast = useToastStore()
  const assets = ref<Asset[]>([])
  const currentAsset = ref<Asset | null>(null)
  const loading = ref(false)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  })

  // Filteri
  const searchQuery = ref('')
  const selectedStatus = ref('')

  async function fetchAssets(page = 1) {
    loading.value = true
    try {
      const params: FetchAssetsParams = {
        page,
        per_page: pagination.value.perPage,
        search: searchQuery.value || undefined,
        status: selectedStatus.value || undefined,
      }

      const response = await AssetsApi.getAll(params)

      assets.value = response.data
      pagination.value = {
        currentPage: response.meta.current_page,
        lastPage: response.meta.last_page,
        total: response.meta.total,
        perPage: response.meta.per_page,
      }
    } catch (error) {
      console.error('Greška pri dohvatanju opreme:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchAssetById(id: string) {
    loading.value = true
    try {
      const response = await AssetsApi.getById(id)
      currentAsset.value = response.data
      return response.data
    } catch (error) {
      console.error('Greška pri dohvatanju resursa:', error)
      currentAsset.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createAsset(payload: Partial<Asset> & Record<string, any>) {
    loading.value = true
    try {
      await AssetsApi.create(payload)
      await fetchAssets(pagination.value.currentPage)
      toast.success('Novi resurs je uspešno kreiran.')
    } catch (error) {
      console.error('Greška pri kreiranju opreme:', error)
      toast.error('Došlo je do greške pri kreiranju resursa.')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateAsset(id: string, payload: Partial<Asset> & Record<string, any>) {
    loading.value = true
    try {
      await AssetsApi.update(id, payload)
      toast.success('Resurs je uspešno izmenjen.')
      await fetchAssets(pagination.value.currentPage)
    } catch (error) {
      console.error('Greška pri izmeni opreme:', error)
      toast.error('Došlo je do greške pri izmeni resursa.')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteAsset = async (id: string) => {
    loading.value = true
    try {
      await AssetsApi.delete(id)
      // Uklanjamo iz lokalnog niza da izbegnemo nepotreban ponovni fetch
      assets.value = assets.value.filter((a) => a.id !== id)
      toast.success('Resurs je uspešno obrisan.')
    } catch (error) {
      console.error('Greška pri brisanju resursa:', error)
      toast.error('Došlo je do greške pri brisanju resursa.')
      throw error // Prosleđujemo grešku dalje komponente radi Toast obaveštenja
    } finally {
      loading.value = false
    }
  }

  async function checkoutAsset(id: string, payload: CheckoutPayload) {
    loading.value = true
    try {
      const response = await AssetsApi.checkout(id, payload)
      toast.success('Oprema je uspešno zadužena.')

      // Osvežavamo lokalno stanje ako imamo otvoren detalj ili listu
      if (currentAsset.value?.id === id) {
        currentAsset.value = response.data
      }

      return response.data
    } catch (error: any) {
      console.error('Greška pri zaduživanju opreme:', error)
      const errorMsg = error.response?.data?.message || 'Neuspešno zaduživanje opreme.'
      toast.error(errorMsg)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function checkinAsset(id: string, payload: CheckinPayload) {
    loading.value = true
    try {
      const response = await AssetsApi.checkin(id, payload)
      toast.success('Oprema je uspešno razdužena.')

      if (currentAsset.value?.id === id) {
        currentAsset.value = response.data
      }

      return response.data
    } catch (error: any) {
      console.error('Greška pri razduživanju opreme:', error)
      const errorMsg = error.response?.data?.message || 'Neuspešno razduživanje opreme.'
      toast.error(errorMsg)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    assets,
    currentAsset,
    loading,
    pagination,
    searchQuery,
    selectedStatus,
    fetchAssets,
    fetchAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    checkoutAsset,
    checkinAsset,
  }
})
