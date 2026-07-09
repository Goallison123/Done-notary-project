import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User, Organization } from '@/types'
import type { Session } from '@supabase/supabase-js'

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

interface RegisterData {
  name: string
  email: string
  password: string
  orgName: string
  orgEmail: string
  orgPhone: string
  orgAddress: string
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
  updateOrganization: (data: Partial<Organization>) => Promise<{ success: boolean; error?: string }>
  refreshSubscription: () => Promise<void>
  isSubscriptionValid: () => boolean
}

const DEMO_ORG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const demoOrg: Organization = {
  id: DEMO_ORG_ID,
  name: 'My Notary Office',
  address: 'KG 123 Ave, Kigali',
  phone: '+250 788 000 000',
  email: 'office@done-notary.rw',
  country: 'Rwanda',
  province: 'City of Kigali',
  district: 'Gasabo',
  sector: 'Remera',
  description: 'A licensed notary office in Rwanda',
  createdAt: new Date().toISOString(),
  subscription_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  account_status: 'trial',
  momopay_merchant_code: '182845',
  payment_phone: '+250 788 000 000',
}

const demoProfile: UserProfile = {
  id: 'demo-user',
  organization_id: DEMO_ORG_ID,
  name: 'Demo User',
  role: 'owner',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const user: User | null = session?.user ? {
    id: session.user.id,
    name: userProfile?.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    role: userProfile?.role || 'receptionist',
    createdAt: session.user.created_at,
  } : null

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))

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
        .maybeSingle()

      if (error || !profile) {
        setUserProfile({ ...demoProfile, id: userId })
        setOrg(demoOrg)
      } else {
        setUserProfile(profile as UserProfile)
        if (profile.organization_id) {
          await fetchOrganization(profile.organization_id)
        }
      }
    } catch {
      setUserProfile({ ...demoProfile, id: userId })
      setOrg(demoOrg)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganization = async (orgId: string) => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .maybeSingle()

    if (!error && data) {
      setOrg({
        id: data.id,
        name: data.name,
        license_number: data.license_number,
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        province: data.province,
        district: data.district,
        sector: data.sector,
        country: 'Rwanda',
        description: data.description,
        website: data.website,
        createdAt: data.created_at,
        subscription_expires_at: data.subscription_expires_at,
        trial_started_at: data.trial_started_at,
        account_status: data.account_status || 'trial',
        momopay_merchant_code: data.momopay_merchant_code,
        payment_phone: data.payment_phone,
        payment_email: data.payment_email,
      } as Organization)
    } else {
      setOrg(demoOrg)
    }
  }

  const updateOrganization = async (data: Partial<Organization>): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) return { success: false, error: 'No organization' }

    // Update local state immediately
    setOrg(prev => prev ? { ...prev, ...data } : prev)

    if (!isSupabaseConfigured) return { success: true }

    const { error } = await supabase
      .from('organizations')
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        province: data.province,
        district: data.district,
        sector: data.sector,
        description: data.description,
        website: data.website,
        license_number: data.license_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', org.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  const refreshSubscription = async () => {
    if (!userProfile?.organization_id || !isSupabaseConfigured) return
    await fetchOrganization(userProfile.organization_id)
  }

  const isSubscriptionValid = (): boolean => {
    if (!org) return true
    if (org.account_status === 'active') return true
    if (org.account_status === 'trial' && org.subscription_expires_at) {
      return new Date(org.subscription_expires_at) > new Date()
    }
    if (org.account_status === 'suspended' || org.account_status === 'cancelled') return false
    return true
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      // Demo mode
      const demoSession = {
        user: { id: 'demo-user', email, created_at: new Date().toISOString() },
        access_token: 'demo',
        refresh_token: 'demo',
        expires_in: 3600,
        token_type: 'bearer',
      } as Session
      setSession(demoSession)
      setUserProfile({ ...demoProfile, name: email.split('@')[0] })
      setOrg({ ...demoOrg, name: 'My Notary Office', email })
      return { success: true }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setSession(null)
    setUserProfile(null)
    setOrg(null)
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return login(data.email, data.password)
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    })

    if (signUpError) return { success: false, error: signUpError.message }
    if (!authData.user) return { success: false, error: 'Signup failed' }

    // Create organization + profile via database function
    const { error: orgError } = await supabase.rpc('register_organization', {
      p_org_name: data.orgName,
      p_org_email: data.orgEmail || data.email,
      p_org_phone: data.orgPhone,
      p_org_address: data.orgAddress,
      p_user_name: data.name,
      p_user_id: authData.user.id,
    })

    if (orgError) {
      console.error('Org registration error:', orgError)
      // Still allow login even if org setup fails
    }

    return { success: true }
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
      updateOrganization,
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
