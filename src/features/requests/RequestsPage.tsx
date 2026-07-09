import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, FileText, ChevronRight, Clock, CheckCircle, XCircle,
  User, Phone, MapPin, Calendar, Archive,
} from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import { clsx } from 'clsx'
import type { CheckIn } from '@/types'

const statusConfig: Record<CheckIn['status'], { label: string; bg: string; text: string }> = {
  in_progress: { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-700' },
  submitted: { label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-700' },
  signed: { label: 'Signed', bg: 'bg-teal-100', text: 'text-teal-700' },
  ready: { label: 'Ready', bg: 'bg-green-100', text: 'text-green-700' },
  called: { label: 'Called', bg: 'bg-slate-700', text: 'text-white' },
  archived: { label: 'Archived', bg: 'bg-slate-100', text: 'text-slate-600' },
}

export default function RecordsPage() {
  const { checkIns } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = checkIns.filter(ci => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      ci.client_name?.toLowerCase().includes(q) ||
      ci.client_phone?.includes(q) ||
      ci.client_national_id?.includes(q) ||
      ci.service_type_name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || ci.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = {
    all: checkIns.length,
    in_progress: checkIns.filter(ci => ci.status === 'in_progress').length,
    submitted: checkIns.filter(ci => ci.status === 'submitted').length,
    ready: checkIns.filter(ci => ci.status === 'ready').length,
    archived: checkIns.filter(ci => ci.status === 'archived').length,
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Records</h1>
          <p className="text-sm text-slate-500 mt-1">{checkIns.length} total check-in records</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={clsx(
              'px-4 py-3 rounded-xl text-center transition-all border',
              statusFilter === status
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="text-xl font-bold">{count}</div>
            <div className="text-xs font-medium mt-0.5 capitalize">{status === 'all' ? 'All' : status.replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Queue #</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Service</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Time</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileText size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">No records found</p>
                    {search && <p className="text-xs text-slate-400 mt-1">Try a different search term</p>}
                  </td>
                </tr>
              ) : (
                filtered.map(checkIn => {
                  const sc = statusConfig[checkIn.status]
                  return (
                    <tr key={checkIn.id} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {String(checkIn.sequence_number || 0).padStart(2, '0')}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {checkIn.client_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-800">{checkIn.client_name || 'Unknown'}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{checkIn.client_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-slate-600">{checkIn.service_type_name || '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          {checkIn.location_sector && (
                            <>
                              <MapPin size={12} />
                              <span>{checkIn.location_sector}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold', sc.bg, sc.text)}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-slate-500">
                          {checkIn.check_in_time
                            ? new Date(checkIn.check_in_time).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {checkIns.length === 0 && !search && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No records yet. Records will appear here after client check-ins.</p>
        </div>
      )}
    </div>
  )
}
