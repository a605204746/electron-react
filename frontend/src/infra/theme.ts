import { createContext, useContext } from 'react'

export type ThemeMode = 'dark' | 'light'

export interface ThemeColors {
  mode: ThemeMode
  bg: string
  bgSidebar: string
  bgCard: string
  bgDeep: string
  border: string
  borderSubtle: string
  text: string
  textSub: string
  textFaint: string
  navActiveBg: string
  navActiveColor: string
  navActiveSub: string
  navHoverBg: string
  navColor: string
  navSub: string
  accent: string
  accentMuted: string
}

export const DARK: ThemeColors = {
  mode: 'dark',
  bg: '#0f172a',
  bgSidebar: '#090e1a',
  bgCard: '#0d1523',
  bgDeep: '#060b14',
  border: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  text: '#e2e8f0',
  textSub: '#7a8fa8',
  textFaint: '#526482',
  navActiveBg: 'rgba(34,211,168,0.1)',
  navActiveColor: '#22d3a8',
  navActiveSub: 'rgba(34,211,168,0.55)',
  navHoverBg: 'rgba(255,255,255,0.05)',
  navColor: '#8899b0',
  navSub: '#4e6480',
  accent: '#22d3a8',
  accentMuted: 'rgba(34,211,168,0.08)',
}

export const LIGHT: ThemeColors = {
  mode: 'light',
  bg: '#f8fafc',
  bgSidebar: '#f1f5f9',
  bgCard: '#ffffff',
  bgDeep: '#eef2f7',
  border: 'rgba(0,0,0,0.08)',
  borderSubtle: 'rgba(0,0,0,0.06)',
  text: '#0f172a',
  textSub: '#64748b',
  textFaint: '#94a3b8',
  navActiveBg: 'rgba(13,148,136,0.08)',
  navActiveColor: '#0d9488',
  navActiveSub: 'rgba(13,148,136,0.55)',
  navHoverBg: 'rgba(0,0,0,0.04)',
  navColor: '#64748b',
  navSub: '#94a3b8',
  accent: '#0d9488',
  accentMuted: 'rgba(13,148,136,0.08)',
}

interface ThemeContextValue {
  t: ThemeColors
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  t: DARK,
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)
