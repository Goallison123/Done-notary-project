import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Timer, AlertCircle, CheckCircle2, CreditCard, MapPin, FileText, Pen, Loader2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { clsx } from 'clsx'
import type { CheckInToken, ServiceType, RwandaLocation } from '@/types'

// Demo data for when Supabase is not connected
const demoServices: ServiceType[] = [
  { id: '1', name: 'Land Transfer', code: 'LAND-001', category: 'Land & Property', is_active: true, sort_order: 1, created_at: new Date().toISOString(), requires_witness: false },
  { id: '2', name: 'Property Sale Agreement', code: 'PROP-001', category: 'Land & Property', is_active: true, sort_order: 2, created_at: new Date().toISOString(), requires_witness: false },
  { id: '3', name: 'Mortgage Registration', code: 'MORT-001', category: 'Land & Property', is_active: true, sort_order: 3, created_at: new Date().toISOString(), requires_witness: false },
  { id: '4', name: 'Power of Attorney', code: 'POA-001', category: 'Corporate', is_active: true, sort_order: 4, created_at: new Date().toISOString(), requires_witness: true },
  { id: '5', name: 'Company Board Resolution', code: 'BRD-001', category: 'Corporate', is_active: true, sort_order: 5, created_at: new Date().toISOString(), requires_witness: false },
  { id: '6', name: 'Affidavit', code: 'AFF-001', category: 'Personal', is_active: true, sort_order: 6, created_at: new Date().toISOString(), requires_witness: false },
]

const demoLocations: RwandaLocation[] = [
  { id: '1', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Nyarugenge' },
  { id: '2', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Magerwa' },
  { id: '3', province: 'City of Kigali', district: 'Gasabo', sector: 'Remera' },
  { id: '4', province: 'City of Kigali', district: 'Kicukiro', sector: 'Kicukiro' },
  { id: '5', province: 'Northern', district: 'Musanze', sector: 'Musanze' },
]

declare global {
  interface Window {
    touchStarted: boolean
  }
}

export default function CheckInPage() {
  const { token } = useParams<{ token: string }>()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tokenData, setTokenData] = useState<CheckInToken | null>(null)
  const [expired, setExpired] = useState(false)
  const [used, setUsed] = useState(false)
  const [success, setSuccess] = useState(false)

  const [step, setStep] = useState(1)
  const [services, setServices] = useState<ServiceType[]>(isSupabaseConfigured ? [] : demoServices)
  const [locations, setLocations] = useState<RwandaLocation[]>(isSupabaseConfigured ? [] : demoLocations)

  const [nationalId, setNationalId] = useState('')
  const [nationalIdError, setNationalIdError] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [purpose, setPurpose] = useState('')
  const [signature, setSignature] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const provinces = [...new Set(locations.map(l => l.province))]
  const filteredDistricts = locations.filter(l => l.province === selectedProvince)
  const uniqueDistricts = [...new Set(filteredDistricts.map(l => l.district))]
  const filteredSectors = locations.filter(l => l.district === selectedDistrict)

  useEffect(() => {
    const fetchData = async () => {
      if (isSupabaseConfigured && token) {
        const { data, error } = await supabase
          .from('check_in_tokens')
          .select('*')
          .eq('token', token)
          .single()

        if (error || !data) {
          setExpired(true)
          setLoading(false)
          return
        }

        const isExpired = new Date(data.expires_at) < new Date()
        if (isExpired) {
          setExpired(true)
          setTokenData(data)
          setLoading(false)
          return
        }

        if (data.is_used) {
          setUsed(true)
          setTokenData(data)
          setLoading(false)
          return
        }

        setTokenData(data)

        const [{ data: servicesData }, { data: locationsData }] = await Promise.all([
          supabase.from('service_types').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('rwanda_locations').select('*'),
        ])

        if (servicesData) setServices(servicesData)
        if (locationsData) setLocations(locationsData)
      } else {
        // Demo mode - create a fake token
        setTokenData({
          id: 'demo-token',
          organization_id: 'demo-org',
          created_by: 'demo-user',
          client_name: 'Demo Client',
          client_phone: '+250 788 000 000',
          token: token || 'demo',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          is_used: false,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
      }
      setLoading(false)
    }

    fetchData()
  }, [token])

  useEffect(() => {
    if (canvasRef.current && step === 3) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#0f172a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.fillStyle = '#f8fafc'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [step])

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    setLastPos(pos)
    if ('touches' in e) window.touchStarted = true
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setLastPos(pos)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setSignature(null)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/svg+xml')
      setSignature(dataUrl)
    }
  }

  const validateNationalId = (id: string) => {
    // Rwanda national ID: 16 digits, starts with 1 or 2
    const regex = /^[12]\d{15}$/
    return regex.test(id)
  }

  const handleNationalIdChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16)
    setNationalId(cleaned)
    if (cleaned.length === 16 && !validateNationalId(cleaned)) {
      setNationalIdError('National ID must start with 1 (male) or 2 (female)')
    } else if (cleaned.length > 0 && cleaned.length < 16) {
      setNationalIdError(`Enter 16 digits (${cleaned.length}/16)`)
    } else {
      setNationalIdError('')
    }
  }

  const canProceedStep1 = nationalId.length === 16 && validateNationalId(nationalId)
  const canProceedStep2 = selectedService && selectedProvince && selectedDistrict && selectedSector
  const canSubmit = signature && agreed

  const handleSubmit = async () => {
    if (!tokenData || !canSubmit) return

    setSubmitting(true)

    try {
      if (isSupabaseConfigured) {
        // Insert check-in record
        const { error: checkInError } = await supabase.from('check_ins').insert({
          organization_id: tokenData.organization_id,
          token_id: tokenData.id,
          national_id: nationalId,
          client_name: tokenData.client_name,
          client_phone: tokenData.client_phone,
          service_type_id: selectedService,
          location_id: locations.find(l => l.sector === selectedSector)?.id,
          signature_svg: signature,
          status: 'submitted',
        })

        if (checkInError) throw checkInError

        // Mark token as used
        await supabase
          .from('check_in_tokens')
          .update({ is_used: true, status: 'completed' })
          .eq('id', tokenData.id)
      }

      setSuccess(true)
    } catch (err) {
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Loading check-in form...</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Timer size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">QR Code Expired</h1>
          <p className="text-slate-600 mb-6">This check-in link is no longer valid. Please ask the receptionist for a new QR code.</p>
          {tokenData && (
            <p className="text-sm text-slate-400">Client: {tokenData.client_name}</p>
          )}
        </div>
      </div>
    )
  }

  if (used) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Already Used</h1>
          <p className="text-slate-600">This check-in link has already been completed.</p>
          {tokenData && (
            <p className="text-sm text-slate-400 mt-4">Client: {tokenData.client_name}</p>
          )}
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check-In Complete</h1>
          <p className="text-slate-600 mb-6">Thank you! Your information has been recorded. Please wait in the waiting area.</p>
          {tokenData && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">Queue Number</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">#{1 + Math.floor(Math.random() * 20)}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <h1 className="text-xl font-bold">Client Check-In</h1>
          {tokenData && (
            <p className="text-blue-100 text-sm mt-1">Welcome, {tokenData.client_name}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              )}>
                {s}
              </div>
              {s < 3 && (
                <div className={clsx(
                  'w-8 h-1 mx-1',
                  step > s ? 'bg-blue-600' : 'bg-slate-200'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: National ID */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">National ID</h2>
              <p className="text-sm text-slate-500">Enter your 16-digit Rwanda National ID</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rwanda National ID</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => handleNationalIdChange(e.target.value)}
                placeholder="1199901234567890"
                className={clsx(
                  'w-full px-4 py-3 text-lg font-mono text-center border-2 rounded-xl focus:outline-none transition-all',
                  nationalIdError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                )}
              />
              {nationalIdError && (
                <p className="text-red-500 text-sm mt-2">{nationalIdError}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">16-digit number starting with 1 (male) or 2 (female)</p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className={clsx(
                'w-full py-4 rounded-xl text-white font-semibold text-lg transition-all',
                canProceedStep1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Service & Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Service & Location</h2>
              <p className="text-sm text-slate-500">Select your service and address</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Type</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Province</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedProvince}
                    onChange={(e) => { setSelectedProvince(e.target.value); setSelectedDistrict(''); setSelectedSector('') }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select province...</option>
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedSector('') }}
                    disabled={!selectedProvince}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select...</option>
                    {uniqueDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sector</label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select...</option>
                    {filteredSectors.map(s => (
                      <option key={s.id} value={s.sector}>{s.sector}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={clsx(
                  'w-full py-4 rounded-xl text-white font-semibold text-lg transition-all',
                  canProceedStep2 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
                )}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Signature */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Signature</h2>
              <p className="text-sm text-slate-500">Please sign below using your finger</p>
            </div>

            <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full touch-none cursor-crosshair"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearSignature}
                className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold"
              >
                Clear
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 py-3 bg-slate-100 rounded-xl text-slate-700 font-semibold"
              >
                Confirm Signature
              </button>
            </div>

            {signature && (
              <p className="text-green-600 text-sm text-center">Signature captured</p>
            )}

            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded"
              />
              <p className="text-sm text-slate-600">
                I consent to my data being processed for the sole purpose of notary check-in compliance with Rwanda's data protection law.
              </p>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={clsx(
                'w-full py-4 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2',
                canSubmit && !submitting ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'
              )}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Complete Check-In
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
