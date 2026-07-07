import { useState } from 'react'
import { Activity, Search, Shield, Eye, FileText, User, Folder, Download, Filter } from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import type { ActivityLog } from '@/types'
import Input from '@/shared/ui/Input'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import Button from '@/shared/ui/Button'

const actionConfig: Record<ActivityLog['action'], { label: string; color: string; bg: string }> = {
  created: { label: 'Created', color: 'text-blue-700', bg: 'bg-blue-100' },
  edited: { label: 'Edited', color: 'text-amber-700', bg: 'bg-amber-100' },
  viewed: { label: 'Viewed', color: 'text-brand-600', bg: 'bg-brand-100' },
  submitted: { label: 'Submitted', color: 'text-green-700', bg: 'bg-green-100' },
  downloaded: { label: 'Downloaded', color: 'text-teal-700', bg: 'bg-teal-100' },
  expired: { label: 'Expired', color: 'text-red-700', bg: 'bg-red-100' },
  deleted: { label: 'Deleted', color: 'text-red-700', bg: 'bg-red-100' },
  login: { label: 'Login', color: 'text-brand-600', bg: 'bg-brand-100' },
}

const entityIcons: Record<ActivityLog['entityType'], React.ElementType> = {
  request: FileText,
  client: User,
  category: Folder,
  document: Download,
  user: Shield,
  organization: Shield,
}

export default function ActivityLogPage() {
  const { activityLogs } = useApp()
  const [search, setSearch] = useState('')

  const filtered = activityLogs.filter(log =>
    log.entityName.toLowerCase().includes(search.toLowerCase()) ||
    log.userName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.includes(search.toLowerCase())
  )

  const recentActions = activityLogs.slice(0, 4)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Activity Log</h1>
          <p className="text-sm text-brand-500 mt-1">Complete audit trail of all actions performed</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentActions.map(log => {
          const ac = actionConfig[log.action]
          const Icon = entityIcons[log.entityType]
          return (
            <div
              key={log.id}
              className="flex items-center gap-3 p-4 bg-white border border-brand-100 rounded-xl hover:border-brand-200 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${ac.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={ac.color} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-brand-800 truncate">{log.entityName}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${ac.bg} ${ac.color}`}>
                  {ac.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by user, action, entity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<Search size={16} />}
          />
        </div>
        <Button variant="outline" icon={<Filter size={16} />}>
          Filter
        </Button>
      </div>

      <Card padding="none" className="bg-white border border-brand-100 overflow-hidden rounded-2xl">
        <div className="divide-y divide-brand-50">
          {filtered.map(log => {
            const ac = actionConfig[log.action]
            const Icon = entityIcons[log.entityType]
            return (
              <div key={log.id} className="flex items-start gap-4 px-6 py-5 hover:bg-brand-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${ac.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon size={18} className={ac.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${ac.bg} ${ac.color}`}>
                      {ac.label}
                    </span>
                    <span className="text-sm text-brand-700 font-semibold truncate">{log.entityName}</span>
                  </div>
                  <div className="text-xs text-brand-500 mt-1.5">
                    by <span className="font-semibold text-brand-700">{log.userName}</span>
                    {' · '}
                    <span className="font-mono bg-brand-50 px-1.5 py-0.5 rounded">{log.ipAddress}</span>
                    {' · '}
                    <span className="capitalize">{log.entityType}</span>
                  </div>
                </div>
                <div className="text-xs text-brand-400 whitespace-nowrap flex-shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleString('en-RW', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity size={28} className="text-brand-300" />
            </div>
            <p className="text-sm font-semibold text-brand-600">No activity found</p>
            <p className="text-xs text-brand-400 mt-1">Try adjusting your search terms</p>
          </div>
        )}
      </Card>
    </div>
  )
}
