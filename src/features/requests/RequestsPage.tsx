import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, FileText, Copy, RefreshCw,
  Clock, CheckCircle, XCircle, AlertCircle, Eye,
  Filter, ChevronRight,
} from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import type { RequestStatus } from '@/types'
import Button from '@/shared/ui/Button'
import Badge from '@/shared/ui/Badge'
import Input from '@/shared/ui/Input'
import Card from '@/shared/ui/Card'

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

  const recentRequests = requests.slice(0, 4)

  const copyLink = (token: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/submit/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Requests</h1>
          <p className="text-sm text-brand-500 mt-1">{requests.length} total requests · {statusCounts.pending} awaiting submission</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => navigate('/dashboard/requests/new')} size="lg">
          New Request
        </Button>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentRequests.map(req => {
          const sc = statusConfig[req.status]
          return (
            <button
              key={req.id}
              className="flex items-center gap-4 p-5 bg-white border border-brand-100 rounded-2xl hover:border-brand-200 hover:shadow-lg transition-all group text-left"
            >
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${sc.dotColor}`} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-brand-800 truncate">{req.clientName}</div>
                <div className="text-xs text-brand-500 font-mono mt-0.5">{req.uniqueId}</div>
              </div>
              <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1.5 bg-white border border-brand-100 p-1.5 rounded-xl w-fit flex-shrink-0 overflow-x-auto shadow-sm">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                statusFilter === status ? 'bg-brand-900 text-white shadow-md' : 'text-brand-500 hover:text-brand-700 hover:bg-brand-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
              <span className={`ml-1 ${statusFilter === status ? 'text-brand-300' : 'text-brand-400'}`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-lg">
          <Input
            placeholder="Search by client name, ID, phone, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<Search size={16} />}
            className="text-sm"
          />
        </div>
        <Button variant="outline" icon={<Filter size={16} />}>
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card padding="none" className="bg-white border border-brand-100 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white">
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Request</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider hidden md:table-cell">Expires</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {filtered.map(req => {
                const sc = statusConfig[req.status]
                const isExpiring = req.status === 'pending' && new Date(req.expiresAt) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                return (
                  <tr key={req.id} className="hover:bg-brand-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <FileText size={16} className="text-brand-500" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-800 font-mono">{req.uniqueId}</div>
                          <div className="text-xs text-brand-400 hidden sm:block">{req.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-sm font-semibold text-brand-700">{req.clientName || '—'}</div>
                      <div className="text-xs text-brand-400 font-mono mt-0.5">{req.clientPhone}</div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">{req.categoryName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dotColor}`} />
                        <Badge variant={sc.variant} className="text-[11px] px-2.5 py-1">{sc.label}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`text-sm font-medium ${isExpiring ? 'text-red-500' : 'text-brand-500'}`}>
                        {isExpiring && <span className="text-red-500 mr-1">!</span>}
                        {new Date(req.expiresAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-brand-500">
                        {new Date(req.createdAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="View submission"
                          onClick={() => window.open(`/submit/${req.token}`, '_blank')}
                          className="p-2 rounded-lg text-brand-400 hover:bg-brand-100 hover:text-brand-700 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title={copied === req.token ? 'Copied!' : 'Copy link'}
                          onClick={e => copyLink(req.token, e)}
                          className={`p-2 rounded-lg transition-colors ${copied === req.token ? 'text-green-600 bg-green-50' : 'text-brand-400 hover:bg-brand-100 hover:text-brand-700'}`}
                        >
                          {copied === req.token ? <CheckCircle size={15} /> : <Copy size={15} />}
                        </button>
                        {req.status === 'expired' && (
                          <button title="Resend" className="p-2 rounded-lg text-brand-400 hover:bg-brand-100 hover:text-amber-600 transition-colors">
                            <RefreshCw size={15} />
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
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-brand-300" />
              </div>
              <p className="text-base font-semibold text-brand-600 mb-1">No requests found</p>
              <p className="text-sm text-brand-400 mb-6">
                {search ? `No results for "${search}"` : 'Create your first request to get started'}
              </p>
              <Button variant="primary" size="lg" icon={<Plus size={16} />} onClick={() => navigate('/dashboard/requests/new')}>
                New Request
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
