import { clsx } from 'clsx'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-brand-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900',
          'placeholder:text-brand-400 transition-all resize-none',
          'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-brand-500">{hint}</p>}
    </div>
  )
}
