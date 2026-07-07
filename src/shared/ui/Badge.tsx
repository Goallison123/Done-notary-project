import { clsx } from 'clsx'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'muted'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variants: Record<Variant, string> = {
  default: 'bg-brand-100 text-brand-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-600',
  pending: 'bg-amber-100 text-amber-700',
  muted: 'bg-brand-100 text-brand-500',
}

const dotColors: Record<Variant, string> = {
  default: 'bg-brand-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  pending: 'bg-amber-500',
  muted: 'bg-brand-400',
}

export default function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className,
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}
