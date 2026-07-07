import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, CheckCircle, Upload, Plus,
  TrendingUp, Clock, ArrowUpRight, Zap,
  Activity, ChevronRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { dashboardStats, weeklyData, categoryDistribution } from '../../data/mockData'
import type { RequestStatus } from '../../types'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

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

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-brand-900 border border-brand-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-brand-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-medium" style={{ color: p.color }}>{p.name}: {p.value}</p>
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
      change: '+8 this month', changeColor: 'text-green-600',
    },
    {
      label: 'Pending Requests', value: pending, icon: Clock,
      color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
      change: 'Awaiting submission', changeColor: 'text-amber-600',
    },
    {
      label: 'Completed', value: completed + dashboardStats.completedRequests, icon: CheckCircle,
      color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
      change: '+12.5% this week', changeColor: 'text-green-600',
    },
    {
      label: 'Docs Uploaded', value: dashboardStats.documentsUploaded, icon: Upload,
      color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100',
      change: '+24 today', changeColor: 'text-green-600',
    },
  ]

  const recentRequests = requests.slice(0, 6)

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-brand-500 mt-0.5">
            {new Date().toLocaleDateString('en-RW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => navigate('/dashboard/requests/new')}>
          New Request
        </Button>
      </div>

      {/* Alert banner if expired requests */}
      {expired > 0 && (
        <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <Zap size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{expired} request{expired !== 1 ? 's' : ''} expired</span> without client submission.{' '}
            <button onClick={() => navigate('/dashboard/requests')} className="underline hover:no-underline">Review &amp; resend</button>
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className={`border ${stat.border} group cursor-default`} hover>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={17} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-400">
                <TrendingUp size={11} className="text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-brand-900 font-mono mb-0.5">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-brand-500">{stat.label}</div>
            <div className={`text-xs mt-1 ${stat.changeColor}`}>{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Charts + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <Card className="lg:col-span-2" padding="lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Weekly Activity
              </h3>
              <p className="text-xs text-brand-500 mt-0.5">Requests created vs completed this week</p>
            </div>
            <Badge variant="success" dot>+{dashboardStats.weeklyGrowth}% growth</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: -10, left: -25 }}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="requests" stroke="#2563EB" fill="url(#reqGrad)"
                strokeWidth={2.5} name="Created" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone" dataKey="completed" stroke="#14B8A6" fill="url(#compGrad)"
                strokeWidth={2.5} name="Completed" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-brand-100">
            <div className="flex items-center gap-2 text-xs text-brand-500">
              <div className="w-3 h-1.5 bg-blue-500 rounded-full" /> Created
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-500">
              <div className="w-3 h-1.5 bg-teal-500 rounded-full" /> Completed
            </div>
          </div>
        </Card>

        {/* Donut + Category Breakdown */}
        <Card padding="lg">
          <h3 className="text-sm font-bold text-brand-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            By Category
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={68}
                paddingAngle={3} dataKey="value"
                startAngle={90} endAngle={-270}
              >
                {categoryDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 10, fontSize: 11, color: '#fff', padding: '8px 12px' }}
                itemStyle={{ color: '#94A3B8' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryDistribution.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-brand-600 truncate max-w-28">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-brand-100" style={{ width: 40 }}>
                    <div className="h-full rounded-full" style={{ width: `${(c.value / 62) * 100}%`, background: c.color }} />
                  </div>
                  <span className="text-xs text-brand-400 font-mono w-6 text-right">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: Recent Requests + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Requests — 3 cols */}
        <Card padding="none" className="lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
            <h3 className="text-sm font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Recent Requests
            </h3>
            <button
              onClick={() => navigate('/dashboard/requests')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-brand-50">
            {recentRequests.map(req => (
              <div
                key={req.id}
                onClick={() => navigate('/dashboard/requests')}
                className="flex items-center gap-4 px-5 py-3 hover:bg-brand-50 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={13} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-800 truncate">{req.clientName}</span>
                    <span className="text-[10px] text-brand-400 font-mono flex-shrink-0">{req.uniqueId}</span>
                  </div>
                  <div className="text-xs text-brand-500 mt-0.5 truncate">{req.categoryName}</div>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={statusVariant(req.status)} className="text-[10px]">
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-brand-50">
            <button
              onClick={() => navigate('/dashboard/requests/new')}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-brand-200 rounded-xl text-xs text-brand-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <Plus size={13} /> Create new request
            </button>
          </div>
        </Card>

        {/* Activity Feed — 2 cols */}
        <Card padding="none" className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
            <h3 className="text-sm font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Activity Feed
            </h3>
            <button
              onClick={() => navigate('/dashboard/activity')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              Full log <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-brand-50 max-h-72 overflow-y-auto">
            {activityLogs.slice(0, 8).map(log => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-brand-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity size={10} className={actionColors[log.action] || 'text-brand-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${actionColors[log.action] || 'text-brand-500'}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-xs text-brand-600 truncate">{log.entityName}</p>
                  <p className="text-[10px] text-brand-400">by {log.userName}</p>
                </div>
                <span className="text-[10px] text-brand-300 flex-shrink-0 mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Today's Requests", value: dashboardStats.todayRequests, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Submissions Rate', value: '67%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg. Response Time', value: '4.2h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(item => (
          <div key={item.label} className={`flex items-center gap-4 p-4 ${item.bg} rounded-2xl border border-white/50`}>
            <div className={`p-2 bg-white rounded-xl shadow-sm ${item.color}`}>
              <item.icon size={18} />
            </div>
            <div>
              <div className="text-xl font-extrabold text-brand-900 font-mono">{item.value}</div>
              <div className="text-xs text-brand-500">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
