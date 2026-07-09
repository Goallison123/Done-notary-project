import { useState, useEffect, useRef, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import QRCode from 'qrcode'
import {
  Users, Clock, CheckCircle2, Phone, User, Copy, Check,
  AlertCircle, X, RefreshCw, Archive, ChevronRight,
  Loader2, Wifi, WifiOff,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useApp } from '@/shared/context/AppContext'
import { useAuth } from '@/shared/context/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { CheckIn, CheckInToken } from '@/types'

function makeToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let t = 'tok_'
  for (let i = 0; i < 8; i++) t += chars[Math.floor(Math.random() * chars.length)]
  return t
}

const STATUS_CFG: Record<CheckIn['status'], { label: string; cls: string; dot: string }> = {
  in_progress: { label: 'Filing Details', cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-400' },
  submitted:   { label: 'Submitted',      cls: 'bg-blue-50 text-blue-800 border-blue-200',   dot: 'bg-blue-500' },
  signed:      { label: 'Signed',         cls: 'bg-violet-50 text-violet-800 border-violet-200', dot: 'bg-violet-500' },
  ready:       { label: 'Ready',          cls: 'bg-green-50 text-green-800 border-green-200', dot: 'bg-green-500' },
  called:      { label: 'Called',         cls: 'bg-teal-50 text-teal-800 border-teal-200',   dot: 'bg-teal-500' },
  archived:    { label: 'Archived',       cls: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
}

export default function DashboardPage() {
  const { org, user } = useAuth()
  const { checkIns, serviceTypes, updateCheckInStatus, refreshCheckIns } = useApp()

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [creating, setCreating] = useState(false)
  const [intakeError, setIntakeError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  const [activeToken, setActiveToken] = useState<CheckInToken | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeQueue = checkIns.filter(c => c.status !== 'archived')
  const inQueue = checkIns.filter(c => ['in_progress', 'submitted', 'signed'].includes(c.status))
  const readyCount = checkIns.filter(c => c.status === 'ready' || c.status === 'called').length
  const archivedToday = checkIns.filter(c => {
    if (c.status !== 'archived') return false
    return new Date(c.created_at).toDateString() === new Date().toDateString()
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayStr = new Date().toLocaleDateString('en-RW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!activeToken) return
    clearInterval(timerRef.current!)
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.floor((new Date(activeToken.expires_at).getTime() - Date.now()) / 1000))
      setTimeLeft(left)
      if (left === 0) {
        clearInterval(timerRef.current!)
        setActiveToken(null)
        setQrSvg(null)
      }
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [activeToken])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const buildQR = useCallback(async (token: string) => {
    const url = `${window.location.origin}/check-in/${token}`
    const svg = await QRCode.toString(url, { type: 'svg', width: 220, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
    setQrSvg(svg)
    return svg
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !clientPhone.trim()) return setIntakeError('Enter both client name and phone number')
    if (!org?.id) return setIntakeError('Organization not loaded')
    setCreating(true)
    setIntakeError('')
    try {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      let tokenValue: string

      if (isSupabaseConfigured) {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('generate_secure_token')
        tokenValue = rpcErr ? makeToken() : (rpcData as string)
        const { data, error } = await supabase
          .from('check_in_tokens')
          .insert({
            organization_id: org.id,
            created_by: user?.id || null,
            client_name: clientName.trim(),
            client_phone: clientPhone.trim(),
            token: tokenValue,
            expires_at: expiresAt,
            status: 'pending',
            is_used: false,
          })
          .select()
          .single()
        if (error) throw error
        const svg = await buildQR(tokenValue)
        await supabase.from('check_in_tokens').update({ qr_code_svg: svg }).eq('id', data.id)
        setActiveToken(data as CheckInToken)
      } else {
        tokenValue = makeToken()
        const svg = await buildQR(tokenValue)
        setActiveToken({
          id: `demo-${Date.now()}`,
          organization_id: org.id,
          client_name: clientName.trim(),
          client_phone: clientPhone.trim(),
          token: tokenValue,
          expires_at: expiresAt,
          is_used: false,
          status: 'pending',
          qr_code_svg: svg,
          created_at: new Date().toISOString(),
        })
      }

      setTimeLeft(600)
      setClientName('')
      setClientPhone('')
      setTimeout(() => nameRef.current?.focus(), 100)
    } catch (err) {
      console.error(err)
      setIntakeError('Failed to generate. Try again.')
    } finally {
      setCreating(false)
    }
  }

  const copyLink = async () => {
    if (!activeToken) return
    await navigator.clipboard.writeText(`${window.location.origin}/check-in/${activeToken.token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Top strip */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900">{greeting}, {user?.name?.split(' ')[0] || 'there'}</h1>
            <span className={clsx(
              'flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5',
              isSupabaseConfigured
                ? 'text-green-700 bg-green-50 border border-green-200'
                : 'text-amber-700 bg-amber-50 border border-amber-200'
            )}>
              {isSupabaseConfigured ? <><Wifi size={10} /> Live</> : <><WifiOff size={10} /> Demo</>}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{todayStr} · {org?.name}</p>
        </div>
        <button onClick={() => refreshCheckIns()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-slate-100">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Users,       label: 'Total Today',    value: checkIns.length,  accent: 'text-slate-900', iconCls: 'bg-slate-100 text-slate-600' },
            { icon: Clock,       label: 'In Queue',       value: inQueue.length,   accent: 'text-amber-600', iconCls: 'bg-amber-50 text-amber-600' },
            { icon: CheckCircle2,label: 'Ready',          value: readyCount,       accent: 'text-green-700', iconCls: 'bg-green-50 text-green-600' },
            { icon: Archive,     label: 'Done Today',     value: archivedToday.length, accent: 'text-slate-500', iconCls: 'bg-slate-50 text-slate-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
              <div className={clsx('p-2.5 rounded-xl', s.iconCls)}><s.icon size={16} /></div>
              <div>
                <div className={clsx('text-2xl font-bold', s.accent)}>{s.value}</div>
                <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-panel main */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Intake */}
        <div className="w-[360px] flex-shrink-0 border-r border-slate-100 bg-white overflow-y-auto">
          <div className="p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quick Client Intake</h2>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Client Names</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={nameRef}
                    type="text"
                    value={clientName}
                    onChange={e => { setClientName(e.target.value); setIntakeError('') }}
                    placeholder="Jean Pierre Habimana"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={e => { setClientPhone(e.target.value); setIntakeError('') }}
                    placeholder="+250 788 XXX XXX"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>

              {intakeError && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {intakeError}
                </p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
              >
                {creating ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : 'Generate Secure QR Code & Link'}
              </button>
            </form>

            {/* QR Panel */}
            {activeToken && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium opacity-70">Scan to Sign — Token:</div>
                    <div className="font-mono text-sm font-bold tracking-wider">{activeToken.token}</div>
                  </div>
                  <div className={clsx(
                    'font-mono text-lg font-bold',
                    timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-green-400'
                  )}>
                    {fmt(timeLeft)}
                  </div>
                </div>

                <div className="bg-white p-4 flex flex-col items-center gap-3">
                  <div className="text-xs text-slate-500 text-center">
                    {activeToken.client_name} · {activeToken.client_phone}
                  </div>
                  {qrSvg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                      className="w-[200px] h-[200px] rounded-xl overflow-hidden border border-slate-100 [&>svg]:w-full [&>svg]:h-full"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                      <Loader2 className="animate-spin text-slate-400" size={28} />
                    </div>
                  )}

                  <a
                    href={`${window.location.origin}/check-in/${activeToken.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                  >
                    Open link <ChevronRight size={12} />
                  </a>

                  <div className="w-full flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 truncate text-slate-600">
                      /check-in/{activeToken.token}
                    </code>
                    <button
                      onClick={copyLink}
                      className={clsx(
                        'flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                        copied
                          ? 'text-green-700 bg-green-50 border-green-200'
                          : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>

                  <button
                    onClick={() => { setActiveToken(null); setQrSvg(null) }}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <X size={11} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Queue */}
        <div className="flex-1 overflow-y-auto bg-slate-50/80">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Queue Monitor</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-slate-500">{activeQueue.length} active</span>
              </div>
            </div>

            {activeQueue.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Queue is empty</p>
                <p className="text-xs text-slate-400 mt-1">Use Quick Client Intake to get started</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeQueue.map((ci, idx) => {
                  const svc = serviceTypes.find(s => s.id === ci.service_type_id)
                  const cfg = STATUS_CFG[ci.status]
                  return (
                    <div
                      key={ci.id}
                      className={clsx(
                        'bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md',
                        ci.status === 'ready' ? 'border-green-200' : 'border-slate-100'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">
                              #{String(ci.sequence_number || idx + 1).padStart(3, '0')} | {ci.client_name}
                            </span>
                            <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border', cfg.cls)}>
                              <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
                              {cfg.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                            <span>{svc?.name || (ci.service_type_id ? 'Loading...' : 'Service not selected')}</span>
                            {ci.client_national_id && <><span className="text-slate-300">|</span><span className="text-green-600">Verified</span></>}
                            <span className="text-slate-300">|</span>
                            <span>{formatDistanceToNow(new Date(ci.created_at), { addSuffix: true })}</span>
                          </div>
                          {(ci.location_district || ci.location_sector) && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {[ci.location_sector, ci.location_district].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {ci.status === 'ready' && (
                            <button
                              onClick={() => updateCheckInStatus(ci.id, 'called')}
                              className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              Call
                            </button>
                          )}
                          {['called', 'submitted', 'signed'].includes(ci.status) && (
                            <button
                              onClick={() => updateCheckInStatus(ci.id, 'archived')}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                            >
                              <Archive size={11} /> Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {archivedToday.length > 0 && (
              <details className="mt-5 group">
                <summary className="text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 flex items-center gap-1.5 list-none">
                  <Archive size={12} />
                  Archived today ({archivedToday.length})
                  <ChevronRight size={12} className="group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-2 space-y-1.5">
                  {archivedToday.map((ci, idx) => (
                    <div key={ci.id} className="bg-white/70 rounded-xl border border-slate-100 px-4 py-2.5 flex items-center gap-3 opacity-70">
                      <span className="text-xs text-slate-400 font-mono w-10">#{String(ci.sequence_number || idx + 1).padStart(3, '0')}</span>
                      <span className="text-xs text-slate-700 font-medium flex-1">{ci.client_name}</span>
                      <span className="text-xs text-slate-400">{ci.client_phone}</span>
                      <span className="text-xs text-slate-400">{serviceTypes.find(s => s.id === ci.service_type_id)?.name || ''}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
