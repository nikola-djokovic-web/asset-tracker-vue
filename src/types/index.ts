export type Role = 'admin' | 'manager' | 'member'
export type AssetStatus = 'active' | 'assigned' | 'maintenance' | 'retired' | 'inactive'

export interface User {
  id: string
  tenant_id: string
  name: string
  email: string
  role: Role
  created_at: string
}

export interface HardwareDetail {
  id: string
  serial_number: string | null
  specs: Record<string, string> | null
  created_at: string
  updated_at: string
}

export interface LicenseDetail {
  id: string
  license_key: string | null
  seats: number | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string | null
  created_at: string
}

export interface Asset {
  id: string
  tenant_id: string
  organization_id: string
  category_id: string
  name: string
  asset_tag: string
  status: AssetStatus
  category?: Category
  details?: HardwareDetail | LicenseDetail | null
  created_at: string
  updated_at: string
}

export interface ApiPaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface UserCreatePayload {
  name: string
  email: string
  password?: string
  role?: string
}

export interface UserUpdatePayload {
  name?: string
  email?: string
  role?: string
}
