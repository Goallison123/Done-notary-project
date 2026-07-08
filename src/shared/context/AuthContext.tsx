import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Organization } from '@/types'
import { mockUsers, mockOrg } from '@/data/mockData'

interface AuthContextValue {
  user: User | null
  org: Organization | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: RegisterData) => Promise<boolean>
  refreshSubscription: () => Promise<void>
  isSubscriptionValid: () => boolean
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
  const [org, setOrg] = useState<Organization | null>(() => {
    const saved = localStorage.getItem('done_org')
    return saved ? JSON.parse(saved) : mockOrg
  })

  const refreshSubscription = async () => {
    if (!org?.id) return
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('subscription_expires_at, account_status, momopay_merchant_code, payment_phone')
        .eq('id', org.id)
        .single()

      if (!error && data) {
        const updatedOrg = { ...org, ...data }
        setOrg(updatedOrg)
        localStorage.setItem('done_org', JSON.stringify(updatedOrg))
      }
    } catch (err) {
      console.error('Failed to refresh subscription:', err)
    }
  }

  useEffect(() => {
    if (org?.id && org.id !== mockOrg.id) {
      refreshSubscription()
    }
  }, [org?.id])

  const isSubscriptionValid = (): boolean => {
    if (!org) return false
    if (org.account_status === 'active') return true
    if (org.account_status === 'trial' && org.subscription_expires_at) {
      return new Date(org.subscription_expires_at) > new Date()
    }
    if (org.account_status === 'suspended' || org.account_status === 'cancelled') {
      return false
    }
    // Default trial: valid for 14 days from first login
    return true
  }

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

    // Set trial expiry to 14 days from now
    const trialOrg: Organization = {
      ...mockOrg,
      id: `org_${Date.now()}`,
      name: _data.orgName,
      email: _data.orgEmail,
      phone: _data.orgPhone,
      address: _data.orgAddress,
      country: _data.orgCountry,
      account_status: 'trial',
      subscription_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      trial_started_at: new Date().toISOString(),
      momopay_merchant_code: '182845',
      payment_phone: '+250 788 123 456',
    }
    setOrg(trialOrg)
    localStorage.setItem('done_org', JSON.stringify(trialOrg))
    return true
  }

  return (
    <AuthContext.Provider value={{ user, org, login, logout, register, refreshSubscription, isSubscriptionValid }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
