/**
 * Common Types
 * الأنواع المشتركة
 */

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  message: string
  errors: Record<string, string[]> | null
}

export type PaginationMeta = {
  count: number
  next: string | null
  previous: string | null
  page: number
  page_size: number
  total_pages: number
}

export type PaginatedResponse<T> = {
  results: T[]
  pagination: PaginationMeta
}

