import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, Organization } from '@/types'
import { mockUsers, mockOrg } from '@/data/mockData'

interface AuthContextValue {
  user: User | null
  org: Organization | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: RegisterData) => Promise<boolean>
}

interface RegisterData {
  name: string
  email: string
  password: string
  orgName: string
  orgEmail: string
  orgPhone: string
  orgAddress: string
  orgCountry: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('done_user')
    return saved ? JSON.parse(saved) : null
  })
  const [org] = useState<Organization | null>(mockOrg)

  const login = async (email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800))
    const found = mockUsers.find(u => u.email === email)
    if (found) {
      setUser(found)
      localStorage.setItem('done_user', JSON.stringify(found))
      return true
    }
    // Allow any login for demo
    const demoUser: User = { ...mockUsers[0], email, name: email.split('@')[0] }
    setUser(demoUser)
    localStorage.setItem('done_user', JSON.stringify(demoUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('done_user')
  }

  const register = async (_data: RegisterData): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200))
    const newUser: User = {
      id: 'u_new',
      name: _data.name,
      email: _data.email,
      role: 'owner',
      createdAt: new Date().toISOString(),
    }
    setUser(newUser)
    localStorage.setItem('done_user', JSON.stringify(newUser))
    return true
  }

  return (
    <AuthContext.Provider value={{ user, org, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
