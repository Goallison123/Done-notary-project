/**
 * Design System - Typography
 * Font families, sizes, weights, and line heights
 */

export const fontFamily = {
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  display: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const

export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
  '7xl': '72px',
} as const

export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const

export const lineHeight = {
  none: '1',
  tight: '1.1',
  snug: '1.25',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// Typography presets for common use cases
export const typography = {
  // Headings
  h1: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h4: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },
  h5: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },
  h6: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },
  // Body
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  // Labels
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
  },
  labelSmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
  },
  // Code
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  codeSmall: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
} as const

export type TypographyPreset = keyof typeof typography
