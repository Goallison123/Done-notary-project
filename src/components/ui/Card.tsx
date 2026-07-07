import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export default function Card({ children, className, hover, padding = 'md', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border border-brand-200 shadow-sm',
        paddings[padding],
        hover && 'hover:shadow-md hover:border-brand-300 cursor-pointer transition-all',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
