import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Play,
} from 'lucide-react'
import Container from '@/components/layout/Container'

// ═══════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════

export default function Hero() {
  return (
    <section className="pt-48 pb-24 px-6">
  <Container>
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
      </Container>
</section>
  )
}
