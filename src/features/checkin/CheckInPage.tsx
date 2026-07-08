import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Timer, AlertCircle, CheckCircle2, User, Phone, CreditCard, MapPin, FileText, Pen, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { clsx } from 'clsx'
import type { CheckInToken, ServiceType, RwandaLocation } from '@/types'

declare global {
  interface Window {
    touchStarted: boolean
  }
}

export default function CheckInPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tokenData, setTokenData] = useState<CheckInToken | null>(null)
  const [expired, setExpired] = useState(false)
  const [used, setUsed] = useState(false)

  const [step, setStep] = useState(1)
  const [services, setServices] = useState<ServiceType[]>([])
  const [locations, setLocations] = useState<RwandaLocation[]>([])

  const [nationalId, setNationalId] = useState('')
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
    const fetchToken = async () => {
      if (!token) return

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
      setLoading(false)
    }

    const fetchReferenceData = async () => {
      const [{ data: servicesData }, { data: locationsData }] = await Promise.all([
        supabase.from('service_types').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('rwanda_locations').select('*'),
      ])

      if (servicesData) setServices(servicesData)
      if (locationsData) setLocations(locationsData)
    }

    fetchToken()
    fetchReferenceData()
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
    const regex = /^[12]\d{15}$/
    return regex.test(id)
  }

  const handleSubmit = async () => {
    if (!tokenData || !selectedService || !nationalId || !selectedProvince || !selectedDistrict || !selectedSector || !signature || !agreed) {
      return
    }

    if (!validateNationalId(nationalId)) {
      return
    }

    setSubmitting(true)

    try {
      const { data: sequenceData } = await supabase.rpc('get_next_sequence', {
        p_org_id: tokenData.organization_id,
      })

      const sequenceNumber = sequenceData as number

      const { error: checkInError } = await supabase.from('check_ins').insert({
        organization_id: tokenData.organization_id,
        token_id: tokenData.id,
        sequence_number: sequenceNumber,
        client_name: tokenData.client_name,
        client_phone: tokenData.client_phone,
        client_national_id: nationalId,
        service_type_id: selectedService,
        location_id: locations.find(l => l.sector === selectedSector)?.id,
        purpose_of_visit: purpose,
        signature_svg: signature,
        status: 'submitted',
        form_data: {
          nationalId,
          serviceTypeId: selectedService,
          purpose,
          location: { province: selectedProvince, district: selectedDistrict, sector: selectedSector },
        },
      })

      if (checkInError) throw checkInError

      await supabase
        .from('check_in_tokens')
        .update({ is_used: true, status: 'completed' })
        .eq('id', tokenData.id)

      setStep(4)
    } catch (err) {
      console.error('Check-in submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const timeRemaining = tokenData ? Math.max(0, Math.floor((new Date(tokenData.expires_at).getTime() - Date.now()) / 1000)) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-brand-600">Loading check-in form...</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Timer size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-brand-900">QR Code Expired</h1>
          <p className="text-brand-600">
            This check-in link has expired. Please ask the receptionist for a new QR code.
          </p>
        </div>
      </div>
    )
  }

  if (used) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-green-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-brand-900">Already Checked In</h1>
          <p className="text-brand-600">
            You have already completed check-in. Please wait for your number to be called.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-900 mt-4 tracking-tight">Client Check-In</h1>
          <p className="text-brand-600 mt-1">Complete your registration</p>
          {tokenData && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
              <Timer size={14} />
              <span className="font-mono font-semibold">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                step > s ? 'bg-green-500 text-white' :
                step === s ? 'bg-blue-600 text-white' : 'bg-brand-100 text-brand-400'
              )}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 3 && (
                <div className={clsx('w-8 h-0.5', step > s ? 'bg-green-500' : 'bg-brand-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-brand-200 p-6 space-y-5">
            <div className="text-center pb-4 border-b border-brand-100">
              <p className="text-sm text-brand-500">Checking in as</p>
              <h2 className="text-lg font-bold text-brand-900">{tokenData?.client_name}</h2>
              <p className="text-sm text-brand-600">{tokenData?.client_phone}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-2">
                <CreditCard size={14} />
                National ID Number
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="16-digit national ID"
                className={clsx(
                  'w-full px-4 py-3 rounded-xl border text-sm transition-all',
                  nationalId && !validateNationalId(nationalId)
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                    : 'border-brand-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
              />
              {nationalId && !validateNationalId(nationalId) && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  National ID must be 16 digits starting with 1 or 2
                </p>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!validateNationalId(nationalId)}
              className={clsx(
                'w-full py-3.5 rounded-xl font-semibold text-white transition-all',
                validateNationalId(nationalId)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-brand-300 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Service & Location */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-brand-200 p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-2">
                <FileText size={14} />
                Purpose of Visit
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-200 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.name_kinyarwanda ? `(${s.name_kinyarwanda})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-2">
                <MapPin size={14} />
                Location
              </label>
              <div className="space-y-2">
                <select
                  value={selectedProvince}
                  onChange={(e) => { setSelectedProvince(e.target.value); setSelectedDistrict(''); setSelectedSector('') }}
                  className="w-full px-4 py-3 rounded-xl border border-brand-200 text-sm"
                >
                  <option value="">Province</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {selectedProvince && (
                  <select
                    value={selectedDistrict}
                    onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedSector('') }}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 text-sm"
                  >
                    <option value="">District</option>
                    {uniqueDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                )}

                {selectedDistrict && (
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 text-sm"
                  >
                    <option value="">Sector</option>
                    {filteredSectors.map(s => (
                      <option key={s.id} value={s.sector}>{s.sector}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-brand-700 mb-2 block">
                Additional Notes (Optional)
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                placeholder="Any additional details about your visit..."
                className="w-full px-4 py-3 rounded-xl border border-brand-200 text-sm resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-brand-200 font-medium text-brand-600 hover:bg-brand-50"
              >
                Back
              </button>
              <button
                onClick={() => { saveSignature(); setStep(3); }}
                disabled={!selectedService || !selectedSector}
                className={clsx(
                  'flex-1 py-3 rounded-xl font-semibold text-white transition-all',
                  selectedService && selectedSector
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30'
                    : 'bg-brand-300 cursor-not-allowed'
                )}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Signature */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg border border-brand-200 p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-2">
                <Pen size={14} />
                Digital Signature
              </label>
              <div className="border border-brand-200 rounded-xl overflow-hidden bg-brand-50">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <button
                onClick={clearSignature}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Clear signature
              </button>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-brand-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-brand-600">
                I confirm that the information provided is accurate and I agree to the terms of service as per Rwandan notarial law (Law Nº 18/2010).
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl border border-brand-200 font-medium text-brand-600 hover:bg-brand-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!signature || !agreed || submitting}
                className={clsx(
                  'flex-1 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2',
                  signature && agreed && !submitting
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/30'
                    : 'bg-brand-300 cursor-not-allowed'
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Submit Check-In
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 text-center space-y-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-brand-900">Check-In Complete!</h2>
            <p className="text-brand-600">
              You have been successfully registered. Please wait for your number to be called.
            </p>
            <div className="py-6 bg-green-50 rounded-2xl border border-green-200">
              <p className="text-sm text-green-700 font-medium">Your Queue Number</p>
              <p className="text-5xl font-extrabold text-green-600 font-mono mt-2">
                #{Math.floor(Math.random() * 100).toString().padStart(3, '0')}
              </p>
            </div>
            <p className="text-xs text-brand-400">
              Keep this page open. You will be notified when it's your turn.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
