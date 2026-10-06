import { api } from './axios'
import type { Asset, ApiPaginatedResponse } from '@/types'

export interface FetchAssetsParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  category_id?: string
}

export interface CheckoutPayload {
  assigned_to_user_id: string
  condition_on_checkout?: 'new' | 'good' | 'damaged'
  notes?: string
}

export interface CheckinPayload {
  condition_on_checkin: 'new' | 'good' | 'damaged'
  notes?: string
}

export const AssetsApi = {
  // GET /api/assets (sa paginacijom i filterima)
  async getAll(params: FetchAssetsParams = {}): Promise<ApiPaginatedResponse<Asset>> {
    const response = await api.get('/assets', { params })
    return response.data
  },

  // GET /api/assets/{id}
  async getById(id: string): Promise<{ data: Asset }> {
    const response = await api.get(`/assets/${id}`)
    return response.data
  },

  // POST /api/assets
  async create(payload: Partial<Asset>): Promise<{ data: Asset }> {
    const response = await api.post('/assets', payload)
    return response.data
  },

  // PUT /api/assets/{id}
  async update(id: string, payload: Partial<Asset>): Promise<{ data: Asset }> {
    const response = await api.put(`/assets/${id}`, payload)
    return response.data
  },

  // DELETE /api/assets/{id}
  async delete(id: string): Promise<void> {
    await api.delete(`/assets/${id}`)
  },

  // POST /assets/{id}/checkout
  checkout: (id: string, payload: CheckoutPayload) =>
    api.post<Asset>(`/assets/${id}/checkout`, payload),

  // POST /assets/{id}/checkin
  checkin: (id: string, payload: CheckinPayload) =>
    api.post<Asset>(`/assets/${id}/checkin`, payload),
}
