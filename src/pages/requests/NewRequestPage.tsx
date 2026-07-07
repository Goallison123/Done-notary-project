import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare, CheckCircle, Copy, Phone, Mail } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import type { ClientRequest, Client } from '../../types'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Card from '../../components/ui/Card'

function generateToken() {
  return 'tok_' + Math.random().toString(36).slice(2, 14)
}

function generateId(count: number) {
  return `REQ-2024-${String(count + 1).padStart(3, '0')}`
}

export default function NewRequestPage() {
  const { categories, requests, addRequest, addClient, clients } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const [phone, setPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientName, setClientName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdRequest, setCreatedRequest] = useState<ClientRequest | null>(null)
  const [copied, setCopied] = useState(false)

  const selectedCat = categories.find(c => c.id === categoryId)

  const handleCreate = async () => {
    if (!categoryId || !phone) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))

    const token = generateToken()
    const uniqueId = generateId(requests.length)

    let clientId = clients.find(c => c.phone === phone)?.id
    if (!clientId) {
      const newClient: Client = {
        id: `cli_${Date.now()}`,
        name: clientName || phone,
        phone,
        email: clientEmail || undefined,
        orgId: 'org_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requestCount: 1,
        lastActivity: new Date().toISOString(),
      }
      addClient(newClient)
      clientId = newClient.id
    }

    const req: ClientRequest = {
      id: `req_${Date.now()}`,
      uniqueId,
      token,
      secureLink: `/submit/${token}`,
      categoryId,
      categoryName: selectedCat?.name || '',
      clientId,
      clientPhone: phone,
      clientEmail: clientEmail || undefined,
      clientName: clientName || phone,
      notes: notes || undefined,
      status: 'pending',
      orgId: 'org_1',
      createdBy: user?.id || 'u1',
      createdByName: user?.name || 'Staff',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    addRequest(req)
    setCreatedRequest(req)
    setLoading(false)
    setStep(2)
  }

  const copyLink = () => {
    if (createdRequest) {
      navigator.clipboard.writeText(`${window.location.origin}/submit/${createdRequest.token}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/requests')} icon={<ArrowLeft size={14} />}>
          Requests
        </Button>
        <span className="text-brand-300">/</span>
        <span className="text-sm text-brand-500">New Request</span>
      </div>

      {step === 1 && (
        <Card padding="lg">
          <h2 className="text-base font-bold text-brand-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create Client Request</h2>
          <p className="text-sm text-brand-500 mb-6">A secure link will be generated and sent to the client via SMS.</p>

          <div className="space-y-4">
            <Select
              label="Form Category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              options={categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
              placeholder="Select a category..."
              required
            />

            {selectedCat && (
              <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                <div className="text-xs text-brand-500 mb-1">Fields in this form:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCat.fields.map(f => (
                    <span key={f.id} className="text-xs bg-white border border-brand-200 text-brand-600 px-2 py-0.5 rounded-full">
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Client Phone Number"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+250 788 000 000"
              required
              prefix={<Phone size={14} />}
              hint="The secure link will be sent to this number via SMS"
            />

            <Input
              label="Client Full Name"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Optional — helps identify the client"
            />

            <Input
              label="Client Email (Optional)"
              type="email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              placeholder="client@email.com"
              prefix={<Mail size={14} />}
            />

            <Textarea
              label="Internal Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any internal notes about this request..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => navigate('/dashboard/requests')} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Send size={15} />}
              onClick={handleCreate}
              loading={loading}
              disabled={!categoryId || !phone}
              className="flex-1"
            >
              Create & Send Link
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && createdRequest && (
        <Card padding="lg">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="text-base font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Request Created!</h2>
            <p className="text-sm text-brand-500 mt-1">SMS sent to {createdRequest.clientPhone}</p>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-brand-500">Request ID</span>
              <span className="font-mono font-medium text-brand-800">{createdRequest.uniqueId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-500">Category</span>
              <span className="text-brand-700">{createdRequest.categoryName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-500">Expires</span>
              <span className="text-brand-700">{new Date(createdRequest.expiresAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-brand-500 mb-2 font-medium">Secure Submission Link</div>
            <div className="flex items-center gap-2 bg-white border border-brand-200 rounded-lg px-3 py-2">
              <code className="text-xs text-brand-600 flex-1 truncate font-mono">
                {window.location.origin}/submit/{createdRequest.token}
              </code>
              <button onClick={copyLink} className={`p-1 rounded transition-colors ${copied ? 'text-green-600' : 'text-brand-400 hover:text-brand-700'}`}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Mock SMS */}
          <div className="border border-brand-200 rounded-xl p-4 bg-white mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-brand-700">Mock SMS Preview</span>
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Simulated</span>
            </div>
            <div className="bg-brand-50 rounded-lg p-3 text-xs text-brand-600 leading-relaxed">
              <strong>DONE | Kigali Notary Office</strong><br />
              Hello {createdRequest.clientName || 'Client'}! You have a form to complete for <strong>{createdRequest.categoryName}</strong>.<br />
              Access your secure form here:<br />
              <span className="text-blue-600 break-all">{window.location.origin}/submit/{createdRequest.token}</span><br />
              Link expires in 7 days. Do not share this link.
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/requests')} className="flex-1">
              View All Requests
            </Button>
            <Button variant="primary" onClick={() => { setStep(1); setCategoryId(''); setPhone(''); setClientName(''); setClientEmail(''); setNotes('') }} className="flex-1">
              Create Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
