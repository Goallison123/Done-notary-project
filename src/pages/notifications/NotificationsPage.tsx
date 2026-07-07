import { CheckCircle, Bell, Upload, Clock, AlertCircle, Info, Check } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import type { Notification } from '../../types'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

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
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</h1>
          <p className="text-sm text-brand-500 mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={<Check size={14} />} onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {unread.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Unread</h2>
          <Card padding="none">
            <div className="divide-y divide-brand-50">
              {unread.map(notif => {
                const tc = typeConfig[notif.type]
                return (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                      <tc.icon size={16} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-brand-900">{notif.title}</div>
                          <div className="text-sm text-brand-600 mt-0.5 leading-relaxed">{notif.message}</div>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      </div>
                      <div className="text-xs text-brand-400 mt-1.5">
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
          <h2 className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Earlier</h2>
          <Card padding="none">
            <div className="divide-y divide-brand-50">
              {read.map(notif => {
                const tc = typeConfig[notif.type]
                return (
                  <div key={notif.id} className="flex items-start gap-4 px-5 py-4 opacity-60">
                    <div className={`w-9 h-9 rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                      <tc.icon size={16} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-brand-700">{notif.title}</div>
                      <div className="text-sm text-brand-500 mt-0.5">{notif.message}</div>
                      <div className="text-xs text-brand-400 mt-1.5">
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
        <div className="text-center py-16">
          <Bell size={48} className="text-brand-200 mx-auto mb-3" />
          <p className="text-sm text-brand-500">No notifications yet</p>
        </div>
      )}
    </div>
  )
}
