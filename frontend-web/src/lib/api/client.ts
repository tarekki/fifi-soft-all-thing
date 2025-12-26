/**
 * API Client
 * عميل API
 * 
 * Simple fetch wrapper for public read-only data
 * wrapper بسيط لـ fetch للبيانات العامة للقراءة فقط
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    // Handle network errors (Backend not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Failed to connect to API at ${url}. ` +
        `Please make sure the backend server is running on ${API_URL}`
      )
    }
    throw error
  }
}

