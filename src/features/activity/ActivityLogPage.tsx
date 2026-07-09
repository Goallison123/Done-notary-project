import { useState } from 'react'
import { Activity, Search, Eye, FileText, User, Folder, Download, Shield } from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import type { ActivityLog } from '@/types'
import { clsx } from 'clsx'

const actionConfig: Record<ActivityLog['action'], { label: string; color: string; bg: string }> = {
  created: { label: 'Created', color: 'text-blue-700', bg: 'bg-blue-100' },
  edited: { label: 'Edited', color: 'text-amber-700', bg: 'bg-amber-100' },
  viewed: { label: 'Viewed', color: 'text-slate-600', bg: 'bg-slate-100' },
  submitted: { label: 'Submitted', color: 'text-teal-700', bg: 'bg-teal-100' },
  downloaded: { label: 'Downloaded', color: 'text-slate-600', bg: 'bg-slate-100' },
  expired: { label: 'Expired', color: 'text-red-700', bg: 'bg-red-100' },
  deleted: { label: 'Deleted', color: 'text-red-700', bg: 'bg-red-100' },
  login: { label: 'Login', color: 'text-slate-600', bg: 'bg-slate-100' },
  archived: { label: 'Archived', color: 'text-slate-600', bg: 'bg-slate-100' },
  called: { label: 'Called', color: 'text-slate-700', bg: 'bg-slate-200' },
}

const entityIcons: Record<ActivityLog['entityType'], React.ElementType> = {
  request: FileText,
  client: User,
  checkin: FileText,
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

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Activity Log</h1>
          <p className="text-sm text-slate-500 mt-1">Complete audit trail of all actions</p>
        </div>
      </div>

      {/* Quick stats */}
      {activityLogs.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activityLogs.slice(0, 4).map(log => {
              const ac = actionConfig[log.action] || actionConfig.viewed
              const Icon = entityIcons[log.entityType] || FileText
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl"
                >
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', ac.bg)}>
                    <Icon size={18} className={ac.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{log.entityName}</div>
                    <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded', ac.bg, ac.color)}>
                      {ac.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, action, entity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Activity list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity size={24} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">No activity found</p>
              {search && <p className="text-xs text-slate-400 mt-1">Try adjusting your search</p>}
            </div>
          ) : (
            filtered.map(log => {
              const ac = actionConfig[log.action] || actionConfig.viewed
              const Icon = entityIcons[log.entityType] || FileText
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', ac.bg)}>
                    <Icon size={18} className={ac.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-lg', ac.bg, ac.color)}>
                        {ac.label}
                      </span>
                      <span className="text-sm text-slate-800 font-semibold truncate">{log.entityName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5">
                      by <span className="font-semibold text-slate-700">{log.userName}</span>
                      {log.ipAddress && (
                        <>
                          {' · '}
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{log.ipAddress}</span>
                        </>
                      )}
                      {' · '}
                      <span className="capitalize">{log.entityType}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleString('en-RW', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {activityLogs.length === 0 && !search && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No activity yet. Actions will appear here as you use the platform.</p>
        </div>
      )}
    </div>
  )
}
