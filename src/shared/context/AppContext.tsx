import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Client, ClientRequest, Category, ActivityLog, Notification } from '@/types'
import { mockClients, mockRequests, mockCategories, mockActivityLogs, mockNotifications } from '@/data/mockData'

interface AppContextValue {
  clients: Client[]
  requests: ClientRequest[]
  categories: Category[]
  activityLogs: ActivityLog[]
  notifications: Notification[]
  unreadCount: number
  addRequest: (req: ClientRequest) => void
  updateRequest: (id: string, updates: Partial<ClientRequest>) => void
  addCategory: (cat: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addClient: (client: Client) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [requests, setRequests] = useState<ClientRequest[]>(mockRequests)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [activityLogs] = useState<ActivityLog[]>(mockActivityLogs)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const addRequest = (req: ClientRequest) => {
    setRequests(prev => [req, ...prev])
  }

  const updateRequest = (id: string, updates: Partial<ClientRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  const addCategory = (cat: Category) => {
    setCategories(prev => [cat, ...prev])
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const addClient = (client: Client) => {
    setClients(prev => [client, ...prev])
  }

  return (
    <AppContext.Provider value={{
      clients, requests, categories, activityLogs, notifications,
      unreadCount, addRequest, updateRequest, addCategory, updateCategory,
      deleteCategory, markNotificationRead, markAllNotificationsRead, addClient,
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
