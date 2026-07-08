import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Organization } from '@/types'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  organization_id: string
  name: string
  role: 'owner' | 'administrator' | 'notary' | 'receptionist'
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  user: User | null
  userProfile: UserProfile | null
  org: Organization | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
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

const DEMO_ORG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const user: User | null = session?.user ? {
    id: session.user.id,
    name: userProfile?.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    role: userProfile?.role || 'viewer',
    createdAt: session.user.created_at,
  } : null

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setOrg(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // User profile doesn't exist yet - use defaults for demo
        const defaultProfile: UserProfile = {
          id: userId,
          organization_id: DEMO_ORG_ID,
          name: 'Demo User',
          role: 'owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setUserProfile(defaultProfile)
        await fetchOrganization(DEMO_ORG_ID)
      } else {
        setUserProfile(profile as UserProfile)
        if (profile.organization_id) {
          await fetchOrganization(profile.organization_id)
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setLoading(false)
    }
  }

  const fetchOrganization = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (!error && data) {
        setOrg({
          id: data.id,
          name: data.name,
          license_number: data.license_number,
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          country: 'Rwanda',
          subdomain: '',
          createdAt: data.created_at,
          subscription_expires_at: data.subscription_expires_at,
          account_status: data.account_status,
          momopay_merchant_code: data.momopay_merchant_code,
          payment_phone: data.payment_phone,
        } as Organization)
      }
    } catch (err) {
      console.error('Error fetching organization:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscription = async () => {
    if (!org?.id) return
    await fetchOrganization(org.id)
  }

  const isSubscriptionValid = (): boolean => {
    if (!org) return true // Allow access if no org loaded yet
    if (org.account_status === 'active') return true
    if (org.account_status === 'trial' && org.subscription_expires_at) {
      return new Date(org.subscription_expires_at) > new Date()
    }
    if (org.account_status === 'suspended' || org.account_status === 'cancelled') {
      return false
    }
    return true // Allow access during loading or undefined state
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUserProfile(null)
    setOrg(null)
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      })

      if (signUpError) {
        return { success: false, error: signUpError.message }
      }

      // Auth state change will handle the rest
      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      org,
      session,
      loading,
      login,
      logout,
      register,
      refreshSubscription,
      isSubscriptionValid,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
