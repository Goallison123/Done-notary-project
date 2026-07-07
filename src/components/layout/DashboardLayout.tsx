import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, FolderOpen, FileText, Activity,
  Bell, Settings, LogOut, Menu, Search,
  CheckSquare, Plus, ChevronDown,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import GlobalSearch from '../shared/GlobalSearch'

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
  owner: 'bg-amber-100 text-amber-700',
  administrator: 'bg-blue-100 text-blue-700',
  receptionist: 'bg-teal-100 text-teal-700',
  reviewer: 'bg-violet-100 text-violet-700',
  viewer: 'bg-brand-100 text-brand-500',
}

function NavItem({ to, icon: Icon, label, end, badgeCount }: {
  to: string; icon: React.ElementType; label: string; end?: boolean; badgeCount?: number
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => clsx(
        'group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all',
        isActive
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
          : 'text-brand-500 hover:bg-brand-100/80 hover:text-brand-900',
      )}
    >
      <Icon size={15} />
      <span className="flex-1 leading-none">{label}</span>
      {badgeCount != null && badgeCount > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold font-mono">
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
    <aside className="flex flex-col bg-white border-r border-brand-200/80 h-full w-60">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-brand-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-900 rounded-xl flex items-center justify-center shadow-sm">
              <CheckSquare size={15} className="text-teal-400" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</div>
              <div className="text-[10px] text-brand-400 truncate max-w-[120px]">{org?.name}</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-brand-100">
              <Menu size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest px-3 mb-2">Main</p>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="pt-4 mt-4 border-t border-brand-100 space-y-0.5">
          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest px-3 mb-2">System</p>
          {bottomItems.map(item => (
            <NavItem
              key={item.to}
              {...item}
              badgeCount={item.badge ? unreadCount : undefined}
            />
          ))}
        </div>
      </nav>

      {/* Quick action */}
      <div className="px-3 pb-2">
        <button
          onClick={() => { navigate('/dashboard/requests/new'); onClose?.() }}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={15} /> New Request
        </button>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-brand-100">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-semibold text-brand-800 truncate">{user?.name}</div>
            <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block mt-0.5 capitalize ${roleColors[user?.role || 'viewer']}`}>
              {user?.role}
            </div>
          </div>
          <ChevronDown size={14} className={`text-brand-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {userMenuOpen && (
          <div className="mt-1 py-1 bg-white border border-brand-200 rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} /> Sign out
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

  const pageInfo = (() => {
    if (location.pathname.startsWith('/dashboard/clients/')) return { title: 'Client Profile' }
    if (location.pathname.startsWith('/dashboard/categories/')) return { title: location.pathname.includes('/new') ? 'New Category' : 'Edit Category' }
    return pageTitles[location.pathname] || { title: 'DONE' }
  })()

  // Cmd+K shortcut
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

  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-brand-200/80 flex items-center gap-3 px-4 md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-brand-500 hover:bg-brand-100 transition-colors">
            <Menu size={18} />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {pageInfo.title}
            </h1>
          </div>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-3 h-8 text-sm text-brand-400 hover:bg-brand-100 hover:border-brand-300 transition-all w-48 md:w-64"
          >
            <Search size={13} />
            <span className="flex-1 text-left text-xs">Search...</span>
            <kbd className="hidden sm:block text-[10px] bg-white border border-brand-200 text-brand-400 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
