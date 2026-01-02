/**
 * API Client
 * عميل API
 * 
 * Simple fetch wrapper for public read-only data
 * wrapper بسيط لـ fetch للبيانات العامة للقراءة فقط
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost/api/v1'

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  // Log request for debugging (only in development)
  // تسجيل الطلب للتشخيص (فقط في التطوير)
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Client] Request:', { method: options?.method || 'GET', url, apiUrl: API_URL })
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Add credentials for CORS
      // إضافة credentials لـ CORS
      credentials: 'include',
    })

    if (!response.ok) {
      // Try to parse error response
      // محاولة تحليل استجابة الخطأ
      let errorMessage = `API Error: ${response.status} ${response.statusText}`
      
      // Special handling for 502 Bad Gateway
      // معالجة خاصة لخطأ 502 Bad Gateway
      if (response.status === 502) {
        errorMessage = `Backend server is not responding (502 Bad Gateway). Please check if the backend service is running.`
        console.error('[API Client] 502 Bad Gateway:', {
          url,
          apiUrl: API_URL,
          endpoint,
          message: 'Backend server (Django) is not reachable from Nginx',
        })
      } else if (response.status === 503) {
        errorMessage = `Backend server is temporarily unavailable (503 Service Unavailable). Please try again later.`
      } else if (response.status === 504) {
        errorMessage = `Backend server request timeout (504 Gateway Timeout). The server took too long to respond.`
      }
      
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        }
      } catch {
        // If JSON parsing fails, use status text
        // إذا فشل تحليل JSON، استخدم نص الحالة
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    // Handle network errors (Backend not running, CORS, etc.)
    // معالجة أخطاء الشبكة (الباك إند لا يعمل، CORS، إلخ)
    if (error instanceof TypeError) {
      // Check if it's a network error
      // التحقق إذا كان خطأ شبكة
      const isNetworkError = 
        error.message.includes('fetch') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('ERR_NETWORK_CHANGED')
      
      if (isNetworkError) {
        // Log diagnostic information
        // تسجيل معلومات تشخيصية
        console.error('[API Client] Network error details:', {
          url,
          apiUrl: API_URL,
          endpoint,
          errorMessage: error.message,
          errorType: error.constructor.name,
          isClientSide: typeof window !== 'undefined',
        })
        
        throw new Error(
          `Failed to connect to API at ${url}. ` +
          `Please make sure the backend server is running on ${API_URL}. ` +
          `If the server is running, this might be a CORS issue. ` +
          `Check browser console for more details.`
        )
      }
    }
    throw error
  }
}

