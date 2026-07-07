import { useState } from 'react'
import { Activity, Search, Shield, Eye, FileText, User, Folder, Download } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import type { ActivityLog } from '../../types'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Activity Log</h1>
          <p className="text-sm text-brand-500 mt-0.5">Complete audit trail of all actions performed</p>
        </div>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search by user, action, entity..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          prefix={<Search size={14} />}
        />
      </div>

      <Card padding="none">
        <div className="divide-y divide-brand-50">
          {filtered.map(log => {
            const ac = actionConfig[log.action]
            const Icon = entityIcons[log.entityType]
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-brand-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${ac.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={14} className={ac.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ac.bg} ${ac.color}`}>
                      {ac.label}
                    </span>
                    <span className="text-sm text-brand-700 font-medium truncate">{log.entityName}</span>
                  </div>
                  <div className="text-xs text-brand-500 mt-1">
                    by <span className="font-medium text-brand-700">{log.userName}</span>
                    {' · '}
                    <span className="font-mono">{log.ipAddress}</span>
                    {' · '}
                    {log.entityType}
                  </div>
                </div>
                <div className="text-xs text-brand-400 whitespace-nowrap flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-RW', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Activity size={36} className="text-brand-200 mx-auto mb-3" />
            <p className="text-sm text-brand-500">No activity found</p>
          </div>
        )}
      </Card>
    </div>
  )
}
