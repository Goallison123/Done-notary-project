import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Phone, Mail, FileText, ChevronRight, UserPlus } from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import { clsx } from 'clsx'

export default function ClientsPage() {
  const { clients, checkIns } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.nationalId?.includes(search)
  )

  // Get recent clients with their check-in counts
  const clientsWithCheckIns = clients.map(c => ({
    ...c,
    checkInCount: checkIns.filter(ci => ci.client_phone === c.phone || ci.client_name === c.name).length,
    lastCheckIn: checkIns.find(ci => ci.client_phone === c.phone || ci.client_name === c.name)?.created_at
  }))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-sm text-slate-500 mt-1">{clients.length} total client records</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/clients/new')}
          className="flex items-center gap-2 h-10 px-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Add Client</span>
        </button>
      </div>

      {/* Quick access - Recent clients */}
      {clientsWithCheckIns.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Clients</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {clientsWithCheckIns.slice(0, 4).map(client => (
              <button
                key={client.id}
                onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800 truncate">{client.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{client.checkInCount} check-ins</div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

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
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">National ID</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Check-ins</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Visit</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">No clients found</p>
                    {search && <p className="text-xs text-slate-400 mt-1">Try a different search term</p>}
                  </td>
                </tr>
              ) : (
                filtered.map(client => {
                  const clientCheckIns = checkIns.filter(ci => ci.client_phone === client.phone || ci.client_name === client.name)
                  const lastVisit = clientCheckIns[0]?.created_at
                  return (
                    <tr
                      key={client.id}
                      onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-800">{client.name}</div>
                            {client.email && <div className="text-xs text-slate-400 hidden md:block">{client.email}</div>}
                            <div className="text-xs text-slate-400 md:hidden mt-0.5">{client.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400" />
                          <span className="text-sm text-slate-600 font-mono">{client.phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {client.nationalId ? (
                          <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded-md">{client.nationalId}</span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm font-semibold text-slate-700">{clientCheckIns.length}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-slate-500">
                          {lastVisit
                            ? new Date(lastVisit).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })
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

      {clients.length === 0 && !search && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No clients yet. Clients will appear here after check-ins.</p>
        </div>
      )}
    </div>
  )
}
