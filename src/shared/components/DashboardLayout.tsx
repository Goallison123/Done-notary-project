import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, FolderOpen, FileText, Activity,
  Bell, Settings, LogOut, Menu, Search, X,
  CheckSquare, Plus, ChevronDown,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/shared/context/AuthContext'
import { useApp } from '@/shared/context/AppContext'
import GlobalSearch from './GlobalSearch'
import { SubscriptionLockout } from '@/features/subscription'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/clients', icon: Users, label: 'Clients' },
  { to: '/dashboard/categories', icon: FolderOpen, label: 'Categories' },
  { to: '/dashboard/requests', icon: FileText, label: 'Requests' },
  { to: '/dashboard/activity', icon: Activity, label: 'Activity Log' },
]

const bottomItems = [
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const roleColors: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-700 border-amber-200',
  administrator: 'bg-blue-100 text-blue-700 border-blue-200',
  receptionist: 'bg-teal-100 text-teal-700 border-teal-200',
  reviewer: 'bg-violet-100 text-violet-700 border-violet-200',
  viewer: 'bg-brand-100 text-brand-600 border-brand-200',
}

function NavItem({ to, icon: Icon, label, end, badgeCount }: {
  to: string; icon: React.ElementType; label: string; end?: boolean; badgeCount?: number
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => clsx(
        'group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all relative',
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
          : 'text-brand-500 hover:bg-brand-100 hover:text-brand-800',
      )}
    >
      <Icon size={18} strokeWidth={2} className={clsx(
        'flex-shrink-0 opacity-70 group-hover:opacity-100',
      )} />
      <span className="flex-1 leading-none">{label}</span>
      {badgeCount != null && badgeCount > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold font-mono shadow-sm">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </NavLink>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, org, logout } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useApp()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    onClose?.()
  }

  return (
    <aside className="flex flex-col bg-white border-r border-brand-100 h-full w-72 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-brand-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-900 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/20">
              <CheckSquare size={18} className="text-teal-400" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</div>
              <div className="text-[11px] text-brand-500 truncate max-w-[140px] font-medium">{org?.name}</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-xl text-brand-400 hover:text-brand-700 hover:bg-brand-100 transition-all">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Quick action */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => { navigate('/dashboard/requests/new'); onClose?.() }}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} /> New Request
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.15em] px-4 mb-2 ml-1">Main Menu</p>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="pt-4 mt-4 border-t border-brand-100 space-y-1">
          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.15em] px-4 mb-2 ml-1">System</p>
          {bottomItems.map(item => (
            <NavItem
              key={item.to}
              {...item}
              badgeCount={item.badge ? unreadCount : undefined}
            />
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-brand-100 bg-brand-50/50">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-all group relative"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md shadow-blue-500/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-semibold text-brand-800 truncate">{user?.name}</div>
            <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block mt-1 capitalize border ${roleColors[user?.role || 'viewer']}`}>
              {user?.role}
            </div>
          </div>
          <ChevronDown size={16} className={`text-brand-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {userMenuOpen && (
          <div className="mt-2 py-1 bg-white border border-brand-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-100">
              <p className="text-xs text-brand-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

const pageTitles: Record<string, { title: string; desc?: string }> = {
  '/dashboard': { title: 'Dashboard', desc: "Overview of your office activity" },
  '/dashboard/clients': { title: 'Clients', desc: 'Search and manage client records' },
  '/dashboard/categories': { title: 'Categories', desc: 'Manage form templates' },
  '/dashboard/requests': { title: 'Requests', desc: 'Track all client form requests' },
  '/dashboard/requests/new': { title: 'New Request', desc: 'Create a client form request' },
  '/dashboard/activity': { title: 'Activity Log', desc: 'Complete audit trail' },
  '/dashboard/notifications': { title: 'Notifications', desc: 'Alerts and updates' },
  '/dashboard/settings': { title: 'Settings', desc: 'Organization configuration' },
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { isSubscriptionValid, refreshSubscription } = useAuth()

  const pageInfo = (() => {
    if (location.pathname.startsWith('/dashboard/clients/')) return { title: 'Client Profile' }
    if (location.pathname.startsWith('/dashboard/categories/')) return { title: location.pathname.includes('/new') ? 'New Category' : 'Edit Category' }
    return pageTitles[location.pathname] || { title: 'DONE' }
  })()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isSubscriptionValid()) {
    return <SubscriptionLockout onRetry={refreshSubscription} />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50/50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-16 bg-white/80 backdrop-blur-xl border-b border-brand-100 flex items-center gap-4 px-5 md:px-8">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2.5 rounded-xl text-brand-500 hover:bg-brand-100 transition-all">
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h1 className="text-base font-bold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {pageInfo.title}
            </h1>
            {pageInfo.desc && (
              <p className="text-xs text-brand-500 mt-0.5">{pageInfo.desc}</p>
            )}
          </div>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 h-10 text-sm text-brand-400 hover:bg-white hover:border-brand-300 hover:shadow-sm transition-all w-56 md:w-72"
          >
            <Search size={15} className="opacity-60" />
            <span className="flex-1 text-left text-[13px]">Search clients, requests...</span>
            <kbd className="hidden md:flex text-[10px] bg-white border border-brand-200 text-brand-500 px-2 py-1 rounded-lg font-mono shadow-sm">
              Cmd+K
            </kbd>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-brand-50/50 to-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
