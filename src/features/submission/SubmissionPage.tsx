import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckSquare, Upload, X, CheckCircle, AlertCircle, Pen,
  Shield, Lock, Clock, ChevronRight,
} from 'lucide-react'
import { useApp } from '@/shared/context/AppContext'
import { useAuth } from '@/shared/context/AuthContext'
import type { FormField } from '@/types'

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
      <div className="border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-white relative" style={{ height: 160 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full sig-canvas cursor-crosshair"
          style={{ display: 'block', height: 160 }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        />
        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-slate-300">
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
          dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
        }`}
      >
        <Upload size={22} className={`mx-auto mb-2 ${dragging ? 'text-blue-500' : 'text-slate-300'}`} />
        <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
        <p className="text-xs text-slate-400 mt-1">
          PDF, JPG, PNG - Max {max} file{max !== 1 ? 's' : ''} - 10 MB each
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
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 font-mono uppercase flex-shrink-0">
                {f.name.split('.').pop()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">{f.name}</div>
                <div className="text-xs text-slate-400">{formatSize(f.size)}</div>
              </div>
              <button onClick={() => remove(i)} className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DynamicField({ field, value, onChange }: { field: FormField; value: unknown; onChange: (v: unknown) => void }) {
  const base = 'w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'

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
            <label key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${value === o.value ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="text-blue-600" />
              <span className="text-sm text-slate-700 font-medium">{o.label}</span>
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
              <label key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <input type="checkbox" value={o.value} checked={checked} onChange={e => {
                  const arr = (value as string[] || [])
                  onChange(e.target.checked ? [...arr, o.value] : arr.filter(v => v !== o.value))
                }} className="rounded text-blue-600" />
                <span className="text-sm text-slate-700 font-medium">{o.label}</span>
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

export default function SubmissionPage() {
  const { token } = useParams()
  const { requests, updateRequest, categories } = useApp()
  const { org } = useAuth()

  const orgName = org?.name || 'DONE Notary'

  const request = requests.find(r => r.token === token)
  const categoryFields = request
    ? (categories.find(c => c.id === request.categoryId)?.fields || []).sort((a, b) => a.order - b.order)
    : []

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [signature, setSignature] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={30} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link not found</h1>
          <p className="text-sm text-slate-500 leading-relaxed">This link is invalid or no longer exists. Please contact the office for assistance.</p>
        </div>
      </div>
    )
  }

  if (request.status === 'submitted' || request.status === 'reviewed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Already submitted</h1>
          <p className="text-sm text-slate-500 leading-relaxed">Your form was already received successfully. The office will contact you if they need anything further.</p>
        </div>
      </div>
    )
  }

  const completedFields = categoryFields.filter(f => f.type === 'file_upload' || f.type === 'signature' ? true : !!formData[f.id]).length
  const progress = categoryFields.length > 0 ? Math.round((completedFields / categoryFields.length) * 100) : 0

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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Submitted!</h1>
            <p className="text-slate-600 leading-relaxed">Your information has been securely received by <strong className="text-slate-800">{orgName}</strong>.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Reference ID</span>
              <span className="font-mono font-bold text-slate-900">{request.uniqueId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Form type</span>
              <span className="text-slate-700">{request.categoryName}</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
            <strong className="block mb-1">What happens next?</strong>
            The team at {orgName} will review your submission and contact you within 1-3 business days.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
              <CheckSquare size={13} className="text-teal-400" />
            </div>
            <span className="text-sm font-bold text-slate-900 hidden sm:block">{orgName}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="truncate">{request.categoryName}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{request.categoryName}</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">Please complete all required fields and submit. Your information is encrypted and only accessible by {orgName} staff.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {categoryFields.map(field => (
            <div key={field.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.helpText && <p className="text-xs text-slate-500 mb-2">{field.helpText}</p>}
              {field.type === 'file_upload' ? (
                <FileUploadField field={field} onFiles={files => setFormData(p => ({ ...p, [field.id]: files }))} />
              ) : field.type === 'signature' ? (
                <SignatureCanvas onSave={setSignature} />
              ) : (
                <DynamicField field={field} value={formData[field.id]} onChange={v => {
                  setFormData(p => ({ ...p, [field.id]: v }))
                  if (errors[field.id]) setErrors(p => { const n = { ...p }; delete n[field.id]; return n })
                }} />
              )}
              {errors[field.id] && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle size={12} className="text-red-500" />
                  <p className="text-xs text-red-500">{errors[field.id]}</p>
                </div>
              )}
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              By submitting this form, you confirm that all information provided is accurate and complete. This submission is legally binding and will form part of your official records at <strong>{orgName}</strong>.
            </p>

            {Object.keys(errors).length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-600">
                  <strong>Please complete all required fields:</strong> {Object.values(errors).join(', ')}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
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

        <div className="text-center text-xs text-slate-400 pb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield size={10} /> Secured by <strong className="text-slate-600">DONE</strong>
          </div>
          <div>Request ID: <code className="font-mono">{request.uniqueId}</code></div>
        </div>
      </div>
    </div>
  )
}
