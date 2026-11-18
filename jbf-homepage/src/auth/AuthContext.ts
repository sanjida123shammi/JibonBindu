import { createContext } from 'react'
import type { UserSession } from '../types'

export interface AuthContextValue {
  user: UserSession | null
  /** True while a saved token is being checked on page load. */
  loading: boolean
  /** Throws an Error with a readable message when the login fails. */
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
