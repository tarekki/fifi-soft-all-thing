/**
 * API Response Types
 * أنواع استجابات الـ API
 */

import { ApiResponse, PaginatedResponse } from './common'

export type ApiError = {
  message: string
  errors?: Record<string, string[]>
}

export type ApiSuccessResponse<T> = ApiResponse<T>

export type ApiPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>

