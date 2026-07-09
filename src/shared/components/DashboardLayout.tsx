import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, FolderOpen, FileText, Activity,
  Bell, Settings, LogOut, Menu, Search, X,
  CheckSquare, ChevronDown,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/shared/context/AuthContext'
import { useApp } from '@/shared/context/AppContext'
import GlobalSearch from './GlobalSearch'
import { SubscriptionLockout } from '@/features/subscription'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/clients', icon: Users, label: 'Clients' },
  { to: '/dashboard/requests', icon: FileText, label: 'Records' },
  { to: '/dashboard/activity', icon: Activity, label: 'Activity Log' },
]

const bottomItems = [
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const roleColors: Record<string, string> = {
  owner:         'bg-amber-100 text-amber-800 border-amber-200',
  administrator: 'bg-blue-100 text-blue-800 border-blue-200',
  notary:        'bg-violet-100 text-violet-800 border-violet-200',
  receptionist:  'bg-teal-100 text-teal-800 border-teal-200',
  viewer:        'bg-slate-100 text-slate-600 border-slate-200',
}

function NavItem({ to, icon: Icon, label, end, badgeCount }: {
  to: string; icon: React.ElementType; label: string; end?: boolean; badgeCount?: number
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive
          ? 'bg-slate-900 text-white shadow-lg'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badgeCount != null && badgeCount > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
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

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <aside className="flex flex-col bg-white border-r border-slate-100 h-full w-64 shadow-sm">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
            <CheckSquare size={16} className="text-teal-400" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900 tracking-tight">DONE</div>
            <div className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">{org?.name || 'Notary Office'}</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] px-3 mb-2">Main Menu</p>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="pt-4 mt-2 border-t border-slate-100 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] px-3 mb-2">System</p>
          {bottomItems.map(item => (
            <NavItem key={item.to} {...item} badgeCount={item.badge ? unreadCount : undefined} />
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-100">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-all text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{user?.name}</div>
            <div className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5 capitalize border', roleColors[user?.role || 'viewer'])}>
              {user?.role}
            </div>
          </div>
          <ChevronDown size={14} className={clsx('text-slate-400 transition-transform', userMenuOpen && 'rotate-180')} />
        </button>

        {userMenuOpen && (
          <div className="mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

const pageTitles: Record<string, { title: string; desc?: string }> = {
  '/dashboard': { title: 'Dashboard', desc: 'Live queue and client intake' },
  '/dashboard/clients': { title: 'Clients', desc: 'Client registry and records' },
  '/dashboard/requests': { title: 'Records', desc: 'All client check-in records' },
  '/dashboard/requests/new': { title: 'New Request', desc: 'Create a form request' },
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
    if (location.pathname.match(/\/dashboard\/clients\/.+/)) return { title: 'Client Profile', desc: 'Client details and history' }
    if (location.pathname.startsWith('/dashboard/categories/')) {
      return { title: location.pathname.includes('/new') ? 'New Category' : 'Edit Category', desc: 'Configure form template' }
    }
    return pageTitles[location.pathname] || { title: 'DONE Platform' }
  })()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isSubscriptionValid()) {
    return <SubscriptionLockout onRetry={refreshSubscription} />
  }

  // Dashboard page gets no padding (it manages its own layout)
  const isDashboard = location.pathname === '/dashboard'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-slate-100 flex items-center gap-3 px-4 md:px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">{pageInfo.title}</h1>
            {pageInfo.desc && <p className="text-xs text-slate-500 leading-tight hidden sm:block">{pageInfo.desc}</p>}
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 bg-slate-100 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl px-3.5 h-9 text-sm text-slate-400 hover:text-slate-600 transition-all md:w-56"
          >
            <Search size={14} />
            <span className="hidden sm:block text-[13px] flex-1 text-left">Search...</span>
            <kbd className="hidden md:block text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Page content */}
        <main className={clsx('flex-1 overflow-hidden', isDashboard ? '' : 'overflow-y-auto')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
