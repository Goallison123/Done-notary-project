import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

export default function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative w-full bg-white rounded-2xl shadow-2xl shadow-brand-900/20 flex flex-col max-h-[90vh]', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
            <h2 className="text-base font-semibold text-brand-900">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-brand-100">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-brand-100">{footer}</div>}
      </div>
    </div>
  )
}
