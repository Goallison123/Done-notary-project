/**
 * Design System - Index
 * Export all design system modules
 */

export * from './colors'
export * from './spacing'
export * from './typography'
export * from './radius'
export * from './shadows'
export * from './layout'

// Re-export for easy access
import { colors } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'
import { radius } from './radius'
import { shadows } from './shadows'
import { layout, breakpoints, container, maxWidth, grid } from './layout'

export const designSystem = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
  layout,
  breakpoints,
  container,
  maxWidth,
  grid,
} as const

export default designSystem
