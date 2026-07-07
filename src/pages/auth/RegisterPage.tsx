import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

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
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
            <CheckSquare size={16} className="text-teal-500" />
          </div>
          <span className="font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-brand-200'}`} />
            ))}
          </div>

          <h2 className="text-xl font-bold text-brand-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {step === 1 ? 'Create your account' : 'Set up your organization'}
          </h2>
          <p className="text-sm text-brand-500 mb-6">
            {step === 1 ? 'Enter your personal details' : 'Tell us about your organization'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft size={16} />} className="flex-1">
                  Back
                </Button>
              )}
              <Button type="submit" variant="primary" loading={loading} iconRight={<ArrowRight size={16} />} className="flex-1">
                {step === 1 ? 'Continue' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-brand-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
