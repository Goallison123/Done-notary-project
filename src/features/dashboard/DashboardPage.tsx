import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, CheckCircle, Upload, Plus,
  TrendingUp, Clock, ArrowUpRight, Zap, ArrowRight,
  Activity, ChevronRight, Sparkles,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useAuth } from '@/shared/context/AuthContext'
import { useApp } from '@/shared/context/AppContext'
import { dashboardStats, weeklyData, categoryDistribution } from '@/data/mockData'
import type { RequestStatus } from '@/types'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import Button from '@/shared/ui/Button'

const statusVariant = (status: RequestStatus) => {
  if (status === 'submitted' || status === 'reviewed') return 'success' as const
  if (status === 'pending') return 'pending' as const
  if (status === 'expired') return 'danger' as const
  return 'muted' as const
}

const actionColors: Record<string, string> = {
  submitted: 'text-green-600',
  created: 'text-blue-600',
  viewed: 'text-brand-500',
  edited: 'text-amber-600',
  login: 'text-brand-400',
  expired: 'text-red-500',
  deleted: 'text-red-600',
  downloaded: 'text-teal-600',
}

const actionBg: Record<string, string> = {
  submitted: 'bg-green-100',
  created: 'bg-blue-100',
  viewed: 'bg-brand-100',
  edited: 'bg-amber-100',
  login: 'bg-brand-100',
  expired: 'bg-red-100',
  deleted: 'bg-red-100',
  downloaded: 'bg-teal-100',
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-brand-900 border border-brand-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="text-brand-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { requests, activityLogs } = useApp()
  const navigate = useNavigate()

  const pending = requests.filter(r => r.status === 'pending').length
  const completed = requests.filter(r => r.status === 'submitted' || r.status === 'reviewed').length
  const expired = requests.filter(r => r.status === 'expired').length

  const stats = [
    {
      label: 'Total Clients', value: dashboardStats.totalClients, icon: Users,
      color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
      change: '+8 this month', changeColor: 'text-green-600', trend: 'up',
    },
    {
      label: 'Pending Requests', value: pending, icon: Clock,
      color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
      change: 'Awaiting submission', changeColor: 'text-amber-600', trend: 'neutral',
    },
    {
      label: 'Completed', value: completed + dashboardStats.completedRequests, icon: CheckCircle,
      color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
      change: '+12.5% this week', changeColor: 'text-green-600', trend: 'up',
    },
    {
      label: 'Docs Uploaded', value: dashboardStats.documentsUploaded, icon: Upload,
      color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100',
      change: '+24 today', changeColor: 'text-green-600', trend: 'up',
    },
  ]

  const recentRequests = requests.slice(0, 6)
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-brand-500 mt-1">
            {new Date().toLocaleDateString('en-RW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => navigate('/dashboard/requests/new')} size="lg">
          New Request
        </Button>
      </div>

      {/* Alert banner if expired requests */}
      {expired > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <Zap size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-amber-800 font-medium">
              <span className="font-bold">{expired} request{expired !== 1 ? 's' : ''} expired</span> without client submission
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Review and resend the secure links to your clients</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/requests')}
            className="text-sm text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1.5 hover:underline"
          >
            Review <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(stat => (
          <Card key={stat.label} className={`border ${stat.border} bg-white group cursor-default`} hover padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} shadow-sm`}>
                <stat.icon size={20} className={stat.color} strokeWidth={2} />
              </div>
              {stat.trend === 'up' && (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">
                  <TrendingUp size={12} />
                </div>
              )}
            </div>
            <div className="text-3xl font-extrabold text-brand-900 font-mono tracking-tight mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-brand-600 font-medium">{stat.label}</div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-brand-100">
              <div className={`text-xs font-medium ${stat.changeColor}`}>{stat.change}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <Card className="lg:col-span-2 bg-white border border-brand-100" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Weekly Activity
              </h3>
              <p className="text-xs text-brand-500 mt-1">Requests created vs completed this week</p>
            </div>
            <Badge variant="success" dot className="font-semibold">+{dashboardStats.weeklyGrowth}% growth</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, bottom: -10, left: -25 }}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="requests" stroke="#2563EB" fill="url(#reqGrad)"
                strokeWidth={3} name="Created" dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Area
                type="monotone" dataKey="completed" stroke="#14B8A6" fill="url(#compGrad)"
                strokeWidth={3} name="Completed" dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-brand-100">
            <div className="flex items-center gap-2.5 text-sm text-brand-600">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" /> Created
            </div>
            <div className="flex items-center gap-2.5 text-sm text-brand-600">
              <div className="w-3 h-3 bg-teal-500 rounded-sm" /> Completed
            </div>
          </div>
        </Card>

        {/* Donut + Category Breakdown */}
        <Card padding="lg" className="bg-white border border-brand-100">
          <h3 className="text-base font-bold text-brand-900 mb-5 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            By Category
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={75}
                paddingAngle={3} dataKey="value"
                startAngle={90} endAngle={-270}
              >
                {categoryDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff', padding: '10px 14px' }}
                itemStyle={{ color: '#94A3B8' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {categoryDistribution.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-md flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-sm text-brand-600 truncate max-w-28">{c.name}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-2 rounded-full bg-brand-100" style={{ width: 48 }}>
                    <div className="h-full rounded-full" style={{ width: `${(c.value / 62) * 100}%`, background: c.color }} />
                  </div>
                  <span className="text-xs text-brand-500 font-mono w-6 text-right font-medium">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: Recent Requests + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Requests — 3 cols */}
        <Card padding="none" className="lg:col-span-3 bg-white border border-brand-100 overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white">
            <h3 className="text-base font-bold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Recent Requests
            </h3>
            <button
              onClick={() => navigate('/dashboard/requests')}
              className="text-xs px-3 py-1.5 text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-brand-50">
            {recentRequests.map(req => (
              <div
                key={req.id}
                onClick={() => navigate('/dashboard/requests')}
                className="flex items-center gap-4 px-6 py-4 hover:bg-brand-50 cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText size={16} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-brand-800 truncate">{req.clientName}</span>
                    <span className="text-[11px] text-brand-400 font-mono flex-shrink-0 bg-brand-50 px-2 py-0.5 rounded">{req.uniqueId}</span>
                  </div>
                  <div className="text-xs text-brand-500 mt-1 truncate">{req.categoryName}</div>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={statusVariant(req.status)} className="text-[11px] px-2.5 py-1">
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-brand-100 bg-brand-50/50">
            <button
              onClick={() => navigate('/dashboard/requests/new')}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-200 rounded-xl text-sm text-brand-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium"
            >
              <Plus size={16} /> Create new request
            </button>
          </div>
        </Card>

        {/* Activity Feed — 2 cols */}
        <Card padding="none" className="lg:col-span-2 bg-white border border-brand-100 overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white">
            <h3 className="text-base font-bold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Activity Feed
            </h3>
            <button
              onClick={() => navigate('/dashboard/activity')}
              className="text-xs px-3 py-1.5 text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              Full log <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-brand-50 max-h-80 overflow-y-auto">
            {activityLogs.slice(0, 8).map(log => (
              <div key={log.id} className="flex items-start gap-3.5 px-6 py-4 hover:bg-brand-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${actionBg[log.action] || 'bg-brand-100'}`}>
                  <Activity size={14} className={actionColors[log.action] || 'text-brand-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${actionColors[log.action] || 'text-brand-500'}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm text-brand-700 font-medium truncate mt-0.5">{log.entityName}</p>
                  <p className="text-xs text-brand-400 mt-0.5">by {log.userName}</p>
                </div>
                <span className="text-[11px] text-brand-400 flex-shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Today's Requests", value: dashboardStats.todayRequests, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Submissions Rate', value: '67%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Avg. Response Time', value: '4.2h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        ].map(item => (
          <div key={item.label} className={`flex items-center gap-5 p-5 ${item.bg} rounded-2xl border ${item.border}`}>
            <div className={`p-3 bg-white rounded-xl shadow-sm ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-brand-900 font-mono tracking-tight">{item.value}</div>
              <div className="text-sm text-brand-600 font-medium">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
