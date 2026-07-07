import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('amara@kigalinotary.rw')
  const [password, setPassword] = useState('password')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-brand-900 p-10 text-white">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <CheckSquare size={18} className="text-teal-400" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Secure digital records for professional offices.
            </h1>
            <p className="text-brand-400 text-sm leading-relaxed">
              Replace paper client registers with secure, searchable digital records. Trusted by notary offices across Rwanda.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { icon: '🔐', label: 'End-to-end secure submissions' },
            { icon: '📱', label: 'SMS-delivered client links' },
            { icon: '📋', label: 'Dynamic form builder' },
            { icon: '✍️', label: 'Digital signatures & document upload' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 text-sm text-brand-400">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-teal-500" />
            </div>
            <span className="font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</h2>
            <p className="text-sm text-brand-500 mt-1">Sign in to your organization account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@organization.rw"
              required
              prefix={<Mail size={14} />}
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              prefix={<Lock size={14} />}
              suffix={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-brand-400 hover:text-brand-700">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" variant="primary" className="w-full" size="lg" loading={loading} iconRight={<ArrowRight size={16} />}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-brand-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Register your organization
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-brand-50 border border-brand-100">
            <p className="text-xs text-brand-500 font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-brand-400 font-mono">amara@kigalinotary.rw / any password</p>
          </div>
        </div>
      </div>
    </div>
  )
}
