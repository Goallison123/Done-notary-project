import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare, ArrowRight, Check, Shield, Zap, Globe,
  FileText, Users, BarChart3, ChevronDown,
  Menu, X, Phone, Mail, MapPin, Pen, MessageSquare,
  Lock, Sparkles, Building2, Scale, TrendingUp,
  Clock, Search, Play,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-teal-400" />
            </div>
            <span className="font-semibold text-slate-900 text-lg">DONE</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
            >
              Start free trial
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-white">
          <div className="pt-20 px-6 pb-8">
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileOpen(false)} className="text-lg text-slate-900 py-2">Features</a>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-lg text-slate-900 py-2">How it works</a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-lg text-slate-900 py-2">Pricing</a>
              <a href="#faq" onClick={() => setMobileOpen(false)} className="text-lg text-slate-900 py-2">FAQ</a>
              <hr className="my-4 border-slate-100" />
              <Link to="/login" className="text-lg text-slate-600 py-2">Sign in</Link>
              <Link to="/register" className="text-center text-white bg-slate-900 py-3 rounded-lg text-lg font-medium">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
              Now live across 12 notary offices in Rwanda
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Digital records for professional offices
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Replace paper client registers with secure, searchable digital records.
              Staff create requests, clients fill forms via SMS—no app required.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start free trial <ArrowRight size={16} />
              </Link>
              <Link
                to="/submit/tok_demo123"
                className="flex items-center gap-2 text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium transition-all"
              >
                <Play size={16} /> View demo
              </Link>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl blur-3xl opacity-60" />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-400 font-mono ml-2">
                  kigalinotary.done.rw/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900">148</div>
                    <div className="text-xs text-slate-500 mt-1">Total Clients</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900">12</div>
                    <div className="text-xs text-slate-500 mt-1">Pending</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900">234</div>
                    <div className="text-xs text-slate-500 mt-1">Completed</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 60, 90, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* Recent items */}
                <div className="space-y-2">
                  {[
                    { name: 'Emmanuel Nkurunziza', type: 'Property Transfer', status: 'Submitted' },
                    { name: 'Marie-Claire Uwase', type: 'Affidavit', status: 'Pending' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.type}</div>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -right-4 top-20 bg-white border border-slate-200 rounded-xl shadow-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Check size={16} className="text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Form submitted</div>
                <div className="text-xs text-slate-500">Just now</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// LOGOS SECTION
// ═══════════════════════════════════════════════════════════════════

function LogosSection() {
  const industries = [
    { icon: Scale, label: 'Notary Offices' },
    { icon: Building2, label: 'Law Firms' },
    { icon: TrendingUp, label: 'Accounting' },
    { icon: Globe, label: 'NGOs' },
    { icon: Users, label: 'Government' },
  ]

  return (
    <section className="py-16 px-6 border-y border-slate-100">
      <div className="w-full max-w-7xl mx-auto">
        <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-widest mb-8">
          Built for professional offices across East Africa
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {industries.map((ind) => (
            <div key={ind.label} className="flex items-center gap-2 text-slate-500">
              <ind.icon size={16} />
              <span className="text-sm font-medium">{ind.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STATS SECTION
// ═══════════════════════════════════════════════════════════════════

function StatsSection() {
  const stats = [
    { value: '500+', label: 'Documents processed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<3s', label: 'Form load time' },
    { value: '24/7', label: 'Support available' },
  ]

  return (
    <section className="py-24 px-6 bg-slate-900">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FEATURES SECTION
// ═══════════════════════════════════════════════════════════════════

function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: 'Dynamic form builder',
      description: 'Create custom forms with 12+ field types including text, phone, national ID, file uploads, and digital signatures.',
    },
    {
      icon: MessageSquare,
      title: 'SMS delivery',
      description: 'Clients receive a secure link via SMS. No app download, no account creation, no friction.',
    },
    {
      icon: Shield,
      title: 'Enterprise security',
      description: 'End-to-end encryption, secure document storage, and complete audit trails for compliance.',
    },
    {
      icon: Search,
      title: 'Instant search',
      description: 'Find any client or record in milliseconds using name, phone, or national ID.',
    },
    {
      icon: Users,
      title: 'Role-based access',
      description: 'Owner, administrator, receptionist, reviewer, and viewer roles with specific permissions.',
    },
    {
      icon: BarChart3,
      title: 'Analytics dashboard',
      description: 'Real-time insights on client volume, submission rates, and staff activity.',
    },
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-blue-600 mb-4">Features</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Everything you need to go paperless
          </h2>
          <p className="text-lg text-slate-600">
            A complete platform for collecting, verifying, and organizing client records—purpose-built for professional offices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-5">
                <feature.icon size={18} className="text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// HOW IT WORKS SECTION
// ═══════════════════════════════════════════════════════════════════

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Staff creates request',
      description: 'Select a form category, enter the client\'s phone number, and send.',
    },
    {
      number: '02',
      title: 'Client receives SMS',
      description: 'A secure, unique link arrives—no app, no account needed.',
    },
    {
      number: '03',
      title: 'Client fills form',
      description: 'Complete the form, upload documents, and sign digitally.',
    },
    {
      number: '04',
      title: 'Records secured',
      description: 'Submissions become part of your permanent digital records.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-slate-50">
      <div className="w-full max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-teal-600 mb-4">How it works</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Four steps to digital records
          </h2>
          <p className="text-lg text-slate-600">
            From paper registers to permanent digital records in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              <div className="bg-white border border-slate-200 rounded-xl p-8 h-full">
                <div className="text-5xl font-bold text-slate-100 mb-4">{step.number}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t border-slate-300" />
              )}
            </div>
          ))}
        </div>

        {/* SMS Preview */}
        <div className="mt-16 max-w-sm mx-auto">
          <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl">
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 text-center text-xs text-slate-400 font-mono">
                Messages
              </div>
              <div className="p-4">
                <div className="text-xs text-slate-400 text-center mb-2 font-medium">
                  DONE | Kigali Notary Office
                </div>
                <div className="bg-slate-900 text-white rounded-xl rounded-tl-sm p-4 text-sm leading-relaxed">
                  <div className="mb-2">Hello! You have a form to complete:</div>
                  <div className="text-teal-400 underline break-all text-xs mb-2">
                    done.rw/submit/tok...
                  </div>
                  <div className="text-slate-400 text-xs">Expires in 7 days</div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                  <Clock size={10} /> Delivered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION
// ═══════════════════════════════════════════════════════════════════

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "We went from 3 paper registers weekly to instant digital search. It transformed how we operate.",
      author: "Amara Uwimana",
      role: "Head Notary, Kigali Notary Office",
    },
    {
      quote: "Clients love the SMS link approach—no app, no login, just a simple form on their phone.",
      author: "Jean-Pierre Habimana",
      role: "Partner, JP Legal Associates",
    },
    {
      quote: "Searching by national ID is instant now. The dashboard gives us complete visibility.",
      author: "Vestine Ingabire",
      role: "Administrator, Northern Province NGO",
    },
  ]

  return (
    <section className="py-24 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Trusted by offices across Rwanda
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.author} className="bg-slate-50 border border-slate-100 rounded-xl p-8">
              <p className="text-slate-700 leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <div className="font-semibold text-slate-900">{t.author}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRICING SECTION
// ═══════════════════════════════════════════════════════════════════

function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '15,000',
      description: 'For small offices',
      features: ['3 staff accounts', '50 requests/month', '5 form categories', '1 GB storage', 'Email support'],
      cta: 'Start free trial',
    },
    {
      name: 'Professional',
      price: '45,000',
      description: 'For growing offices',
      features: ['10 staff accounts', 'Unlimited requests', 'Unlimited categories', '20 GB storage', 'Real SMS delivery', 'Priority support', 'Audit log'],
      cta: 'Get started',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['Unlimited staff', 'Unlimited everything', 'API access', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
      cta: 'Contact sales',
    },
  ]

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50">
      <div className="w-full max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600">
            14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-xl border ${
                plan.featured
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="mb-6">
                <div className={`text-sm font-medium mb-1 ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>
                  {plan.name}
                </div>
                <div className={`text-4xl font-bold ${plan.featured ? 'text-white' : 'text-slate-900'}`}>
                  {plan.price === 'Custom' ? plan.price : `${plan.price} RWF`}
                </div>
                {plan.price !== 'Custom' && (
                  <div className={`text-sm ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>
                    per month
                  </div>
                )}
              </div>

              <p className={`text-sm mb-6 ${plan.featured ? 'text-slate-300' : 'text-slate-600'}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check size={14} className={plan.featured ? 'text-teal-400' : 'text-slate-400'} />
                    <span className={plan.featured ? 'text-slate-200' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block text-center py-3 rounded-lg font-medium ${
                  plan.featured
                    ? 'bg-white text-slate-900 hover:bg-slate-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                } transition-colors`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FAQ SECTION
// ═══════════════════════════════════════════════════════════════════

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Do clients need to create an account?',
      a: 'No. Clients receive a secure link via SMS and can complete the form directly—no app download, no account creation required.',
    },
    {
      q: 'How secure are submissions?',
      a: 'All data is encrypted in transit and at rest. Each link is unique, time-limited, and deactivated after submission.',
    },
    {
      q: 'Can I customize the forms?',
      a: 'Yes. Create unlimited categories with custom fields including text, phone, national ID, file uploads, and digital signatures.',
    },
    {
      q: 'Is this built for Rwanda?',
      a: 'Yes. DONE supports Rwandan phone formats, national ID validation, RWF pricing, and SMS via Africa\'s Talking.',
    },
    {
      q: 'Can I export my data?',
      a: 'Yes. Export all records, documents, and submission data as PDF or CSV for compliance and archiving.',
    },
  ]

  return (
    <section id="faq" className="py-24 px-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-slate-900">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-slate-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════════════

function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-2xl p-12 lg:p-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to go paperless?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Join offices across Rwanda moving from paper registers to secure digital records.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════

function Footer() {
  return (
    <footer className="border-t border-slate-100 py-12 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <CheckSquare size={16} className="text-teal-400" />
              </div>
              <span className="font-semibold text-slate-900 text-lg">DONE</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              Secure client intake for professional offices. A product of Sybella Systems.
            </p>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Product</div>
            <div className="space-y-3">
              <a href="#features" className="block text-sm text-slate-600 hover:text-slate-900">Features</a>
              <a href="#pricing" className="block text-sm text-slate-600 hover:text-slate-900">Pricing</a>
              <a href="#" className="block text-sm text-slate-600 hover:text-slate-900">Security</a>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Company</div>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-slate-600 hover:text-slate-900">About</a>
              <a href="#" className="block text-sm text-slate-600 hover:text-slate-900">Blog</a>
              <a href="#" className="block text-sm text-slate-600 hover:text-slate-900">Careers</a>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Legal</div>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-slate-600 hover:text-slate-900">Privacy</a>
              <a href="#" className="block text-sm text-slate-600 hover:text-slate-900">Terms</a>
              <a href="#" className="block text-sm text-slate-600 hover:text-slate-900">Cookies</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            © 2024 Sybella Systems Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={14} />
            <span>Kigali, Rwanda</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <LogosSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
