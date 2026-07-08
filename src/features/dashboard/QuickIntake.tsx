import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { X, Clock, Phone, User, Copy, Check, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { clsx } from 'clsx'
import type { CheckInToken } from '@/types'

interface QuickIntakeProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  userId: string
  onTokenCreated?: (token: CheckInToken) => void
}

export default function QuickIntake({ isOpen, onClose, organizationId, userId, onTokenCreated }: QuickIntakeProps) {
  const [step, setStep] = useState<'form' | 'qr'>('form')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<CheckInToken | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setClientName('')
      setClientPhone('')
      setError(null)
      setToken(null)
      setQrSvg(null)
      setCopied(false)
      setTimeLeft(600)
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (step === 'qr' && token) {
      const interval = setInterval(() => {
        const expiry = new Date(token.expires_at).getTime()
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000))
        setTimeLeft(remaining)
        if (remaining === 0) {
          clearInterval(interval)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, token])

  const generateQR = async (tokenValue: string) => {
    const checkInUrl = `${window.location.origin}/check-in/${tokenValue}`
    try {
      const svg = await QRCode.toString(checkInUrl, {
        type: 'svg',
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
      setQrSvg(svg)

      const { error: updateError } = await supabase
        .from('check_in_tokens')
        .update({ qr_code_svg: svg })
        .eq('token', tokenValue)

      if (updateError) {
        console.error('Failed to save QR code SVG:', updateError)
      }
    } catch (err) {
      console.error('QR generation error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Please enter both name and phone number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: tokenData, error: rpcError } = await supabase.rpc('generate_secure_token')

      if (rpcError) throw rpcError

      const tokenValue = tokenData as string
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      const { data, error: insertError } = await supabase
        .from('check_in_tokens')
        .insert({
          organization_id: organizationId,
          created_by: userId,
          client_name: clientName.trim(),
          client_phone: clientPhone.trim(),
          token: tokenValue,
          expires_at: expiresAt,
          status: 'pending',
          is_used: false,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setToken(data)
      await generateQR(tokenValue)
      setStep('qr')
      onTokenCreated?.(data)
    } catch (err) {
      console.error('Token creation error:', err)
      setError('Failed to create check-in token. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (!token) return
    const checkInUrl = `${window.location.origin}/check-in/${token.token}`
    try {
      await navigator.clipboard.writeText(checkInUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-brand-900/30 border border-brand-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100 bg-gradient-to-r from-blue-600 to-blue-500">
          <h2 className="text-base font-bold text-white">Quick Check-In</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-sm text-brand-600">Enter client details to generate a check-in QR code valid for 10 minutes.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-700 mb-1.5">Client Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+250 78X XXX XXX"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl transition-all',
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30'
                )}
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          </form>
        )}

        {step === 'qr' && token && (
          <div className="p-5 space-y-5">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
                <Clock size={12} />
                <span className={clsx(timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-brand-400')}>
                  Expires in {formatTime(timeLeft)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-900">{token.client_name}</h3>
              <p className="text-sm text-brand-500">{token.client_phone}</p>
            </div>

            <div className="flex justify-center">
              <div className={clsx(
                'p-4 bg-white rounded-2xl border-2',
                timeLeft === 0 ? 'border-red-300' : 'border-blue-200',
                'shadow-lg'
              )}>
                {timeLeft === 0 ? (
                  <div className="w-[280px] h-[280px] flex flex-col items-center justify-center text-brand-400 space-y-2">
                    <AlertCircle size={48} className="text-red-400" />
                    <p className="font-semibold text-red-600">QR Code Expired</p>
                    <button
                      onClick={() => setStep('form')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Generate new code
                    </button>
                  </div>
                ) : qrSvg ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                    className="w-[280px] h-[280px]"
                  />
                ) : (
                  <div className="w-[280px] h-[280px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl border border-brand-100">
              <code className="flex-1 text-xs font-mono text-brand-600 truncate">
                {window.location.origin}/check-in/{token.token}
              </code>
              <button
                onClick={copyLink}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white border border-brand-200 text-brand-600 hover:border-blue-300'
                )}
              >
                {copied ? (
                  <>
                    <Check size={12} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-xs text-brand-400">
              Client scans this QR code with their phone to complete check-in
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
