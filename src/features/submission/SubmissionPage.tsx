import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckSquare, Upload, X, CheckCircle, AlertCircle, Pen,
  Shield, Lock, Clock, ChevronRight,
} from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import { mockOrg } from '@/data/mockData'
import type { FormField } from '@/types'

/* --- Signature Canvas --- */
function SignatureCanvas({ onSave }: { onSave: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.strokeStyle = '#0F172A'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    drawing.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setHasStrokes(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e, canvas)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stop = useCallback(() => {
    drawing.current = false
    const canvas = canvasRef.current
    if (canvas && hasStrokes) onSave(canvas.toDataURL())
  }, [hasStrokes, onSave])

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    onSave('')
  }

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-brand-300 rounded-2xl overflow-hidden bg-white relative" style={{ height: 160 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full sig-canvas"
          style={{ display: 'block', height: 160 }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        />
        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-brand-300">
              <Pen size={20} />
              <span className="text-xs">Draw your signature here</span>
            </div>
          </div>
        )}
      </div>
      {hasStrokes && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle size={12} /> Signature captured
          </div>
          <button onClick={clear} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={11} /> Clear & redo
          </button>
        </div>
      )}
    </div>
  )
}

/* --- File Upload --- */
function FileUploadField({ field, onFiles }: { field: FormField; onFiles: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const max = field.maxFiles || 5

  const handleAdd = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles).slice(0, max - files.length)
    const updated = [...files, ...arr]
    setFiles(updated)
    onFiles(updated)
  }

  const remove = (i: number) => {
    const updated = files.filter((_, idx) => idx !== i)
    setFiles(updated)
    onFiles(updated)
  }

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleAdd(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-brand-200 hover:border-blue-300 hover:bg-brand-50'
        }`}
      >
        <Upload size={22} className={`mx-auto mb-2 ${dragging ? 'text-blue-500' : 'text-brand-300'}`} />
        <p className="text-sm font-medium text-brand-600">Click to upload or drag and drop</p>
        <p className="text-xs text-brand-400 mt-1">
          PDF, JPG, PNG · Max {max} file{max !== 1 ? 's' : ''} · 10 MB each
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={field.acceptedTypes?.join(',') || 'image/*,application/pdf'}
        className="hidden"
        onChange={e => handleAdd(e.target.files)}
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-brand-50 border border-brand-200 rounded-xl">
              <div className="w-9 h-9 bg-white border border-brand-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-brand-600 font-mono uppercase flex-shrink-0">
                {f.name.split('.').pop()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-800 truncate">{f.name}</div>
                <div className="text-xs text-brand-400">{formatSize(f.size)}</div>
              </div>
              <button onClick={() => remove(i)} className="p-1 rounded-lg text-brand-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* --- Dynamic Field --- */
function DynamicField({ field, value, onChange }: { field: FormField; value: unknown; onChange: (v: unknown) => void }) {
  const base = 'w-full h-11 rounded-xl border border-brand-200 bg-white px-3.5 text-sm text-brand-900 placeholder:text-brand-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'

  switch (field.type) {
    case 'long_text':
      return <textarea value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={`${base} h-28 pt-3 pb-2 resize-none`} />
    case 'date':
      return <input type="date" value={value as string || ''} onChange={e => onChange(e.target.value)} className={base} />
    case 'number':
      return <input type="number" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={base} />
    case 'phone':
      return <input type="tel" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || '+250 7XX XXX XXX'} className={base} />
    case 'email':
      return <input type="email" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={base} />
    case 'dropdown':
      return (
        <select value={value as string || ''} onChange={e => onChange(e.target.value)} className={`${base} appearance-none`}>
          <option value="">Select an option...</option>
          {field.options?.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
        </select>
      )
    case 'radio':
      return (
        <div className="space-y-2.5 pt-1">
          {field.options?.map(o => (
            <label key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${value === o.value ? 'border-blue-400 bg-blue-50' : 'border-brand-200 hover:border-brand-300 hover:bg-brand-50'}`}>
              <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="text-blue-600" />
              <span className="text-sm text-brand-700 font-medium">{o.label}</span>
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className="space-y-2.5 pt-1">
          {field.options?.map(o => {
            const checked = (value as string[] || []).includes(o.value)
            return (
              <label key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'border-blue-400 bg-blue-50' : 'border-brand-200 hover:border-brand-300 hover:bg-brand-50'}`}>
                <input type="checkbox" value={o.value} checked={checked} onChange={e => {
                  const arr = (value as string[] || [])
                  onChange(e.target.checked ? [...arr, o.value] : arr.filter(v => v !== o.value))
                }} className="rounded text-blue-600" />
                <span className="text-sm text-brand-700 font-medium">{o.label}</span>
              </label>
            )
          })}
        </div>
      )
    case 'national_id':
      return <input type="text" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || '1 YYYY MM XXXXXXX X XX'} className={`${base} font-mono tracking-widest`} />
    default:
      return <input type="text" value={value as string || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={base} />
  }
}

/* --- Main Page --- */
export default function SubmissionPage() {
  const { token } = useParams()
  const { requests, updateRequest, categories } = useApp()

  const request = requests.find(r => r.token === token)
  const categoryFields = request
    ? (categories.find(c => c.id === request.categoryId)?.fields || []).sort((a, b) => a.order - b.order)
    : []

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [signature, setSignature] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const completedFields = categoryFields.filter(f =>
    f.type === 'file_upload' || f.type === 'signature' ? true : !!formData[f.id]
  ).length
  const progress = categoryFields.length > 0 ? Math.round((completedFields / categoryFields.length) * 100) : 0

  /* -- Guard states -- */
  if (!request) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={30} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-brand-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Link not found
          </h1>
          <p className="text-sm text-brand-500 leading-relaxed">
            This link is invalid or no longer exists. Please contact the office for assistance.
          </p>
        </div>
      </div>
    )
  }

  if (request.status === 'submitted' || request.status === 'reviewed') {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-brand-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Already submitted
          </h1>
          <p className="text-sm text-brand-500 leading-relaxed">
            Your form was already received successfully. The office will contact you if they need anything further.
          </p>
        </div>
      </div>
    )
  }

  if (new Date(request.expiresAt) < new Date() || request.status === 'expired') {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Clock size={30} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-brand-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Link expired
          </h1>
          <p className="text-sm text-brand-500 leading-relaxed">
            This link expired on {new Date(request.expiresAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })}.
            Please contact the office for a new link.
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    categoryFields.forEach(f => {
      if (f.required && f.type !== 'file_upload' && f.type !== 'signature' && !formData[f.id]) {
        newErrors[f.id] = `${f.label} is required`
      }
    })
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstError = Object.keys(newErrors)[0]
      document.getElementById(`field-${firstError}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1800))
    updateRequest(request.id, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      formData,
      signature: signature || undefined,
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  /* -- Success -- */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-brand-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Submitted!
            </h1>
            <p className="text-brand-600 leading-relaxed">
              Your information has been securely received by{' '}
              <strong className="text-brand-800">{mockOrg.name}</strong>.
            </p>
          </div>

          <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-brand-500">Reference ID</span>
              <span className="font-mono font-bold text-brand-900">{request.uniqueId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-500">Form type</span>
              <span className="text-brand-700">{request.categoryName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-500">Submitted at</span>
              <span className="text-brand-700">{new Date().toLocaleString('en-RW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
            <strong className="block mb-1">What happens next?</strong>
            The team at {mockOrg.name} will review your submission and contact you at{' '}
            <strong>{request.clientPhone}</strong> within 1–3 business days.
          </div>

          <p className="text-center text-xs text-brand-400 mt-6">
            You may now close this tab. Keep your reference ID <strong>{request.uniqueId}</strong> for future reference.
          </p>
        </div>
      </div>
    )
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(request.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  /* -- Form -- */
  return (
    <div className="min-h-screen bg-brand-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-brand-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-brand-900 rounded-lg flex items-center justify-center">
              <CheckSquare size={13} className="text-teal-400" />
            </div>
            <span className="text-sm font-bold text-brand-900 hidden sm:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {mockOrg.name}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-brand-500 mb-1">
              <span className="truncate">{request.categoryName}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full h-1.5 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-brand-400 flex-shrink-0">
            <Clock size={11} />
            {daysLeft}d
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4 space-y-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {request.categoryName}
          </h1>
          <p className="text-sm text-brand-500 leading-relaxed max-w-md mx-auto">
            Please complete all required fields and submit. Your information is encrypted and only accessible by {mockOrg.name} staff.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <Lock size={10} /> End-to-end encrypted
            </div>
            <div className="flex items-center gap-1.5 text-xs text-brand-500">
              <Shield size={10} /> For {mockOrg.name} only
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {categoryFields.map(field => {
            if (field.type === 'file_upload') return (
              <div key={field.id} id={`field-${field.id}`} className="bg-white rounded-2xl border border-brand-200 shadow-sm p-5">
                <label className="block text-sm font-semibold text-brand-900 mb-1">
                  {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.helpText && <p className="text-xs text-brand-500 mb-3">{field.helpText}</p>}
                <FileUploadField field={field} onFiles={files => setFormData(p => ({ ...p, [field.id]: files }))} />
              </div>
            )

            if (field.type === 'signature') return (
              <div key={field.id} id={`field-${field.id}`} className="bg-white rounded-2xl border border-brand-200 shadow-sm p-5">
                <label className="block text-sm font-semibold text-brand-900 mb-1">
                  {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="text-xs text-brand-500 mb-3">Draw your signature using mouse or finger. This will be legally attached to your submission.</p>
                <SignatureCanvas onSave={setSignature} />
              </div>
            )

            return (
              <div key={field.id} id={`field-${field.id}`} className="bg-white rounded-2xl border border-brand-200 shadow-sm p-5">
                <label className="block text-sm font-semibold text-brand-900 mb-1">
                  {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.helpText && <p className="text-xs text-brand-500 mb-2">{field.helpText}</p>}
                <DynamicField field={field} value={formData[field.id]} onChange={v => {
                  setFormData(p => ({ ...p, [field.id]: v }))
                  if (errors[field.id]) setErrors(p => { const n = { ...p }; delete n[field.id]; return n })
                }} />
                {errors[field.id] && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={12} className="text-red-500" />
                    <p className="text-xs text-red-500">{errors[field.id]}</p>
                  </div>
                )}
              </div>
            )
          })}

          {/* Submit block */}
          <div className="bg-white rounded-2xl border border-brand-200 shadow-sm p-5">
            <p className="text-xs text-brand-500 leading-relaxed mb-4">
              By submitting this form, you confirm that all information provided is accurate and complete.
              This submission is legally binding and will form part of your official records at{' '}
              <strong>{mockOrg.name}</strong>.
            </p>

            {Object.keys(errors).length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-600">
                  <strong>Please complete all required fields:</strong>{' '}
                  {Object.values(errors).join(', ')}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-brand-900 text-white font-bold py-3.5 rounded-xl hover:bg-brand-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-900/20 hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting securely...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Submit Form
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-brand-400 pb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield size={10} /> Secured by <strong className="text-brand-600">DONE</strong> · Sybella Systems
          </div>
          <div>Request ID: <code className="font-mono">{request.uniqueId}</code></div>
        </div>
      </div>
    </div>
  )
}
