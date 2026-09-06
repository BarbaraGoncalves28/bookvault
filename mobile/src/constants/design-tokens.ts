export const colors = {
// Backgrounds
background: '#17152B',
backgroundLight: '#FAF9FC',

// Surfaces
surface: '#201E2E',
surfaceElevated: '#2A273A',
surfaceMuted: '#F2F0FA',

// Brand
primary: '#B100CD',
primaryLight: '#CA5CDD',
primaryDark: '#8A00C2',

// Brand secondary
secondary: '#7057D9',
secondaryLight: '#8B73E8',
secondaryDark: '#5742B5',

// Accent
accent: '#FFD700',

// Text
text: '#FAF9FC',
textSecondary: '#E5E1EE',
textMuted: '#777486',
textSubtle: '#4B4858',

// Borders
border: '#3A364D',
borderLight: '#E5E1EE',

// Feedback
danger: '#FF0000',
} as const;

export const spacing = {
xs: 4,
sm: 8,
md: 16,
lg: 24,
xl: 32,
'2xl': 40,
'3xl': 48,
'4xl': 64,
} as const;

export const radii = {
sm: 8,
md: 10,
lg: 12,
xl: 16,
'2xl': 24,
full: 999,
} as const;

export const typography = {
display: 'text-4xl font-bold text-night-50',
title: 'text-3xl font-bold text-night-50',
heading: 'text-xl font-bold text-night-50',
subheading: 'text-lg font-semibold text-night-50',

body: 'text-base text-lavender-100',
bodyMedium: 'text-base font-medium text-lavender-100',

caption: 'text-sm text-night-500',
small: 'text-xs text-night-500',

label: 'text-sm font-medium text-lavender-100',
} as const;
