import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare, ArrowRight, CheckCircle, Shield, Zap, Globe,
  FileText, Users, BarChart3, Star, ChevronDown,
  Menu, X, Phone, Mail, MapPin, Pen, MessageSquare,
  Lock, Sparkles, Building2, Scale, TrendingUp,
  Clock, Upload, Search, ChevronRight,
} from 'lucide-react'

/* ─── Animated counter ──────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 1600
        const startTime = Date.now()
        const tick = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(to * ease))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── Navbar ─────────────────────────────────────── */
function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-brand-200/80 shadow-sm shadow-brand-900/5' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center shadow-md">
            <CheckSquare size={15} className="text-teal-400" />
          </div>
          <span className="font-bold text-brand-900 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            DONE
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
          ].map(item => (
            <a key={item.label} href={item.href}
              className="px-3 py-2 text-sm text-brand-600 hover:text-brand-900 rounded-lg hover:bg-brand-100 transition-all">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link to="/login" className="text-sm font-medium text-brand-700 hover:text-brand-900 px-3 py-2 rounded-lg hover:bg-brand-100 transition-all">
            Sign in
          </Link>
          <Link to="/register"
            className="flex items-center gap-1.5 bg-brand-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20 hover:shadow-brand-900/30">
            Start free trial <ArrowRight size={14} />
          </Link>
        </div>

        <button className="md:hidden ml-auto p-2 rounded-lg hover:bg-brand-100 text-brand-700 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-brand-200 px-6 pb-4 space-y-1 shadow-lg">
          {['Features', 'How It Works', 'Pricing', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="block px-3 py-2.5 text-sm font-medium text-brand-700 rounded-xl hover:bg-brand-50" onClick={() => setMenuOpen(false)}>
              {item}
            </a>
          ))}
          <div className="pt-3 border-t border-brand-100 flex flex-col gap-2">
            <Link to="/login" className="w-full text-center py-2.5 border border-brand-200 rounded-xl text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors">Sign in</Link>
            <Link to="/register" className="w-full text-center py-2.5 bg-brand-900 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">Start free trial</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ─── Features ───────────────────────────────────── */
const features = [
  {
    icon: FileText, title: 'Dynamic Form Builder',
    desc: 'Create unlimited form categories with 12+ field types. Drag-and-drop reordering. Customize for any document type your office handles.',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
  },
  {
    icon: MessageSquare, title: 'SMS Client Links',
    desc: 'No client accounts. No logins. Staff create a request, the client gets a secure unique link via SMS and fills the form directly.',
    color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100',
  },
  {
    icon: Pen, title: 'Digital Signatures',
    desc: 'Clients sign directly on their phone. Signatures captured as images and permanently attached to the submission record.',
    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100',
  },
  {
    icon: Shield, title: 'Secure Document Storage',
    desc: 'PDF, JPG, and PNG uploads stored with enterprise-grade security. Preview and download any time, fully access-controlled.',
    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
  },
  {
    icon: BarChart3, title: 'Analytics Dashboard',
    desc: 'Real-time insights on client volumes, request trends, submission rates, and staff activity — all in one view.',
    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
  },
  {
    icon: Search, title: 'Instant Search',
    desc: 'Find any client by name, phone, or national ID in milliseconds. Full-text search across all records and submissions.',
    color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100',
  },
  {
    icon: Users, title: 'Role-Based Access',
    desc: 'Owner, Administrator, Receptionist, Reviewer, Viewer. Fine-grained access control so each staff member sees only what they need.',
    color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
  },
  {
    icon: Globe, title: 'Multi-Office Architecture',
    desc: 'Built for notary offices, designed for law firms, accounting offices, NGOs, and government services. Expand without rebuilding.',
    color: 'text-brand-600', bg: 'bg-brand-100', border: 'border-brand-200',
  },
  {
    icon: Lock, title: 'Audit Trail',
    desc: 'Every action logged: who created, viewed, edited, or downloaded — with timestamps and IP addresses for full accountability.',
    color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
  },
]

/* ─── How it works ───────────────────────────────── */
const steps = [
  {
    n: '01', icon: FileText, title: 'Staff Creates Request',
    desc: 'Select the form category, enter the client\'s phone number, add any notes. Hit send.',
    color: 'text-blue-500', bg: 'bg-blue-500',
  },
  {
    n: '02', icon: MessageSquare, title: 'Client Gets SMS',
    desc: 'A secure unique link arrives via SMS — no app download, no account, no login needed.',
    color: 'text-teal-500', bg: 'bg-teal-500',
  },
  {
    n: '03', icon: Pen, title: 'Client Fills the Form',
    desc: 'Client opens the link, fills required information, uploads documents, signs digitally.',
    color: 'text-violet-500', bg: 'bg-violet-500',
  },
  {
    n: '04', icon: CheckCircle, title: 'Records are Secured',
    desc: 'Submission instantly becomes part of your permanent, searchable digital records.',
    color: 'text-green-500', bg: 'bg-green-500',
  },
]

/* ─── Pricing ────────────────────────────────────── */
const plans = [
  {
    name: 'Starter', priceRWF: 15000, pricePeriod: '/month',
    desc: 'For small offices getting started',
    features: ['3 staff accounts', '50 requests / month', '5 form categories', '1 GB storage', 'Mock SMS', 'Email support'],
    cta: 'Start free trial', popular: false, highlight: false,
  },
  {
    name: 'Professional', priceRWF: 45000, pricePeriod: '/month',
    desc: 'For growing offices with higher volume',
    features: ['10 staff accounts', 'Unlimited requests', 'Unlimited categories', '20 GB storage', 'Real SMS delivery', 'Priority support', 'Audit log', 'Custom branding'],
    cta: 'Get started', popular: true, highlight: true,
  },
  {
    name: 'Enterprise', priceRWF: null, pricePeriod: '',
    desc: 'For large organizations with custom needs',
    features: ['Unlimited staff', 'Unlimited everything', 'Custom subdomain', 'API access', 'Dedicated manager', 'SLA guarantee', 'Custom integrations', 'On-premise option'],
    cta: 'Contact us', popular: false, highlight: false,
  },
]

/* ─── Testimonials ───────────────────────────────── */
const testimonials = [
  {
    quote: "We used to fill 3 registers per week. Now everything is digital and searchable. DONE changed how we operate.",
    name: "Amara Uwimana", title: "Head Notary, Kigali Notary Office",
    initials: "AU",
  },
  {
    quote: "Our clients love that they can complete forms from their phones. The SMS link is genius — no app, no login.",
    name: "Jean-Pierre Habimana", title: "Managing Partner, JP Legal Associates",
    initials: "JP",
  },
  {
    quote: "The dashboard gives us a complete picture of client activity. Searching by national ID is incredibly fast.",
    name: "Vestine Ingabire", title: "Office Administrator, Northern Province NGO",
    initials: "VI",
  },
]

/* ─── FAQs ───────────────────────────────────────── */
const faqs = [
  {
    q: 'Do clients need to create an account?',
    a: 'No. Clients never create accounts. They receive a secure link via SMS, open it, fill the form, and submit. That\'s it — no app download, no registration.',
  },
  {
    q: 'How secure are client submissions?',
    a: 'All submissions are encrypted in transit (TLS 1.3) and at rest (AES-256). Each link is unique, time-limited, and deactivated after submission. Your data never leaves your organization\'s namespace.',
  },
  {
    q: 'Can I customize the forms completely?',
    a: 'Yes. Create unlimited categories with custom field types: short text, long text, numbers, phone, email, date, national ID, dropdowns, radio buttons, checkboxes, file uploads, and digital signatures. Reorder fields with drag-and-drop.',
  },
  {
    q: 'Is DONE built specifically for Rwanda?',
    a: 'DONE was purpose-built for Rwandan notary offices — local phone formats, Rwandan national ID formatting, RWF pricing, and SMS via Africa\'s Talking. It\'s also ready for any professional office across East Africa.',
  },
  {
    q: 'Which SMS providers do you support?',
    a: "Africa's Talking (recommended for Rwanda/East Africa), Twilio (global), and a built-in mock mode for development and testing. Switching providers takes one setting change.",
  },
  {
    q: 'Can I export or download records?',
    a: 'Yes. All client records, document files, and submission data can be exported. We support PDF report generation and CSV data exports for compliance and archiving.',
  },
  {
    q: 'What happens if the link expires?',
    a: 'You can configure link expiration (1–30 days). If a link expires before submission, your staff can instantly create a new one. Expired links become permanently inactive.',
  },
]

/* ─── Industry logos ──────────────────────────────── */
const industries = [
  { icon: Scale, label: 'Notary Offices' },
  { icon: Building2, label: 'Law Firms' },
  { icon: TrendingUp, label: 'Accounting Firms' },
  { icon: Globe, label: 'NGOs' },
  { icon: Users, label: 'Government Services' },
  { icon: FileText, label: 'Immigration Consultants' },
]

/* ─── Main ───────────────────────────────────────── */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <NavBar />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-24 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(37,99,235,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_80%,rgba(20,184,166,0.06),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/80 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 shadow-sm">
                <Sparkles size={11} className="text-blue-500" />
                Now in pilot with 12 notary offices across Rwanda
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-brand-900 leading-[1.08] mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Collect. Verify.<br />
                Organize.{' '}
                <span className="relative">
                  <span className="relative z-10 text-blue-600">Done.</span>
                  <span className="absolute inset-x-0 bottom-1 h-3 bg-blue-100 -z-0 rounded" />
                </span>
              </h1>

              <p className="text-xl text-brand-600 leading-relaxed mb-8 max-w-lg">
                Replace paper client registers with secure digital records. Staff create requests, clients fill forms via SMS link — no app, no account needed.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/register"
                  className="flex items-center gap-2 bg-brand-900 text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/20 hover:shadow-brand-900/30 hover:-translate-y-0.5 active:translate-y-0">
                  Start free trial <ArrowRight size={16} />
                </Link>
                <Link to="/submit/tok_abc123xyz"
                  className="flex items-center gap-2 bg-white border-2 border-brand-200 text-brand-700 font-semibold px-7 py-3.5 rounded-2xl hover:border-brand-300 hover:bg-brand-50 transition-all hover:-translate-y-0.5">
                  View demo form
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['AU', 'JP', 'CM', 'VI', 'RH'].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-brand-600">
                  <span className="font-semibold text-brand-900">50+ offices</span> already digitized their records
                </div>
              </div>
            </div>

            {/* Right — app preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-teal-100/30 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-3xl border border-brand-200 shadow-2xl shadow-brand-900/10 overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border-b border-brand-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white border border-brand-200 rounded-lg px-3 py-1 text-xs text-brand-400 font-mono">
                    kigalinotary.done.rw/dashboard
                  </div>
                </div>

                {/* Dashboard mini-preview */}
                <div className="p-4 space-y-3">
                  {/* Stat row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Total Clients', value: '148', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Pending', value: '12', color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Completed', value: '234', color: 'text-green-600', bg: 'bg-green-50' },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                        <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                        <div className="text-[10px] text-brand-500 leading-tight">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="bg-brand-50 rounded-xl p-3 h-20 flex items-end gap-1">
                    {[40, 65, 45, 80, 60, 90, 55].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                        <div className="w-full rounded-sm bg-blue-400/30" style={{ height: `${h * 0.5}px` }} />
                        <div className="w-full rounded-sm bg-teal-400/50" style={{ height: `${h * 0.35}px` }} />
                      </div>
                    ))}
                  </div>

                  {/* Recent list */}
                  <div className="space-y-1.5">
                    {[
                      { name: 'Nkurunziza Emmanuel', cat: 'Property Transfer', status: 'Submitted', sc: 'text-green-600 bg-green-50' },
                      { name: 'Uwase Marie-Claire', cat: 'Affidavit', status: 'Pending', sc: 'text-amber-600 bg-amber-50' },
                      { name: 'Hakizimana Robert', cat: 'Power of Attorney', status: 'Reviewed', sc: 'text-blue-600 bg-blue-50' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold flex-shrink-0">
                          {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-brand-800 truncate">{r.name}</div>
                          <div className="text-[10px] text-brand-400 truncate">{r.cat}</div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.sc}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -right-4 top-16 bg-white border border-brand-200 rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={14} className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-900">Form Submitted</div>
                  <div className="text-[10px] text-brand-400">Nkurunziza · 2m ago</div>
                </div>
              </div>

              <div className="absolute -left-4 bottom-20 bg-white border border-brand-200 rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare size={14} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-900">SMS Sent</div>
                  <div className="text-[10px] text-brand-400">+250 788 *** *** · Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-brand-100 bg-brand-50/50 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: 500, suffix: '+', label: 'Documents processed' },
            { value: 12, suffix: '', label: 'Offices piloting now' },
            { value: 99, suffix: '.9%', label: 'Platform uptime' },
            { value: 3, suffix: 's', label: 'Avg. form load time' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <div className="text-3xl font-bold text-brand-900 font-mono">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-brand-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-brand-400 uppercase tracking-widest mb-8">
            Built for professional offices across East Africa
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {industries.map(ind => (
              <div key={ind.label} className="flex items-center gap-2.5 px-4 py-2.5 border border-brand-200 rounded-full bg-white hover:bg-brand-50 hover:border-brand-300 transition-all">
                <ind.icon size={15} className="text-brand-500" />
                <span className="text-sm font-medium text-brand-700">{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6 bg-brand-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl font-bold text-brand-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Everything your office needs
            </h2>
            <p className="text-brand-600 max-w-xl mx-auto text-lg">
              Replace physical registers with a platform that's faster, safer, and more searchable than any filing cabinet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title}
                className={`group p-6 bg-white border ${f.border} rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default`}>
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="text-sm font-bold text-brand-900 mb-2">{f.title}</h3>
                <p className="text-sm text-brand-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-4xl font-bold text-brand-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Four steps. That's it.
            </h2>
            <p className="text-brand-600 max-w-xl mx-auto text-lg">
              From paper registers to permanent digital records in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.n} className="relative flex flex-col">
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute left-full top-10 w-full items-center z-0 -translate-y-0.5 px-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-brand-200 to-brand-100" />
                    <ChevronRight size={12} className="text-brand-300 -ml-2 flex-shrink-0" />
                  </div>
                )}
                <div className="relative z-10 bg-white border-2 border-brand-100 rounded-2xl p-5 flex-1 hover:border-brand-200 hover:shadow-md transition-all">
                  <div className={`w-11 h-11 ${step.bg} rounded-xl flex items-center justify-center mb-4 text-white shadow-sm`}>
                    <step.icon size={19} />
                  </div>
                  <div className="text-xs font-bold text-brand-300 font-mono mb-1">{step.n}</div>
                  <h3 className="text-sm font-bold text-brand-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-brand-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SMS Preview Card */}
          <div className="mt-12 max-w-sm mx-auto">
            <div className="bg-brand-900 rounded-3xl p-4 shadow-2xl">
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="bg-brand-800 px-4 py-2 text-center">
                  <div className="text-xs text-brand-400 font-mono">Messages</div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-xs text-brand-400 text-center">DONE | Kigali Notary Office</div>
                  <div className="bg-brand-900 text-white rounded-2xl rounded-tl-sm p-3 text-xs leading-relaxed">
                    Hello Emmanuel! You have a <strong>Property Transfer</strong> form to complete. Open your secure form here:<br />
                    <span className="text-teal-300 break-all">done.rw/submit/tok_abc...</span><br />
                    <span className="text-brand-400">Expires in 7 days. Do not share.</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-brand-400">
                    <Clock size={10} /> Just now · Delivered
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 bg-brand-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Trusted by offices</p>
            <h2 className="text-3xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              What our users say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-brand-700 leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-brand-900">{t.name}</div>
                    <div className="text-xs text-brand-500">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-brand-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Simple, transparent pricing
            </h2>
            <p className="text-brand-600 text-lg">14-day free trial on all plans. No credit card required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map(plan => (
              <div key={plan.name} className={`relative rounded-3xl border p-7 flex flex-col transition-all ${
                plan.highlight
                  ? 'border-blue-500 bg-brand-900 text-white shadow-2xl shadow-brand-900/30 scale-105'
                  : 'border-brand-200 bg-white hover:shadow-lg hover:border-brand-300'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                    <Sparkles size={10} /> Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-brand-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-brand-500'}`}>{plan.desc}</p>
                </div>

                <div className="mb-7">
                  {plan.priceRWF != null ? (
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold font-mono ${plan.highlight ? 'text-white' : 'text-brand-900'}`}>
                        {plan.priceRWF.toLocaleString()}
                      </span>
                      <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-brand-500'}`}>RWF{plan.pricePeriod}</span>
                    </div>
                  ) : (
                    <div className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-brand-900'}`}>Custom</div>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? 'text-blue-100' : 'text-brand-600'}`}>
                      <CheckCircle size={14} className={plan.highlight ? 'text-teal-400' : 'text-green-500'} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to="/register"
                  className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/30'
                      : 'bg-brand-900 text-white hover:bg-brand-800'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6 bg-brand-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Questions & answers
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-white border rounded-2xl overflow-hidden transition-all ${openFaq === i ? 'border-blue-200 shadow-sm' : 'border-brand-200 hover:border-brand-300'}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left gap-4">
                  <span className="text-sm font-semibold text-brand-900">{faq.q}</span>
                  <ChevronDown size={16} className={`text-brand-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-brand-600 leading-relaxed border-t border-brand-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.3),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare size={24} className="text-teal-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to go paperless?
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
            Join offices across Rwanda moving from paper registers to secure digital records. Set up in minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register"
              className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 hover:-translate-y-0.5">
              Start free trial <ArrowRight size={16} />
            </Link>
            <a href="mailto:info@sybella.rw"
              className="flex items-center gap-2 border-2 border-brand-700 text-brand-300 font-semibold px-8 py-4 rounded-2xl hover:bg-brand-800 hover:border-brand-600 transition-all">
              <Mail size={16} /> Contact sales
            </a>
          </div>
          <p className="text-brand-500 text-sm mt-6">No credit card required · 14-day free trial · Cancel any time</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-brand-900 border-t border-brand-800 px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-brand-800 border border-brand-700 rounded-lg flex items-center justify-center">
                  <CheckSquare size={14} className="text-teal-400" />
                </div>
                <span className="font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
              </div>
              <p className="text-sm text-brand-500 leading-relaxed mb-5 max-w-xs">
                Secure client intake and records management for professional offices. A product of Sybella Systems.
              </p>
              <div className="space-y-2 text-xs text-brand-500">
                <div className="flex items-center gap-2"><MapPin size={12} className="flex-shrink-0" /> KG 7 Ave, Kigali, Rwanda</div>
                <div className="flex items-center gap-2"><Phone size={12} className="flex-shrink-0" /> +250 788 000 000</div>
                <div className="flex items-center gap-2"><Mail size={12} className="flex-shrink-0" /> info@sybella.rw</div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-4">Product</h4>
              <div className="space-y-2.5">
                {['Features', 'How It Works', 'Pricing', 'Security', 'Changelog', 'Roadmap'].map(l => (
                  <div key={l}><a href="#" className="text-sm text-brand-500 hover:text-brand-300 transition-colors">{l}</a></div>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-4">Company</h4>
              <div className="space-y-2.5">
                {['About Sybella', 'Blog', 'Careers', 'Press Kit', 'Partners', 'Contact Us'].map(l => (
                  <div key={l}><a href="#" className="text-sm text-brand-500 hover:text-brand-300 transition-colors">{l}</a></div>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-4">Legal</h4>
              <div className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Data Processing', 'Cookie Policy', 'Security', 'Status'].map(l => (
                  <div key={l}><a href="#" className="text-sm text-brand-500 hover:text-brand-300 transition-colors">{l}</a></div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-brand-600">© 2024 Sybella Systems Ltd. All rights reserved. Registered in Rwanda.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-brand-600">Made with ❤️ in Kigali 🇷🇼</span>
              <div className="flex items-center gap-1 bg-green-900/40 border border-green-800 text-green-400 text-[10px] px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
