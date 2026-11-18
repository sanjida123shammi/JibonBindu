import { http } from './http'
import type { GeneralResponse, LoginResponse, RegisterRequest, UserSession } from '../types'

export const authApi = {
  login: async (email: string, password: string) =>
    (await http.post<LoginResponse>('/api/auth/login', { email, password })).data,

  register: async (dto: RegisterRequest) =>
    (await http.post<GeneralResponse>('/api/auth/register', dto)).data,

  me: async () => (await http.get<UserSession>('/api/auth/me')).data,
}
