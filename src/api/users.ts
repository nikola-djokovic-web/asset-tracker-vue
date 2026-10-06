import { api } from './axios'
import type { User } from '@/types'

export interface UserCreatePayload {
  name: string
  email: string
  password?: string
  role?: User['role']
}

export interface UserUpdatePayload {
  name?: string
  email?: string
  role?: User['role']
}

export interface UsersResponse {
  data: User[]
  links?: Record<string, any>
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const UsersApi = {
  // GET /users (sa podrškom za search, role, per_page, page)
  getAll: (params?: { search?: string; role?: string; per_page?: number; page?: number }) =>
    api.get<UsersResponse | User[]>('/users', { params }),

  // GET /users/{user}
  getById: (id: string) => api.get<User>(`/users/${id}`),

  // GET /users/{user}/assignments
  getAssignments: (userId: string) => api.get(`/users/${userId}/assignments`),

  // POST /users
  create: (data: UserCreatePayload) => api.post<User>('/users', data),

  // PUT /users/{user}
  update: (id: string, data: UserUpdatePayload) => api.put<User>(`/users/${id}`, data),

  // DELETE /users/{user}
  delete: (id: string) => api.delete(`/users/${id}`),
}
