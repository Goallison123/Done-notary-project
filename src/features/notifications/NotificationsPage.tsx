import { CheckCircle, Bell, Upload, Clock, AlertCircle, Info, Check } from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import type { Notification } from '@/types'
import { clsx } from 'clsx'

const typeConfig: Record<Notification['type'], { icon: React.ElementType; color: string; bg: string }> = {
  completed: { icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-100' },
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  upload: { icon: Upload, color: 'text-blue-600', bg: 'bg-blue-100' },
  expired: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  info: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-100' },
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp()

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Check size={16} />
            Mark all read
          </button>
        )}
      </div>

      {unread.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Unread</p>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              {unread.map(notif => {
                const tc = typeConfig[notif.type]
                return (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', tc.bg)}>
                      <tc.icon size={18} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{notif.title}</div>
                          <div className="text-sm text-slate-600 mt-0.5">{notif.message}</div>
                        </div>
                        <div className="w-2.5 h-2.5 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                      </div>
                      <div className="text-xs text-slate-400 mt-2 font-mono">
                        {new Date(notif.createdAt).toLocaleString('en-RW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Earlier</p>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              {read.map(notif => {
                const tc = typeConfig[notif.type]
                return (
                  <div key={notif.id} className="flex items-start gap-4 px-5 py-4 opacity-60 hover:opacity-100 transition-opacity">
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', tc.bg)}>
                      <tc.icon size={18} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700">{notif.title}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{notif.message}</div>
                      <div className="text-xs text-slate-400 mt-2 font-mono">
                        {new Date(notif.createdAt).toLocaleString('en-RW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">No notifications yet</p>
          <p className="text-sm text-slate-400">When you have updates, they'll appear here</p>
        </div>
      )}
    </div>
  )
}
