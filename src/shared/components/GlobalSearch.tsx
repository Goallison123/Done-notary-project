import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, FileText, FolderOpen, ArrowRight, Clock, X, Keyboard } from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import { clsx } from 'clsx'

interface SearchResult {
  id: string
  type: 'client' | 'request' | 'category'
  title: string
  subtitle: string
  href: string
  icon: React.ElementType
  color: string
  bg: string
}

function useGlobalSearch() {
  const { clients, requests, categories } = useApp()

  const search = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const results: SearchResult[] = []

    clients.forEach(c => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.nationalId?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      ) {
        results.push({
          id: c.id, type: 'client',
          title: c.name,
          subtitle: `${c.phone}${c.nationalId ? ' · ' + c.nationalId : ''}`,
          href: `/dashboard/clients/${c.id}`,
          icon: Users, color: 'text-blue-600', bg: 'bg-blue-50',
        })
      }
    })

    requests.forEach(r => {
      if (
        r.uniqueId.toLowerCase().includes(q) ||
        r.clientName?.toLowerCase().includes(q) ||
        r.categoryName.toLowerCase().includes(q) ||
        r.clientPhone.includes(q)
      ) {
        results.push({
          id: r.id, type: 'request',
          title: `${r.uniqueId} · ${r.categoryName}`,
          subtitle: `${r.clientName || r.clientPhone} · ${r.status}`,
          href: '/dashboard/requests',
          icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50',
        })
      }
    })

    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q)) {
        results.push({
          id: cat.id, type: 'category',
          title: cat.name,
          subtitle: `${cat.fields.length} fields · ${cat.requestCount || 0} requests`,
          href: `/dashboard/categories/${cat.id}/edit`,
          icon: FolderOpen, color: 'text-violet-600', bg: 'bg-violet-50',
        })
      }
    })

    return results.slice(0, 8)
  }, [clients, requests, categories])

  return search
}

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

const recentSearches = ['Property Transfer', 'Nkurunziza', '+250 788', 'REQ-2024-001']

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const search = useGlobalSearch()
  const results = search(query)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) {
        navigate(results[selected].href)
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, selected, navigate, onClose])

  const goTo = (href: string) => {
    navigate(href)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-brand-900/30 border border-brand-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-brand-100">
          <Search size={18} className="text-brand-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search clients, requests, categories..."
            className="flex-1 text-sm text-brand-900 placeholder:text-brand-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-0.5 rounded text-brand-400 hover:text-brand-600">
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-brand-100 text-brand-400 px-1.5 py-0.5 rounded border border-brand-200">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query === '' ? (
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">
                <Clock size={11} /> Recent searches
              </div>
              <div className="space-y-1">
                {recentSearches.map(s => (
                  <button key={s} onClick={() => setQuery(s)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-brand-50 transition-colors group">
                    <Clock size={14} className="text-brand-300 flex-shrink-0" />
                    <span className="text-sm text-brand-600 flex-1">{s}</span>
                    <ArrowRight size={13} className="text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3 mt-5">
                <Keyboard size={11} /> Quick actions
              </div>
              <div className="space-y-1">
                {[
                  { label: 'New Request', href: '/dashboard/requests/new', icon: FileText },
                  { label: 'New Category', href: '/dashboard/categories/new', icon: FolderOpen },
                  { label: 'View all Clients', href: '/dashboard/clients', icon: Users },
                ].map(action => (
                  <button key={action.label} onClick={() => goTo(action.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-brand-50 transition-colors group">
                    <action.icon size={14} className="text-brand-400 flex-shrink-0" />
                    <span className="text-sm text-brand-600 flex-1">{action.label}</span>
                    <ArrowRight size={13} className="text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {(['client', 'request', 'category'] as const).map(type => {
                const group = results.filter(r => r.type === type)
                if (!group.length) return null
                const labels = { client: 'Clients', request: 'Requests', category: 'Categories' }
                return (
                  <div key={type} className="mb-2">
                    <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest px-3 py-1.5">{labels[type]}</div>
                    {group.map((result, i) => {
                      const globalIdx = results.indexOf(result)
                      return (
                        <button
                          key={result.id}
                          onClick={() => goTo(result.href)}
                          className={clsx(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                            selected === globalIdx ? 'bg-blue-50' : 'hover:bg-brand-50',
                          )}
                        >
                          <div className={`w-8 h-8 ${result.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <result.icon size={14} className={result.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-brand-800 truncate">{result.title}</div>
                            <div className="text-xs text-brand-400 truncate">{result.subtitle}</div>
                          </div>
                          <ArrowRight size={13} className={clsx('flex-shrink-0', selected === globalIdx ? 'text-blue-500' : 'text-brand-300')} />
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search size={28} className="text-brand-200 mx-auto mb-2" />
              <p className="text-sm text-brand-500">No results for &quot;{query}&quot;</p>
              <p className="text-xs text-brand-400 mt-1">Try searching by phone number, national ID, or request ID</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-brand-100 px-4 py-2.5 flex items-center gap-4 text-[11px] text-brand-400">
          <span className="flex items-center gap-1"><kbd className="bg-brand-100 px-1 rounded text-[10px] font-mono">Up/Down</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-brand-100 px-1 rounded text-[10px] font-mono">Enter</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="bg-brand-100 px-1 rounded text-[10px] font-mono">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
