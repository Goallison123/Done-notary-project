import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, CheckCircle, Clock, QrCode, Activity, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import { useApp } from '@/shared/context/AppContext'
import type { CheckInToken } from '@/types'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import QuickIntake from './QuickIntake'

const statusColors: Record<string, { text: string; bg: string }> = {
  in_progress: { text: 'text-amber-600', bg: 'bg-amber-100' },
  submitted: { text: 'text-blue-600', bg: 'bg-blue-100' },
  signed: { text: 'text-teal-600', bg: 'bg-teal-100' },
  ready: { text: 'text-green-600', bg: 'bg-green-100' },
  called: { text: 'text-violet-600', bg: 'bg-violet-100' },
  archived: { text: 'text-slate-500', bg: 'bg-slate-100' },
}

const actionColors: Record<string, string> = {
  submitted: 'text-green-600', created: 'text-blue-600', viewed: 'text-slate-500',
  edited: 'text-amber-600', login: 'text-slate-400',
}
const actionBg: Record<string, string> = {
  submitted: 'bg-green-100', created: 'bg-blue-100', viewed: 'bg-slate-100',
  edited: 'bg-amber-100', login: 'bg-slate-100',
}

export default function DashboardPage() {
  const { user, org } = useAuth()
  const { clients, checkIns, activityLogs, serviceTypes, loading } = useApp()
  const navigate = useNavigate()
  const [showQuickIntake, setShowQuickIntake] = useState(false)

  const handleTokenCreated = (token: CheckInToken) => {
    console.log('Token created:', token.token)
  }

  const today = new Date().toDateString()
  const todayCheckIns = checkIns.filter(c => new Date(c.created_at).toDateString() === today)
  const submittedCount = checkIns.filter(c => ['submitted', 'signed', 'ready', 'archived'].includes(c.status)).length
  const waitingCount = checkIns.filter(c => c.status === 'in_progress').length

  const stats = [
    {
      label: 'Total Clients', value: clients.length, icon: Users,
      color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    },
    {
      label: 'In Queue', value: waitingCount, icon: Clock,
      color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
    },
    {
      label: 'Completed Today', value: todayCheckIns.filter(c => c.status !== 'in_progress').length, icon: CheckCircle,
      color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
    },
    {
      label: 'Total Check-Ins', value: checkIns.length, icon: FileText,
      color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100',
    },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('en-RW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<QrCode size={16} />}
            onClick={() => setShowQuickIntake(true)}
            size="lg"
          >
            Quick Check-In
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(stat => (
          <Card key={stat.label} className={`border ${stat.border} bg-white`} padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} shadow-sm`}>
                <stat.icon size={20} className={stat.color} strokeWidth={2} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Check-Ins */}
        <Card padding="none" className="lg:col-span-3 bg-white border border-slate-100 overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Check-Ins
            </h3>
            <button
              onClick={() => navigate('/dashboard/requests')}
              className="text-xs px-3 py-1.5 text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {checkIns.slice(0, 6).map(checkIn => {
              const service = serviceTypes.find(s => s.id === checkIn.service_type_id)
              return (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs font-bold text-slate-600">#{checkIn.sequence_number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-slate-800 truncate">{checkIn.client_name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      {service?.name || 'General'} • {new Date(checkIn.created_at).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[checkIn.status]?.bg || 'bg-slate-100'} ${statusColors[checkIn.status]?.text || 'text-slate-600'}`}>
                      {checkIn.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })}
            {checkIns.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No check-ins yet</p>
                <p className="text-xs mt-1">Click "Quick Check-In" to get started</p>
              </div>
            )}
          </div>
        </Card>

        {/* Activity Feed */}
        <Card padding="none" className="lg:col-span-2 bg-white border border-slate-100 overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Activity Feed</h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {activityLogs.slice(0, 8).map(log => (
              <div key={log.id} className="flex items-start gap-3.5 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${actionBg[log.action] || 'bg-slate-100'}`}>
                  <Activity size={14} className={actionColors[log.action] || 'text-slate-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${actionColors[log.action] || 'text-slate-500'}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium truncate mt-0.5">{log.entityName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">by {log.userName}</p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex items-center gap-5 p-5 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{todayCheckIns.length}</div>
            <div className="text-sm text-slate-600 font-medium">Today's Check-Ins</div>
          </div>
        </div>
        <div className="flex items-center gap-5 p-5 bg-green-50 rounded-2xl border border-green-100">
          <div className="p-3 bg-white rounded-xl shadow-sm text-green-600">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{submittedCount}</div>
            <div className="text-sm text-slate-600 font-medium">Completed</div>
          </div>
        </div>
        <div className="flex items-center gap-5 p-5 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="p-3 bg-white rounded-xl shadow-sm text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{waitingCount}</div>
            <div className="text-sm text-slate-600 font-medium">In Queue</div>
          </div>
        </div>
      </div>

      {/* Quick Check-In Modal */}
      <QuickIntake
        isOpen={showQuickIntake}
        onClose={() => setShowQuickIntake(false)}
        organizationId={org?.id || ''}
        userId={user?.id || ''}
        onTokenCreated={handleTokenCreated}
      />
    </div>
  )
}
