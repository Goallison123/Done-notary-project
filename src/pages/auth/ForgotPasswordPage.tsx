import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
            <CheckSquare size={16} className="text-teal-500" />
          </div>
          <span className="font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-200 shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-brand-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Check your email</h2>
              <p className="text-sm text-brand-500 mb-6">
                We sent a password reset link to <strong className="text-brand-700">{email}</strong>
              </p>
              <Link to="/login">
                <Button variant="outline" icon={<ArrowLeft size={14} />} className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-brand-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reset your password</h2>
              <p className="text-sm text-brand-500 mb-6">Enter your email and we&apos;ll send you a reset link.</p>
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
                <Button type="submit" variant="primary" loading={loading} className="w-full">
                  Send reset link
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-brand-500 hover:text-brand-700 flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
