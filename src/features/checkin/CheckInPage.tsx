import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Timer, AlertCircle, CheckCircle2, MapPin, FileText, Pen, Loader2, CheckSquare } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { clsx } from 'clsx'
import type { CheckInToken, ServiceType, RwandaLocation, Organization } from '@/types'

interface OrgData {
  name: string
  phone?: string
  address?: string
  province?: string
  district?: string
  sector?: string
}

const demoServices: ServiceType[] = [
  { id: '1', name: 'Land Transfer', name_kinyarwanda: 'Gukura Umukono', code: 'LT', category: 'Land & Property', is_active: true, sort_order: 1, created_at: new Date().toISOString(), requires_witness: false },
  { id: '2', name: 'Property Sale Agreement', name_kinyarwanda: 'Amasezerano yo Kugurisha', code: 'PSA', category: 'Land & Property', is_active: true, sort_order: 2, created_at: new Date().toISOString(), requires_witness: false },
  { id: '3', name: 'Power of Attorney', name_kinyarwanda: 'Uruhushya rwo Muhagararira', code: 'POA', category: 'Corporate', is_active: true, sort_order: 3, created_at: new Date().toISOString(), requires_witness: true },
  { id: '4', name: 'Affidavit', name_kinyarwanda: 'Inkuru yo Kurahira', code: 'AFF', category: 'Personal', is_active: true, sort_order: 4, created_at: new Date().toISOString(), requires_witness: false },
  { id: '5', name: 'Contract Authentication', name_kinyarwanda: 'Kwemeza Amasezerano', code: 'CA', category: 'Corporate', is_active: true, sort_order: 5, created_at: new Date().toISOString(), requires_witness: false },
  { id: '6', name: 'Declaration of Heirship', name_kinyarwanda: 'Isubiranwa', code: 'DH', category: 'Personal', is_active: true, sort_order: 6, created_at: new Date().toISOString(), requires_witness: true },
]

const demoLocations: RwandaLocation[] = [
  { id: '1', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Nyarugenge' },
  { id: '2', province: 'City of Kigali', district: 'Nyarugenge', sector: 'Magerwa' },
  { id: '3', province: 'City of Kigali', district: 'Gasabo', sector: 'Remera' },
  { id: '4', province: 'City of Kigali', district: 'Gasabo', sector: 'Kacyiru' },
  { id: '5', province: 'City of Kigali', district: 'Kicukiro', sector: 'Kicukiro' },
  { id: '6', province: 'Northern Province', district: 'Musanze', sector: 'Muhoza' },
  { id: '7', province: 'Southern Province', district: 'Huye', sector: 'Ngoma' },
  { id: '8', province: 'Eastern Province', district: 'Rwamagana', sector: 'Kigabiro' },
  { id: '9', province: 'Western Province', district: 'Rubavu', sector: 'Rubavu' },
]

export default function CheckInPage() {
  const { token } = useParams<{ token: string }>()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tokenData, setTokenData] = useState<CheckInToken | null>(null)
  const [orgData, setOrgData] = useState<OrgData | null>(null)
  const [queueNumber, setQueueNumber] = useState<number | null>(null)
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

        // Fetch organization
        if (data.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name, phone, address, province, district, sector')
            .eq('id', data.organization_id)
            .single()
          if (org) setOrgData(org as OrgData)
        }

        const [{ data: servicesData }, { data: locationsData }] = await Promise.all([
          supabase.from('service_types').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('rwanda_locations').select('*'),
        ])

        if (servicesData) setServices(servicesData)
        if (locationsData) setLocations(locationsData)
      } else {
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
        setOrgData({
          name: 'My Notary Office',
          phone: '+250 788 000 000',
          address: 'KG 123 Ave, Kigali',
          province: 'City of Kigali',
          district: 'Gasabo',
          sector: 'Remera',
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
      const dataUrl = canvas.toDataURL('image/png')
      setSignature(dataUrl)
    }
  }

  const validateNationalId = (id: string) => {
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
        // Get current max sequence number for this org today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: existingCheckIns } = await supabase
          .from('check_ins')
          .select('sequence_number')
          .eq('organization_id', tokenData.organization_id)
          .gte('created_at', today.toISOString())
          .order('sequence_number', { ascending: false })
          .limit(1)

        const nextSeq = (existingCheckIns?.[0]?.sequence_number || 0) + 1
        setQueueNumber(nextSeq)

        const { error: checkInError } = await supabase.from('check_ins').insert({
          organization_id: tokenData.organization_id,
          token_id: tokenData.id,
          client_national_id: nationalId,
          client_name: tokenData.client_name,
          client_phone: tokenData.client_phone,
          service_type_id: selectedService,
          location_province: selectedProvince,
          location_district: selectedDistrict,
          location_sector: selectedSector,
          signature_svg: signature,
          status: 'submitted',
          sequence_number: nextSeq,
          check_in_time: new Date().toISOString(),
        })

        if (checkInError) throw checkInError

        await supabase
          .from('check_in_tokens')
          .update({ is_used: true, status: 'completed' })
          .eq('id', tokenData.id)
      } else {
        setQueueNumber(Math.floor(Math.random() * 20) + 1)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Loading check-in form...</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Timer size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">QR Code Expired</h1>
          <p className="text-slate-600 mb-6">This check-in link is no longer valid. Please ask the receptionist for a new QR code.</p>
          {orgData && (
            <p className="text-sm text-slate-400">{orgData.name}</p>
          )}
        </div>
      </div>
    )
  }

  if (used) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Already Used</h1>
          <p className="text-slate-600">This check-in link has already been completed.</p>
          {orgData && (
            <p className="text-sm text-slate-400 mt-4">{orgData.name}</p>
          )}
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check-In Complete</h1>
          <p className="text-slate-600 mb-6">Thank you! Your information has been recorded. Please wait for your number to be called.</p>

          {queueNumber && (
            <div className="bg-slate-900 rounded-xl p-6 mb-4">
              <p className="text-teal-400 text-sm font-medium mb-1">Your Queue Number</p>
              <p className="text-4xl font-bold text-white">#{String(queueNumber).padStart(3, '0')}</p>
            </div>
          )}

          {orgData && (
            <div className="text-sm text-slate-400">
              <p className="font-semibold">{orgData.name}</p>
              {orgData.address && <p>{orgData.address}</p>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with DONE branding */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <CheckSquare size={18} className="text-teal-400" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight">DONE</div>
              <div className="text-[11px] text-slate-400">{orgData?.name || 'Digital Notary'}</div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold">Client Check-In</h1>
            {tokenData && (
              <p className="text-teal-400 text-sm mt-1">Welcome, {tokenData.client_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all',
                step >= s ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'
              )}>
                {s}
              </div>
              {s < 3 && (
                <div className={clsx(
                  'w-10 h-1 mx-2 rounded-full',
                  step > s ? 'bg-teal-500' : 'bg-slate-200'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: National ID */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1">National ID</h2>
              <p className="text-sm text-slate-500">Enter your 16-digit Rwanda National ID</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rwanda National ID</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => handleNationalIdChange(e.target.value)}
                placeholder="1199901234567890"
                className={clsx(
                  'w-full px-4 py-3.5 text-lg font-mono text-center border-2 rounded-xl focus:outline-none transition-all',
                  nationalIdError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500'
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
                canProceedStep1 ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Service & Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Service & Location</h2>
              <p className="text-sm text-slate-500">Select your service and address</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Type</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
                  >
                    <option value="">Select service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.name_kinyarwanda ? ` (${s.name_kinyarwanda})` : ''}
                      </option>
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
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
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
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none disabled:opacity-50 bg-white"
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
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none disabled:opacity-50 bg-white"
                  >
                    <option value="">Select...</option>
                    {filteredSectors.map(s => (
                      <option key={s.id} value={s.sector}>{s.sector}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className={clsx(
                'w-full py-4 rounded-xl text-white font-semibold text-lg transition-all',
                canProceedStep2 ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Signature */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Signature</h2>
              <p className="text-sm text-slate-500">Please sign below using your finger</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50">
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
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-1 py-3 bg-teal-500 rounded-xl text-white font-semibold hover:bg-teal-600 transition-colors"
                >
                  Confirm Signature
                </button>
              </div>

              {signature && (
                <p className="text-teal-600 text-sm text-center font-medium">Signature captured</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                />
                <p className="text-sm text-slate-600">
                  I consent to my data being processed for notary check-in purposes in accordance with Rwanda's data protection regulations.
                </p>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={clsx(
                'w-full py-4 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2',
                canSubmit && !submitting ? 'bg-teal-500 hover:bg-teal-600' : 'bg-slate-300 cursor-not-allowed'
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

      {/* Footer */}
      <div className="max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-xs text-slate-400">
          Powered by <span className="font-semibold">DONE</span> - Digital Notary Platform
        </p>
      </div>
    </div>
  )
}
