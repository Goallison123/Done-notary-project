/**
 * Design System - Border Radius
 * Consistent rounded corner values
 */

export const radius = {
  none: '0',
  sm: '4px',     // Small elements (badges, tags)
  md: '8px',     // Buttons, inputs
  lg: '12px',    // Cards
  xl: '16px',    // Large cards, modals
  '2xl': '20px', // Extra large containers
  '3xl': '24px', // Hero sections
  full: '9999px', // Pills, avatars
} as const

// Tailwind-compatible radius values
export const tailwindRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const

// Suggested usage
export const radiusUsage = {
  button: radius.md,
  input: radius.md,
  card: radius.lg,
  modal: radius.xl,
  badge: radius.full,
  avatar: radius.full,
  tag: radius.sm,
  pill: radius.full,
  tooltip: radius.md,
  dropdown: radius.lg,
  icon: radius.md,
} as const

export type RadiusKey = keyof typeof radius
