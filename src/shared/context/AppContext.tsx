import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Client, Category, ActivityLog, Notification, CheckIn, ServiceType, RwandaLocation } from '@/types'
import { useAuth } from './AuthContext'

interface AppContextValue {
  clients: Client[]
  checkIns: CheckIn[]
  categories: Category[]
  activityLogs: ActivityLog[]
  notifications: Notification[]
  serviceTypes: ServiceType[]
  locations: RwandaLocation[]
  unreadCount: number
  loading: boolean
  refreshClients: () => Promise<void>
  refreshCheckIns: () => Promise<void>
  refreshActivityLogs: () => Promise<void>
  addCheckIn: (checkIn: Partial<CheckIn>) => Promise<{ success: boolean; error?: string }>
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

// Demo data for when Supabase is not connected
const demoServiceTypes: ServiceType[] = [
  { id: '1', name: 'Land Transfer', code: 'LAND-001', category: 'Land & Property', is_active: true, sort_order: 1, created_at: new Date().toISOString(), requires_witness: false },
  { id: '2', name: 'Property Sale Agreement', code: 'PROP-001', category: 'Land & Property', is_active: true, sort_order: 2, created_at: new Date().toISOString(), requires_witness: false },
  { id: '3', name: 'Mortgage Registration', code: 'MORT-001', category: 'Land & Property', is_active: true, sort_order: 3, created_at: new Date().toISOString(), requires_witness: false },
  { id: '4', name: 'Power of Attorney', code: 'POA-001', category: 'Corporate', is_active: true, sort_order: 4, created_at: new Date().toISOString(), requires_witness: true },
  { id: '5', name: 'Company Board Resolution', code: 'BRD-001', category: 'Corporate', is_active: true, sort_order: 5, created_at: new Date().toISOString(), requires_witness: false },
]

const demoLocations: RwandaLocation[] = [
  { id: '1', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Nyarugenge' },
  { id: '2', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Magerwa' },
  { id: '3', province: 'City of Kigali', district: 'Gasabo', sector: 'Remera' },
  { id: '4', province: 'City of Kigali', district: 'Kicukiro', sector: 'Kicukiro' },
  { id: '5', province: 'Northern', district: 'Musanze', sector: 'Musanze' },
]

const demoCheckIns: CheckIn[] = [
  { id: '1', organization_id: 'demo', token_id: 't1', sequence_number: 1, client_name: 'Jean Claude Habyarimana', client_phone: '+250 788 123 456', status: 'submitted', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', organization_id: 'demo', token_id: 't2', sequence_number: 2, client_name: 'Marie Uwimana', client_phone: '+250 722 234 567', status: 'in_progress', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', organization_id: 'demo', token_id: 't3', sequence_number: 3, client_name: 'Emmanuel Niyonzima', client_phone: '+250 733 345 678', status: 'ready', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const demoActivityLogs: ActivityLog[] = [
  { id: '1', action: 'created', entityType: 'client', entityId: '1', entityName: 'Jean Claude Habyarimana', userId: 'demo', userName: 'Receptionist', ipAddress: '127.0.0.1', timestamp: new Date().toISOString() },
  { id: '2', action: 'submitted', entityType: 'client', entityId: '2', entityName: 'Marie Uwimana', userId: 'demo', userName: 'Client', ipAddress: '127.0.0.1', timestamp: new Date().toISOString() },
]

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { org, userProfile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>(isSupabaseConfigured ? [] : demoCheckIns)
  const [categories, setCategories] = useState<Category[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(isSupabaseConfigured ? [] : demoActivityLogs)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(isSupabaseConfigured ? [] : demoServiceTypes)
  const [locations, setLocations] = useState<RwandaLocation[]>(isSupabaseConfigured ? [] : demoLocations)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const unreadCount = notifications.filter(n => !n.read).length

  // Load reference data (service types, locations) once
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const loadReferenceData = async () => {
      const [{ data: services }, { data: locs }] = await Promise.all([
        supabase.from('service_types').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('rwanda_locations').select('*'),
      ])
      if (services) setServiceTypes(services as ServiceType[])
      if (locs) setLocations(locs as RwandaLocation[])
    }
    loadReferenceData().catch(() => {
      setServiceTypes(demoServiceTypes)
      setLocations(demoLocations)
    })
  }, [])

  // Load org-specific data when org changes
  useEffect(() => {
    if (!org?.id || !isSupabaseConfigured) {
      if (!isSupabaseConfigured) {
        setLoading(false)
      }
      return
    }

    const loadData = async () => {
      setLoading(true)

      const [{ data: clientsData }, { data: checkInsData }, { data: auditData }] = await Promise.all([
        supabase.from('clients').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }),
        supabase.from('check_ins').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('audit_logs').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(100),
      ])

      if (clientsData) {
        setClients(clientsData.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          name: c.full_name as string,
          phone: c.phone as string,
          email: c.email as string | undefined,
          nationalId: c.national_id as string | undefined,
          address: c.address as string | undefined,
          country: 'Rwanda',
          orgId: c.organization_id as string,
          createdAt: c.created_at as string,
          updatedAt: c.updated_at as string,
        })))
      }

      if (checkInsData) {
        setCheckIns(checkInsData.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          organization_id: c.organization_id as string,
          token_id: c.token_id as string,
          sequence_number: c.sequence_number as number,
          client_name: c.client_name as string,
          client_phone: c.client_phone as string,
          client_national_id: c.national_id as string | undefined,
          service_type_id: c.service_type_id as string | undefined,
          signature_svg: c.signature_svg as string | undefined,
          record_hash: c.record_hash as string | undefined,
          status: c.status as 'in_progress' | 'submitted' | 'signed' | 'ready' | 'called' | 'archived',
          check_in_time: c.check_in_at as string | undefined,
          completion_time: c.submitted_at as string | undefined,
          created_at: c.created_at as string,
          updated_at: c.updated_at as string,
        })))
      }

      if (auditData) {
        setActivityLogs(auditData.map((a: Record<string, unknown>) => ({
          id: a.id as string,
          action: a.action as 'created' | 'edited' | 'viewed' | 'submitted' | 'downloaded' | 'expired' | 'deleted' | 'login',
          entityType: a.entity_type as 'request' | 'client' | 'category' | 'document' | 'user' | 'organization',
          entityId: a.entity_id as string,
          entityName: (a.client_name as string) || (a.user_name as string) || 'Unknown',
          userId: (a.user_id as string) || '',
          userName: (a.user_name as string) || 'System',
          ipAddress: (a.ip_address as string) || '',
          timestamp: a.created_at as string,
        })))
      }

      setLoading(false)
    }

    loadData().catch(() => {
      setCheckIns(demoCheckIns)
      setActivityLogs(demoActivityLogs)
      setLoading(false)
    })
  }, [org?.id])

  const refreshClients = useCallback(async () => {
    if (!org?.id || !isSupabaseConfigured) return
    const { data } = await supabase.from('clients').select('*').eq('organization_id', org.id).order('created_at', { ascending: false })
    if (data) {
      setClients(data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.full_name as string,
        phone: c.phone as string,
        email: c.email as string | undefined,
        nationalId: c.national_id as string | undefined,
        address: c.address as string | undefined,
        country: 'Rwanda',
        orgId: c.organization_id as string,
        createdAt: c.created_at as string,
        updatedAt: c.updated_at as string,
      })))
    }
  }, [org?.id])

  const refreshCheckIns = useCallback(async () => {
    if (!org?.id || !isSupabaseConfigured) return
    const { data } = await supabase.from('check_ins').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(50)
    if (data) {
      setCheckIns(data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        organization_id: c.organization_id as string,
        token_id: c.token_id as string,
        sequence_number: c.sequence_number as number,
        client_name: c.client_name as string,
        client_phone: c.client_phone as string,
        client_national_id: c.national_id as string | undefined,
        service_type_id: c.service_type_id as string | undefined,
        signature_svg: c.signature_svg as string | undefined,
        record_hash: c.record_hash as string | undefined,
        status: c.status as 'in_progress' | 'submitted' | 'signed' | 'ready' | 'called' | 'archived',
        check_in_time: c.check_in_at as string | undefined,
        completion_time: c.submitted_at as string | undefined,
        created_at: c.created_at as string,
        updated_at: c.updated_at as string,
      })))
    }
  }, [org?.id])

  const refreshActivityLogs = useCallback(async () => {
    if (!org?.id || !isSupabaseConfigured) return
    const { data } = await supabase.from('audit_logs').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(100)
    if (data) {
      setActivityLogs(data.map((a: Record<string, unknown>) => ({
        id: a.id as string,
        action: a.action as 'created' | 'edited' | 'viewed' | 'submitted' | 'downloaded' | 'expired' | 'deleted' | 'login',
        entityType: a.entity_type as 'request' | 'client' | 'category' | 'document' | 'user' | 'organization',
        entityId: a.entity_id as string,
        entityName: (a.client_name as string) || (a.user_name as string) || 'Unknown',
        userId: (a.user_id as string) || '',
        userName: (a.user_name as string) || 'System',
        ipAddress: (a.ip_address as string) || '',
        timestamp: a.created_at as string,
      })))
    }
  }, [org?.id])

  const addCheckIn = useCallback(async (checkIn: Partial<CheckIn>): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id || !userProfile?.id || !isSupabaseConfigured) {
      // Demo mode - add to local state
      const newCheckIn: CheckIn = {
        id: `demo-${Date.now()}`,
        organization_id: org?.id || 'demo',
        token_id: `token-${Date.now()}`,
        sequence_number: checkIns.length + 1,
        client_name: checkIn.client_name || 'Demo Client',
        client_phone: checkIn.client_phone || '+250 000 000 000',
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...checkIn,
      }
      setCheckIns(prev => [newCheckIn, ...prev])
      return { success: true }
    }

    try {
      const { error } = await supabase.from('check_ins').insert({
        organization_id: org.id,
        ...checkIn,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      await refreshCheckIns()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [org?.id, userProfile?.id, refreshCheckIns, checkIns.length])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  return (
    <AppContext.Provider value={{
      clients,
      checkIns,
      categories,
      activityLogs,
      notifications,
      serviceTypes,
      locations,
      unreadCount,
      loading,
      refreshClients,
      refreshCheckIns,
      refreshActivityLogs,
      addCheckIn,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
