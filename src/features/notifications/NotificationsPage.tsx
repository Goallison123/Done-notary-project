import { CheckCircle, Bell, Upload, Clock, AlertCircle, Info, Check } from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import type { Notification } from '@/types'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'

const typeConfig: Record<Notification['type'], { icon: React.ElementType; color: string; bg: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  upload: { icon: Upload, color: 'text-blue-600', bg: 'bg-blue-100' },
  expired: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  info: { icon: Info, color: 'text-brand-600', bg: 'bg-brand-100' },
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp()

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</h1>
          <p className="text-sm text-brand-500 mt-1">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="default" icon={<Check size={16} />} onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {unread.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4">Unread</h2>
          <Card padding="none" className="bg-white border border-brand-100 overflow-hidden rounded-2xl">
            <div className="divide-y divide-brand-50">
              {unread.map(notif => {
                const tc = typeConfig[notif.type]
                return (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className="flex items-start gap-4 px-6 py-5 hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <div className={`w-11 h-11 rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <tc.icon size={20} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-brand-900">{notif.title}</div>
                          <div className="text-sm text-brand-600 mt-1 leading-relaxed">{notif.message}</div>
                        </div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2 shadow-sm shadow-blue-500/50" />
                      </div>
                      <div className="text-xs text-brand-400 mt-2 font-mono">
                        {new Date(notif.createdAt).toLocaleString('en-RW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4">Earlier</h2>
          <Card padding="none" className="bg-white border border-brand-100 overflow-hidden rounded-2xl">
            <div className="divide-y divide-brand-50">
              {read.map(notif => {
                const tc = typeConfig[notif.type]
                return (
                  <div key={notif.id} className="flex items-start gap-4 px-6 py-5 opacity-60 hover:opacity-100 transition-opacity">
                    <div className={`w-11 h-11 rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <tc.icon size={20} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-brand-700">{notif.title}</div>
                      <div className="text-sm text-brand-500 mt-1">{notif.message}</div>
                      <div className="text-xs text-brand-400 mt-2 font-mono">
                        {new Date(notif.createdAt).toLocaleString('en-RW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bell size={36} className="text-brand-300" />
          </div>
          <p className="text-base font-semibold text-brand-600 mb-1">No notifications yet</p>
          <p className="text-sm text-brand-400">When you have updates, they&apos;ll appear here</p>
        </div>
      )}
    </div>
  )
}
