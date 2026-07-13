const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://giftmebe.onrender.com/api'

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, { ...o, method: 'POST', body: b }),
  put: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, { ...o, method: 'PUT', body: b }),
  delete: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'DELETE' }),
}

// Opt-in only: mock data must never activate in a misconfigured prod build.
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
