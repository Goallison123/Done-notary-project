import { clsx } from 'clsx'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export default function Input({ label, error, hint, prefix, suffix, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-brand-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-brand-400 pointer-events-none flex items-center">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full h-10 rounded-lg border border-brand-200 bg-white px-3 text-sm text-brand-900',
            'placeholder:text-brand-400 transition-all',
            'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            prefix && 'pl-9',
            suffix && 'pr-9',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-brand-400 flex items-center">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-brand-500">{hint}</p>}
    </div>
  )
}
