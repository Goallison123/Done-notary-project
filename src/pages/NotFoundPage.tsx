import { Link } from 'react-router-dom'
import { CheckSquare, ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(37,99,235,0.05),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />

      <div className="text-center max-w-sm relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-brand-900 rounded-xl flex items-center justify-center shadow-md">
            <CheckSquare size={17} className="text-teal-400" />
          </div>
          <span className="font-bold text-brand-900 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DONE</span>
        </div>

        {/* 404 */}
        <div className="text-[120px] font-extrabold text-brand-100 leading-none font-mono mb-2 select-none">
          404
        </div>

        <h1 className="text-2xl font-bold text-brand-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Page not found
        </h1>
        <p className="text-sm text-brand-500 leading-relaxed mb-8">
          The page you're looking for doesn't exist, has been moved, or you don't have access to it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/"
            className="flex items-center justify-center gap-2 bg-brand-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20 text-sm">
            <Home size={14} /> Go home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 border border-brand-200 text-brand-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-all text-sm"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </div>
      </div>
    </div>
  )
}
