import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, FileText, Copy, RefreshCw,
  Clock, CheckCircle, XCircle, AlertCircle, Eye,
  Filter,
} from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import type { RequestStatus } from '../../types'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const statusConfig: Record<RequestStatus, { variant: 'success' | 'pending' | 'danger' | 'info' | 'muted'; icon: React.ElementType; label: string; dotColor: string }> = {
  pending: { variant: 'pending', icon: Clock, label: 'Pending', dotColor: 'bg-amber-400' },
  submitted: { variant: 'success', icon: CheckCircle, label: 'Submitted', dotColor: 'bg-green-500' },
  reviewed: { variant: 'info', icon: CheckCircle, label: 'Reviewed', dotColor: 'bg-blue-500' },
  expired: { variant: 'danger', icon: XCircle, label: 'Expired', dotColor: 'bg-red-500' },
  rejected: { variant: 'danger', icon: AlertCircle, label: 'Rejected', dotColor: 'bg-red-500' },
}

export default function RequestsPage() {
  const { requests } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = requests.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.clientName?.toLowerCase().includes(q) ||
      r.uniqueId.toLowerCase().includes(q) ||
      r.categoryName.toLowerCase().includes(q) ||
      r.clientPhone.includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    submitted: requests.filter(r => r.status === 'submitted').length,
    reviewed: requests.filter(r => r.status === 'reviewed').length,
    expired: requests.filter(r => r.status === 'expired').length,
  }

  const copyLink = (token: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/submit/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Requests</h1>
          <p className="text-sm text-brand-500 mt-0.5">{requests.length} total · {statusCounts.pending} pending</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => navigate('/dashboard/requests/new')}>
          New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-brand-100 p-1 rounded-xl w-fit flex-shrink-0 overflow-x-auto">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500 hover:text-brand-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
              <span className={statusFilter === status ? 'text-brand-400' : 'text-brand-300'}>{count}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by client, ID, phone, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<Search size={14} />}
          />
        </div>
        <button className="flex items-center gap-2 px-3 h-10 border border-brand-200 rounded-lg text-sm text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50/50">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-brand-400 uppercase tracking-wide">Request</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-brand-400 uppercase tracking-wide hidden md:table-cell">Client</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-brand-400 uppercase tracking-wide hidden lg:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-brand-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-brand-400 uppercase tracking-wide hidden md:table-cell">Expires</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-brand-400 uppercase tracking-wide">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {filtered.map(req => {
                const sc = statusConfig[req.status]
                const isExpiring = req.status === 'pending' && new Date(req.expiresAt) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                return (
                  <tr key={req.id} className="hover:bg-brand-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={13} className="text-brand-500" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-brand-800 font-mono">{req.uniqueId}</div>
                          <div className="text-[10px] text-brand-400 hidden sm:block">{req.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="text-sm font-medium text-brand-700">{req.clientName || '—'}</div>
                      <div className="text-xs text-brand-400 font-mono">{req.clientPhone}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-brand-600">{req.categoryName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dotColor}`} />
                        <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`text-xs font-mono ${isExpiring ? 'text-red-500 font-bold' : 'text-brand-400'}`}>
                        {isExpiring && '⚠ '}
                        {new Date(req.expiresAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-brand-400">
                        {new Date(req.createdAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="View submission"
                          onClick={() => window.open(`/submit/${req.token}`, '_blank')}
                          className="p-1.5 rounded-lg text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title={copied === req.token ? 'Copied!' : 'Copy link'}
                          onClick={e => copyLink(req.token, e)}
                          className={`p-1.5 rounded-lg transition-colors ${copied === req.token ? 'text-green-600 bg-green-50' : 'text-brand-400 hover:bg-brand-100 hover:text-brand-700'}`}
                        >
                          {copied === req.token ? <CheckCircle size={14} /> : <Copy size={14} />}
                        </button>
                        {req.status === 'expired' && (
                          <button title="Resend" className="p-1.5 rounded-lg text-brand-400 hover:bg-brand-100 hover:text-amber-600 transition-colors">
                            <RefreshCw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-14">
              <FileText size={36} className="text-brand-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-brand-600 mb-1">No requests found</p>
              <p className="text-xs text-brand-400 mb-4">
                {search ? `No results for "${search}"` : 'Create your first request to get started'}
              </p>
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => navigate('/dashboard/requests/new')}>
                New Request
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
