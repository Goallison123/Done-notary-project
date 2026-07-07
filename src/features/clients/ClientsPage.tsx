import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Phone, Mail, FileText, ChevronRight, Filter, Sparkles } from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import Input from '@/shared/ui/Input'
import Badge from '@/shared/ui/Badge'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'

export default function ClientsPage() {
  const { clients, requests } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.nationalId?.includes(search)
  )

  const recentClients = clients.slice(0, 4)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clients</h1>
          <p className="text-sm text-brand-500 mt-1">{clients.length} total records in your database</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentClients.map(client => {
          const clientReqs = requests.filter(r => r.clientId === client.id)
          return (
            <button
              key={client.id}
              onClick={() => navigate(`/dashboard/clients/${client.id}`)}
              className="flex items-center gap-4 p-5 bg-white border border-brand-100 rounded-2xl hover:border-brand-200 hover:shadow-lg transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-500/20">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-brand-800 truncate">{client.name}</div>
                <div className="text-xs text-brand-500 mt-0.5">{clientReqs.length} requests</div>
              </div>
              <ChevronRight size={16} className="text-brand-300 group-hover:text-brand-600 transition-colors" />
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-lg">
          <Input
            placeholder="Search by name, phone, ID, or email..."
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
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider hidden lg:table-cell">National ID</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider hidden md:table-cell">Requests</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-brand-500 uppercase tracking-wider hidden lg:table-cell">Last Activity</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {filtered.map(client => {
                const clientReqs = requests.filter(r => r.clientId === client.id)
                return (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                    className="hover:bg-brand-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 shadow-sm">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-brand-800">{client.name}</div>
                          <div className="text-xs text-brand-400 md:hidden mt-0.5">{client.phone}</div>
                          {client.email && <div className="text-xs text-brand-400 hidden md:block">{client.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-brand-400" />
                        <span className="text-sm text-brand-600 font-mono">{client.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <span className="text-sm text-brand-500 font-mono bg-brand-50 px-2 py-1 rounded">{client.nationalId || '—'}</span>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                          <FileText size={13} className="text-brand-500" />
                        </div>
                        <span className="text-sm font-semibold text-brand-700">{clientReqs.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <span className="text-sm text-brand-500">
                        {client.lastActivity
                          ? new Date(client.lastActivity).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <ChevronRight size={18} className="text-brand-300 group-hover:text-brand-600 transition-colors" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-brand-300" />
              </div>
              <p className="text-sm text-brand-500 mb-1">No clients found matching</p>
              <p className="text-sm font-semibold text-brand-700">&quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
