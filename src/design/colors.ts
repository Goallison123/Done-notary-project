/**
 * Design System - Colors
 * Central color palette for the entire application
 */

export const colors = {
  // Brand / Slate
  brand: {
    900: '#0F172A',
    800: '#1E293B',
    700: '#334155',
    600: '#475569',
    500: '#64748B',
    400: '#94A3B8',
    300: '#CBD5E1',
    200: '#E2E8F0',
    100: '#F1F5F9',
    50: '#F8FAFC',
  },

  // Blue - Primary
  blue: {
    600: '#2563EB',
    500: '#3B82F6',
    400: '#60A5FA',
    100: '#DBEAFE',
    50: '#EFF6FF',
  },

  // Teal - Accent
  teal: {
    600: '#0D9488',
    500: '#14B8A6',
    400: '#2DD4BF',
    100: '#CCFBF1',
    50: '#F0FDFA',
  },

  // Green - Success
  green: {
    600: '#16A34A',
    500: '#22C55E',
    400: '#4ADE80',
    100: '#DCFCE7',
    50: '#F0FDF4',
  },

  // Amber - Warning
  amber: {
    600: '#D97706',
    500: '#F59E0B',
    400: '#FBBF24',
    100: '#FEF3C7',
    50: '#FFFBEB',
  },

  // Red - Danger
  red: {
    600: '#DC2626',
    500: '#EF4444',
    400: '#F87171',
    100: '#FEE2E2',
    50: '#FEF2F2',
  },

  // Semantic colors
  semantic: {
    background: '#FFFFFF',
    backgroundAlt: '#F8FAFC',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
  },
} as const

export type ColorScale = typeof colors.brand
export type ColorName = keyof typeof colors
