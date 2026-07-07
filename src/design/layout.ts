/**
 * Design System - Layout
 * Container widths, breakpoints, and layout values
 */

export const container = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Max content width for readability
export const maxWidth = {
  prose: '65ch',
  form: '480px',
  card: '400px',
  sidebar: '280px',
  sidebarCollapsed: '80px',
  topbar: '64px',
  mobile: '100vw',
} as const

// Breakpoints for responsive design (pixels)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Common layout values
export const layout = {
  // Spacing
  pagePadding: '24px',
  sectionPadding: '96px',
  cardPadding: '24px',
  modalPadding: '32px',
  inputPadding: '12px',
  buttonPadding: '12px 16px',

  // Heights
  topbarHeight: '64px',
  sidebarWidth: '280px',
  sidebarCollapsedWidth: '80px',

  // Z-index scale
  zIndex: {
    dropdown: 50,
    sticky: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
    toast: 500,
    modalOverlay: 1000,
    max: 9999,
  },
} as const

// Grid system
export const grid = {
  columns: 12,
  gap: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
} as const

export type BreakpointKey = keyof typeof breakpoints
export type ContainerKey = keyof typeof container
export type ZIndexKey = keyof typeof layout.zIndex
