import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Phone, Mail, MapPin, FileText, Clock, CheckCircle,
  MessageSquare, Plus, Send, Edit2, Copy, Download,
} from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import { useAuth } from '@/shared/context/AuthContext'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import Button from '@/shared/ui/Button'

const statusVariant = (s: string) => {
  if (s === 'submitted' || s === 'reviewed') return 'success' as const
  if (s === 'pending') return 'pending' as const
  if (s === 'expired') return 'danger' as const
  return 'muted' as const
}

interface Note {
  id: string
  text: string
  author: string
  createdAt: string
}

export default function ClientProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, requests } = useApp()
  const { user } = useAuth()

  const client = clients.find(c => c.id === id)
  const clientRequests = requests.filter(r => r.clientId === id)

  const [notes, setNotes] = useState<Note[]>([
    { id: 'n1', text: 'Client prefers to be contacted via phone. Speaks Kinyarwanda and French.', author: 'Claudine Mukamana', createdAt: '2024-06-15T10:00:00Z' },
  ])
  const [noteText, setNoteText] = useState('')
  const [activeTab, setActiveTab] = useState<'requests' | 'notes' | 'timeline'>('requests')
  const [copied, setCopied] = useState(false)

  if (!client) return (
    <div className="p-6 text-center py-16">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <FileText size={24} className="text-red-400" />
      </div>
      <p className="text-brand-700 font-semibold mb-1">Client not found</p>
      <p className="text-sm text-brand-500 mb-4">This client doesn&apos;t exist or has been removed.</p>
      <Button variant="outline" onClick={() => navigate('/dashboard/clients')} icon={<ArrowLeft size={14} />}>
        Back to Clients
      </Button>
    </div>
  )

  const addNote = () => {
    if (!noteText.trim()) return
    const newNote: Note = {
      id: `n_${Date.now()}`,
      text: noteText.trim(),
      author: user?.name || 'Staff',
      createdAt: new Date().toISOString(),
    }
    setNotes(prev => [newNote, ...prev])
    setNoteText('')
  }

  const copyPhone = () => {
    navigator.clipboard.writeText(client.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const timeline = [
    { label: 'Client record created', time: client.createdAt, icon: CheckCircle, color: 'text-green-500', dot: 'bg-green-500' },
    ...clientRequests.map(r => ({
      label: `${r.status === 'submitted' || r.status === 'reviewed' ? '✓ Submitted' : '📤 Request created'}: ${r.categoryName} (${r.uniqueId})`,
      time: r.submittedAt || r.createdAt,
      icon: r.status === 'pending' ? Clock : CheckCircle,
      color: r.status === 'pending' ? 'text-amber-500' : 'text-green-500',
      dot: r.status === 'pending' ? 'bg-amber-400' : 'bg-green-500',
    })),
    ...notes.map(n => ({
      label: `Note added by ${n.author}`,
      time: n.createdAt,
      icon: MessageSquare,
      color: 'text-blue-500',
      dot: 'bg-blue-400',
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  const submittedRequests = clientRequests.filter(r => r.status === 'submitted' || r.status === 'reviewed').length

  return (
    <div className="p-5 md:p-6 max-w-6xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/clients')} icon={<ArrowLeft size={14} />}>
          Clients
        </Button>
        <span className="text-brand-300">/</span>
        <span className="text-sm text-brand-600 font-medium">{client.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card padding="lg">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-brand-100">
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl mb-3 shadow-lg shadow-blue-200">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-base font-bold text-brand-900 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {client.name}
              </h2>
              <p className="text-xs text-brand-400 mt-1">Client since {new Date(client.createdAt).toLocaleDateString('en-RW', { month: 'short', year: 'numeric' })}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="info">{clientRequests.length} request{clientRequests.length !== 1 ? 's' : ''}</Badge>
                {submittedRequests > 0 && <Badge variant="success">{submittedRequests} completed</Badge>}
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2.5 text-sm text-brand-600">
                  <Phone size={13} className="text-brand-400 flex-shrink-0" />
                  <span className="font-mono text-xs">{client.phone}</span>
                </div>
                <button
                  onClick={copyPhone}
                  className={`p-1 rounded transition-colors ${copied ? 'text-green-500' : 'text-brand-300 hover:text-brand-600 opacity-0 group-hover:opacity-100'}`}
                >
                  {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                </button>
              </div>

              {client.email && (
                <div className="flex items-center gap-2.5 text-sm text-brand-600">
                  <Mail size={13} className="text-brand-400 flex-shrink-0" />
                  <span className="text-xs truncate">{client.email}</span>
                </div>
              )}

              {client.address && (
                <div className="flex items-start gap-2.5 text-sm text-brand-600">
                  <MapPin size={13} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{client.address}</span>
                </div>
              )}

              {client.nationalId && (
                <div className="pt-3 border-t border-brand-100">
                  <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">National ID</div>
                  <div className="text-xs font-mono text-brand-700 bg-brand-50 rounded-lg px-2.5 py-1.5 break-all">
                    {client.nationalId}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <Card padding="sm">
            <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2.5">Quick Actions</div>
            <div className="space-y-1.5">
              <button
                onClick={() => navigate('/dashboard/requests/new')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-brand-700 hover:bg-brand-50 transition-colors"
              >
                <Plus size={14} className="text-blue-500" /> New Request
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-brand-700 hover:bg-brand-50 transition-colors">
                <Download size={14} className="text-teal-500" /> Export Records
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-brand-700 hover:bg-brand-50 transition-colors">
                <Edit2 size={14} className="text-amber-500" /> Edit Profile
              </button>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Tabs */}
          <div className="flex gap-1 bg-brand-100 p-1 rounded-xl w-fit">
            {[
              { id: 'requests', label: `Requests (${clientRequests.length})` },
              { id: 'notes', label: `Notes (${notes.length})` },
              { id: 'timeline', label: 'Timeline' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500 hover:text-brand-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <Card padding="none">
              {clientRequests.length === 0 ? (
                <div className="text-center py-14">
                  <FileText size={36} className="text-brand-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-brand-600 mb-1">No requests yet</p>
                  <p className="text-xs text-brand-400 mb-4">Create the first request for this client</p>
                  <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => navigate('/dashboard/requests/new')}>
                    New Request
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-brand-50">
                  {clientRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-4 px-5 py-4 hover:bg-brand-50 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/requests')}>
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={15} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-brand-800">{req.categoryName}</span>
                          <span className="text-xs text-brand-400 font-mono">{req.uniqueId}</span>
                        </div>
                        <div className="text-xs text-brand-500 mt-0.5">
                          Created {new Date(req.createdAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {req.submittedAt && (
                            <span className="text-green-600"> · Submitted {new Date(req.submittedAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}</span>
                          )}
                          {req.notes && <span className="text-brand-400"> · {req.notes}</span>}
                        </div>
                      </div>
                      <Badge variant={statusVariant(req.status)}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add note */}
              <Card>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add an internal note about this client..."
                      rows={3}
                      className="w-full text-sm text-brand-900 placeholder:text-brand-400 border border-brand-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote() }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-brand-400">⌘↵ to submit</span>
                      <Button variant="primary" size="sm" icon={<Send size={13} />} onClick={addNote} disabled={!noteText.trim()}>
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notes list */}
              {notes.map(note => (
                <Card key={note.id} className="border-brand-100">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">
                      {note.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-brand-800">{note.author}</span>
                        <span className="text-xs text-brand-400">
                          {new Date(note.createdAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-brand-700 leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {notes.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare size={28} className="text-brand-200 mx-auto mb-2" />
                  <p className="text-sm text-brand-400">No notes yet. Add the first note above.</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <Card>
              <div className="relative space-y-0">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.dot} mt-1.5 flex-shrink-0 shadow-sm`} />
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-brand-100 my-1" style={{ minHeight: 24 }} />}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
                      <p className="text-sm text-brand-700 leading-relaxed">{item.label}</p>
                      <p className="text-xs text-brand-400 mt-0.5">
                        {new Date(item.time).toLocaleDateString('en-RW', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
