import {
  Scale,
  Building2,
  TrendingUp,
  Globe,
  Users,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════
// LOGOS SECTION
// ═══════════════════════════════════════════════════════════════════

export default function TrustedBy() {
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
