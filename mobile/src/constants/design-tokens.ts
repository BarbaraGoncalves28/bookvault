export const colors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceMuted: '#f1f5f9',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  primary: '#10b981',
  primaryDark: '#064e3b',
  danger: '#ff0000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

export const radii = {
  sm: 8,
  md: 8,
  lg: 8,
  xl: 8,
} as const;

export const typography = {
  title: 'text-3xl font-bold text-ink-900',
  heading: 'text-xl font-bold text-ink-900',
  body: 'text-base text-ink-700',
  caption: 'text-sm text-ink-500',
} as const;
