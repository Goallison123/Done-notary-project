/**
 * Design System - Spacing
 * 8px grid system for consistent spacing
 */

export const spacing = {
  0: '0',
  0.5: '2px',   // 0.25 * 8
  1: '4px',     // 0.5 * 8
  1.5: '6px',   // 0.75 * 8
  2: '8px',     // 1 * 8
  2.5: '10px',  // 1.25 * 8
  3: '12px',    // 1.5 * 8
  3.5: '14px',  // 1.75 * 8
  4: '16px',    // 2 * 8
  5: '20px',    // 2.5 * 8
  6: '24px',    // 3 * 8
  7: '28px',    // 3.5 * 8
  8: '32px',    // 4 * 8
  9: '36px',    // 4.5 * 8
  10: '40px',   // 5 * 8
  11: '44px',   // 5.5 * 8
  12: '48px',   // 6 * 8
  14: '56px',   // 7 * 8
  16: '64px',   // 8 * 8
  20: '80px',   // 10 * 8
  24: '96px',   // 12 * 8
  28: '112px',  // 14 * 8
  32: '128px',  // 16 * 8
} as const

// Tailwind-compatible spacing values (rem-based)
export const tailwindSpacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
} as const

export type SpacingKey = keyof typeof spacing
