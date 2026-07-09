import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
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
  addCheckIn: (checkIn: Partial<CheckIn>) => Promise<{ success: boolean; error?: string; data?: CheckIn }>
  updateCheckInStatus: (id: string, status: CheckIn['status']) => Promise<void>
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

// Demo data
const DEMO_SERVICE_TYPES: ServiceType[] = [
  { id: '1', name: 'Land Transfer', name_kinyarwanda: 'Gukura Umukono', code: 'LT', category: 'Land & Property', is_active: true, sort_order: 1, created_at: new Date().toISOString(), requires_witness: false },
  { id: '2', name: 'Power of Attorney', name_kinyarwanda: 'Uruhushya rwo Muhagararira', code: 'POA', category: 'Corporate', is_active: true, sort_order: 2, created_at: new Date().toISOString(), requires_witness: true },
  { id: '3', name: 'Property Sale Agreement', name_kinyarwanda: 'Amasezerano yo Kugurisha', code: 'PSA', category: 'Land & Property', is_active: true, sort_order: 3, created_at: new Date().toISOString(), requires_witness: false },
  { id: '4', name: 'Affidavit', name_kinyarwanda: 'Inkuru yo Kurahira', code: 'AFF', category: 'Personal', is_active: true, sort_order: 4, created_at: new Date().toISOString(), requires_witness: false },
  { id: '5', name: 'Certified Copy', name_kinyarwanda: 'Kopi Yemejwe', code: 'CC', category: 'Documents', is_active: true, sort_order: 5, created_at: new Date().toISOString(), requires_witness: false },
  { id: '6', name: 'Contract Authentication', name_kinyarwanda: 'Kwemeza Amasezerano', code: 'CA', category: 'Corporate', is_active: true, sort_order: 6, created_at: new Date().toISOString(), requires_witness: false },
  { id: '7', name: 'Declaration of Heirship', name_kinyarwanda: 'Isubiranwa', code: 'DH', category: 'Personal', is_active: true, sort_order: 7, created_at: new Date().toISOString(), requires_witness: true },
]

const DEMO_LOCATIONS: RwandaLocation[] = [
  { id: '1', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Nyarugenge' },
  { id: '2', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Magerwa' },
  { id: '3', province: 'City of Kigali', district: 'Gasabo', sector: 'Remera' },
  { id: '4', province: 'City of Kigali', district: 'Gasabo', sector: 'Kacyiru' },
  { id: '5', province: 'City of Kigali', district: 'Gasabo', sector: 'Gisozi' },
  { id: '6', province: 'City of Kigali', district: 'Kicukiro', sector: 'Kicukiro' },
  { id: '7', province: 'City of Kigali', district: 'Kicukiro', sector: 'Niboye' },
  { id: '8', province: 'Northern Province', district: 'Musanze', sector: 'Muhoza' },
  { id: '9', province: 'Northern Province', district: 'Musanze', sector: 'Busogo' },
  { id: '10', province: 'Southern Province', district: 'Huye', sector: 'Ngoma' },
  { id: '11', province: 'Eastern Province', district: 'Rwamagana', sector: 'Kigabiro' },
  { id: '12', province: 'Western Province', district: 'Rubavu', sector: 'Rubavu' },
]

function mapCheckIn(c: Record<string, unknown>): CheckIn {
  return {
    id: c.id as string,
    organization_id: c.organization_id as string,
    token_id: c.token_id as string,
    sequence_number: c.sequence_number as number,
    client_name: c.client_name as string,
    client_phone: c.client_phone as string,
    client_national_id: (c.national_id || c.client_national_id) as string | undefined,
    service_type_id: c.service_type_id as string | undefined,
    service_type_name: c.service_type_name as string | undefined,
    location_province: c.location_province as string | undefined,
    location_district: c.location_district as string | undefined,
    location_sector: c.location_sector as string | undefined,
    signature_svg: c.signature_svg as string | undefined,
    record_hash: c.record_hash as string | undefined,
    status: (c.status as CheckIn['status']) || 'in_progress',
    check_in_time: (c.check_in_at || c.check_in_time) as string | undefined,
    completion_time: (c.submitted_at || c.completion_time) as string | undefined,
    created_at: c.created_at as string,
    updated_at: c.updated_at as string,
  }
}

function mapClient(c: Record<string, unknown>): Client {
  return {
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
  }
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { org } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(DEMO_SERVICE_TYPES)
  const [locations, setLocations] = useState<RwandaLocation[]>(DEMO_LOCATIONS)
  const [loading, setLoading] = useState(false)
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Load reference data once
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const load = async () => {
      const [{ data: svcs }, { data: locs }] = await Promise.all([
        supabase.from('service_types').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('rwanda_locations').select('*').order('province').order('district').order('sector'),
      ])
      if (svcs && svcs.length > 0) setServiceTypes(svcs as ServiceType[])
      if (locs && locs.length > 0) setLocations(locs as RwandaLocation[])
    }
    load()
  }, [])

  // Load org-specific data + subscribe to realtime when org changes
  useEffect(() => {
    if (!org?.id) return

    const orgId = org.id
    setLoading(true)

    const loadOrgData = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      const [
        { data: checkInsData },
        { data: clientsData },
        { data: auditData },
      ] = await Promise.all([
        supabase
          .from('check_ins')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('clients')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('audit_logs')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(100),
      ])

      if (checkInsData) setCheckIns(checkInsData.map(c => mapCheckIn(c as Record<string, unknown>)))
      if (clientsData) setClients(clientsData.map(c => mapClient(c as Record<string, unknown>)))

      if (auditData) {
        setActivityLogs(auditData.map((a: Record<string, unknown>) => ({
          id: a.id as string,
          action: (a.action as ActivityLog['action']) || 'created',
          entityType: (a.entity_type as ActivityLog['entityType']) || 'client',
          entityId: (a.entity_id as string) || '',
          entityName: (a.details as Record<string, unknown>)?.client_name as string || 'Unknown',
          userId: (a.user_id as string) || '',
          userName: (a.details as Record<string, unknown>)?.user_name as string || 'System',
          ipAddress: (a.details as Record<string, unknown>)?.ip_address as string || '',
          timestamp: a.created_at as string,
        })))
      }

      setLoading(false)
    }

    loadOrgData()

    // Real-time subscription for check_ins
    if (isSupabaseConfigured) {
      realtimeRef.current?.unsubscribe()

      realtimeRef.current = supabase
        .channel(`org-checkins-${orgId}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'check_ins', filter: `organization_id=eq.${orgId}` },
          () => {
            // Re-fetch on any change
            supabase
              .from('check_ins')
              .select('*')
              .eq('organization_id', orgId)
              .order('created_at', { ascending: false })
              .limit(100)
              .then(({ data }) => {
                if (data) setCheckIns(data.map(c => mapCheckIn(c as Record<string, unknown>)))
              })
          }
        )
        .subscribe()
    }

    return () => {
      realtimeRef.current?.unsubscribe()
    }
  }, [org?.id])

  const refreshClients = useCallback(async () => {
    if (!org?.id || !isSupabaseConfigured) return
    const { data } = await supabase.from('clients').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(200)
    if (data) setClients(data.map(c => mapClient(c as Record<string, unknown>)))
  }, [org?.id])

  const refreshCheckIns = useCallback(async () => {
    if (!org?.id || !isSupabaseConfigured) return
    const { data } = await supabase.from('check_ins').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(100)
    if (data) setCheckIns(data.map(c => mapCheckIn(c as Record<string, unknown>)))
  }, [org?.id])

  const refreshActivityLogs = useCallback(async () => {
    if (!org?.id || !isSupabaseConfigured) return
    const { data } = await supabase.from('audit_logs').select('*').eq('organization_id', org.id).order('created_at', { ascending: false }).limit(100)
    if (data) {
      setActivityLogs(data.map((a: Record<string, unknown>) => ({
        id: a.id as string,
        action: (a.action as ActivityLog['action']) || 'created',
        entityType: (a.entity_type as ActivityLog['entityType']) || 'client',
        entityId: (a.entity_id as string) || '',
        entityName: (a.details as Record<string, unknown>)?.client_name as string || 'Unknown',
        userId: (a.user_id as string) || '',
        userName: (a.details as Record<string, unknown>)?.user_name as string || 'System',
        ipAddress: '',
        timestamp: a.created_at as string,
      })))
    }
  }, [org?.id])

  const addCheckIn = useCallback(async (checkIn: Partial<CheckIn>): Promise<{ success: boolean; error?: string; data?: CheckIn }> => {
    if (!org?.id) return { success: false, error: 'No organization' }

    if (!isSupabaseConfigured) {
      const newCI: CheckIn = {
        id: `demo-${Date.now()}`,
        organization_id: org.id,
        token_id: `token-${Date.now()}`,
        sequence_number: checkIns.length + 1,
        client_name: checkIn.client_name || 'Demo Client',
        client_phone: checkIn.client_phone || '+250 000 000 000',
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...checkIn,
      }
      setCheckIns(prev => [newCI, ...prev])
      return { success: true, data: newCI }
    }

    const { data, error } = await supabase.from('check_ins').insert({ organization_id: org.id, ...checkIn }).select().single()
    if (error) return { success: false, error: error.message }
    const mapped = mapCheckIn(data as Record<string, unknown>)
    setCheckIns(prev => [mapped, ...prev])
    return { success: true, data: mapped }
  }, [org?.id, checkIns.length])

  const updateCheckInStatus = useCallback(async (id: string, status: CheckIn['status']) => {
    setCheckIns(prev => prev.map(c => c.id === id ? { ...c, status } : c))

    if (isSupabaseConfigured) {
      const updates: Record<string, unknown> = { status }
      if (status === 'archived') updates.archived_at = new Date().toISOString()
      if (status === 'called') updates.called_at = new Date().toISOString()
      await supabase.from('check_ins').update(updates).eq('id', id)
    }
  }, [])

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
      updateCheckInStatus,
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
