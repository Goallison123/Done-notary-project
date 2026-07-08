import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Invalid credentials. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50/50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-gradient-to-br from-brand-900 via-brand-900 to-brand-800 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
              <CheckSquare size={22} className="text-teal-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
          </div>
          <div className="space-y-8">
            <h1 className="text-4xl font-bold leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Secure digital records for professional offices.
            </h1>
            <p className="text-brand-300 text-lg leading-relaxed">
              Replace paper client registers with secure, searchable digital records. Trusted by notary offices across Rwanda.
            </p>
          </div>
        </div>
        <div className="relative space-y-5">
          {[
            { icon: Sparkles, label: 'QR Code check-in' },
            { icon: Mail, label: 'Real-time queue management' },
            { icon: CheckSquare, label: 'MINIJUST-compliant exports' },
            { icon: Lock, label: 'Digital signatures & audit logs' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-4 text-base text-brand-300">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <f.icon size={18} className="text-teal-400" />
              </div>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/20">
              <CheckSquare size={18} className="text-teal-400" />
            </div>
            <span className="text-xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</h2>
            <p className="text-base text-brand-500 mt-2">Sign in to your notary office account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@notaryoffice.rw"
              required
              prefix={<Mail size={16} />}
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              prefix={<Lock size={16} />}
              suffix={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-brand-400 hover:text-brand-700 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" variant="primary" className="w-full" size="lg" loading={loading} iconRight={<ArrowRight size={18} />}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-brand-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Register your office
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold mb-1">Built by Bessora</p>
            <p className="text-sm text-brand-500">Digital Notary Platform for Rwanda</p>
          </div>
        </div>
      </div>
    </div>
  )
}
