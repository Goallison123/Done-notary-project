import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  Menu,
  X,
} from 'lucide-react'

import Container from '@/components/layout/Container'

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div
  className={`
    flex items-center justify-between
    px-6 py-3
    rounded-full
    border border-slate-200
    transition-all duration-300
    ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-lg'
        : 'bg-white shadow-md'
    }
  `}
>
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