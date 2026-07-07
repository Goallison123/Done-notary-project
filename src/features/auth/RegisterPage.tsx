import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Select from '@/shared/ui/Select'

const countries = [
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'DRC', label: 'DR Congo' },
  { value: 'Other', label: 'Other' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    orgName: '', orgEmail: '', orgPhone: '', orgAddress: '', orgCountry: 'Rwanda',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true)
    try {
      await register(form as Parameters<typeof register>[0])
      navigate('/dashboard')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50/50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 bg-brand-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/20">
            <CheckSquare size={20} className="text-teal-400" />
          </div>
          <span className="text-xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
        </div>

        <div className="bg-white rounded-3xl border border-brand-100 shadow-xl p-10">
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-brand-100'}`} />
            ))}
          </div>

          <h2 className="text-2xl font-extrabold text-brand-900 mb-2 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {step === 1 ? 'Create your account' : 'Set up your organization'}
          </h2>
          <p className="text-base text-brand-500 mb-8">
            {step === 1 ? 'Enter your personal details to get started' : 'Tell us about your organization'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Amara Uwimana" required />
                <Input label="Work Email" type="email" value={form.email} onChange={set('email')} placeholder="you@organization.rw" required />
                <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
                <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter password" required />
              </>
            ) : (
              <>
                <Input label="Organization Name" value={form.orgName} onChange={set('orgName')} placeholder="Kigali Notary Office" required />
                <Input label="Organization Email" type="email" value={form.orgEmail} onChange={set('orgEmail')} placeholder="info@organization.rw" required />
                <Input label="Phone Number" type="tel" value={form.orgPhone} onChange={set('orgPhone')} placeholder="+250 788 000 000" required />
                <Input label="Address" value={form.orgAddress} onChange={set('orgAddress')} placeholder="KG 7 Ave, Kigali" required />
                <Select label="Country" value={form.orgCountry} onChange={set('orgCountry')} options={countries} required />
              </>
            )}

            <div className="flex gap-4 pt-3">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft size={18} />} size="lg" className="flex-1">
                  Back
                </Button>
              )}
              <Button type="submit" variant="primary" loading={loading} iconRight={<ArrowRight size={18} />} size="lg" className="flex-1">
                {step === 1 ? 'Continue' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-brand-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
