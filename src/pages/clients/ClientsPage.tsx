import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Phone, Mail, FileText, ChevronRight, Filter } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clients</h1>
          <p className="text-sm text-brand-500 mt-0.5">{clients.length} total records</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by name, phone, ID, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<Search size={14} />}
          />
        </div>
        <button className="flex items-center gap-2 px-3 h-10 border border-brand-200 rounded-lg text-sm text-brand-600 hover:bg-brand-50">
          <Filter size={14} />
          Filter
        </button>
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-500 uppercase tracking-wide hidden lg:table-cell">National ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-500 uppercase tracking-wide hidden md:table-cell">Requests</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-500 uppercase tracking-wide hidden lg:table-cell">Last Activity</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {filtered.map(client => {
                const clientReqs = requests.filter(r => r.clientId === client.id)
                return (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                    className="hover:bg-brand-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-brand-800">{client.name}</div>
                          <div className="text-xs text-brand-400 md:hidden">{client.phone}</div>
                          {client.email && <div className="text-xs text-brand-400 hidden md:block">{client.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-brand-600 font-mono">{client.phone}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-brand-500 font-mono">{client.nationalId || '—'}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="text-brand-400" />
                        <span className="text-sm text-brand-600">{clientReqs.length}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-brand-400">
                        {client.lastActivity
                          ? new Date(client.lastActivity).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight size={16} className="text-brand-300" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={36} className="text-brand-200 mx-auto mb-3" />
              <p className="text-sm text-brand-500">No clients found matching &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
