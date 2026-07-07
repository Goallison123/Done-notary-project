/**
 * Design System - Shadows
 * Consistent elevation and shadow values
 */

export const shadows = {
  none: 'none',

  // Subtle shadows for subtle elevation
  xs: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
  sm: '0 1px 3px 0 rgb(15 23 42 / 0.1), 0 1px 2px -1px rgb(15 23 42 / 0.1)',
  md: '0 4px 6px -1px rgb(15 23 42 / 0.1), 0 2px 4px -2px rgb(15 23 42 / 0.1)',

  // Standard elevation shadows
  lg: '0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.1)',
  xl: '0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(15 23 42 / 0.25)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(15 23 42 / 0.05)',

  // Colored shadows (for buttons, CTAs)
  blue: '0 4px 14px 0 rgb(37 99 235 / 0.25)',
  teal: '0 4px 14px 0 rgb(20 184 166 / 0.25)',
  green: '0 4px 14px 0 rgb(34 197 94 / 0.25)',
  amber: '0 4px 14px 0 rgb(245 158 11 / 0.25)',
  red: '0 4px 14px 0 rgb(239 68 68 / 0.25)',
  dark: '0 4px 14px 0 rgb(15 23 42 / 0.2)',
} as const

// Shadow usage guidelines
export const shadowUsage = {
  card: shadows.sm,
  cardHover: shadows.md,
  dropdown: shadows.lg,
  modal: shadows.xl,
  tooltip: shadows.md,
  button: shadows.xs,
  buttonHover: shadows.blue,
  inputFocus: shadows.xs,
  panel: shadows.md,
  floating: shadows['2xl'],
} as const

export type ShadowKey = keyof typeof shadows
