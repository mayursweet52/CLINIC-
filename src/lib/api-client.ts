export class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.message || 'An error occurred')
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`
  
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      // Don't redirect if the endpoint is checking auth status
      if (!url.includes('/portal/me') && !url.includes('/auth/me')) {
        window.location.href = '/login'
      }
    }
    const data = await response.json().catch(() => null)
    throw new ApiError(response.status, data)
  }

  // Handle empty responses
  const text = await response.text()
  return text ? JSON.parse(text) : ({} as T)
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
    
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
    
  put: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
    
  del: <T>(endpoint: string, options?: RequestInit) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
