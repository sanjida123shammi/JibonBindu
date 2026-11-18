import axios, { isAxiosError } from 'axios'

const TOKEN_KEY = 'jbf_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5127',
})

// Every request carries the saved JWT.
http.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

/** Turns anything thrown by axios (or our own Error) into a message fit for the screen. */
export function getErrorMessage(err: unknown): string {
  if (isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return 'Cannot reach the server. Check that the API is running.'

    const data = err.response.data
    if (data?.message) return data.message // { flag, message } from the auth endpoints
    const firstValidationError = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return firstValidationError ?? `Request failed (${err.response.status}).`
  }
  return err instanceof Error ? err.message : 'Something went wrong.'
}
