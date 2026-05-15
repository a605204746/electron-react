import { useState } from 'react'
import { ConfigProvider, theme as antTheme } from 'antd'
import {
  HomeOutlined, ControlOutlined, DesktopOutlined, FileSearchOutlined,
  CloudDownloadOutlined, FileTextOutlined, SunOutlined, MoonOutlined,
} from '@ant-design/icons'
import WelcomePage from './pages/WelcomePage'
import CounterPage from './pages/CounterPage'
import SystemInfoPage from './pages/SystemInfoPage'
import FilePage from './pages/FilePage'
import DownloadPage from './pages/DownloadPage'
import NotePage from './pages/NotePage'
import { ThemeContext, ThemeColors, ThemeMode, DARK, LIGHT, useTheme } from './infra/theme'
import { LangContext, Lang, EN, ZH, useLang } from './infra/i18n'

type PageKey = 'home' | 'counter' | 'system' | 'file' | 'download' | 'note'

const NAV_ICONS: Record<PageKey, React.ReactNode> = {
  home:     <HomeOutlined />,
  counter:  <ControlOutlined />,
  system:   <DesktopOutlined />,
  file:     <FileSearchOutlined />,
  download: <CloudDownloadOutlined />,
  note:     <FileTextOutlined />,
}

function buildNav(tr: typeof EN) {
  return [
    { key: 'home'     as PageKey, icon: NAV_ICONS.home,     label: tr.nav.home,     sub: tr.nav.homeSub },
    { key: 'counter'  as PageKey, icon: NAV_ICONS.counter,  label: tr.nav.counter,  sub: tr.nav.counterSub },
    { key: 'system'   as PageKey, icon: NAV_ICONS.system,   label: tr.nav.system,   sub: tr.nav.systemSub },
    { key: 'file'     as PageKey, icon: NAV_ICONS.file,     label: tr.nav.file,     sub: tr.nav.fileSub },
    { key: 'download' as PageKey, icon: NAV_ICONS.download, label: tr.nav.download, sub: tr.nav.downloadSub },
    { key: 'note'     as PageKey, icon: NAV_ICONS.note,     label: tr.nav.note,     sub: tr.nav.noteSub },
  ]
}

type NavItem = ReturnType<typeof buildNav>[0]

function NavItem({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const { t } = useTheme()
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '9px 10px', border: 'none', borderRadius: 8,
        cursor: 'pointer', marginBottom: 3, textAlign: 'left',
        background: active ? t.navActiveBg : hovered ? t.navHoverBg : 'transparent',
        color: active ? t.navActiveColor : t.navColor,
        borderLeft: `2px solid ${active ? t.navActiveColor : 'transparent'}`,
        transition: 'all 0.15s ease',
        outline: 'none',
      }}
    >
      <span style={{ fontSize: 16, width: 20, textAlign: 'center', opacity: active ? 1 : 0.6, flexShrink: 0 }}>
        {item.icon}
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: active ? 600 : 400, lineHeight: '1.4' }}>{item.label}</div>
        <div style={{ fontSize: 12, lineHeight: '1.35', color: active ? t.navActiveSub : t.navSub }}>{item.sub}</div>
      </div>
    </button>
  )
}

/* Accent-colored segmented control — active option gets accent bg + contrasting text */
function SegmentedToggle<T extends string>({ options, value, onChange, accentColor }: {
  options: { value: T; label: React.ReactNode }[]
  value: T
  onChange: (v: T) => void
  accentColor?: string
}) {
  const { t } = useTheme()
  const color = accentColor ?? t.accent
  return (
    <div style={{
      display: 'flex',
      border: `1px solid ${t.border}`,
      borderRadius: 8, overflow: 'hidden',
      background: t.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    }}>
      {options.map((opt, i) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${active ? 'transparent' : t.border}` : 'none',
              background: active ? color : 'transparent',
              color: active ? '#0f172a' : t.textFaint,
              fontSize: 13, fontWeight: active ? 700 : 400,
              cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function TopBar() {
  const { t, toggle } = useTheme()
  const { lang, toggleLang } = useLang()
  return (
    <div style={{
      height: 48, flexShrink: 0,
      borderBottom: `1px solid ${t.border}`,
      background: t.bgSidebar,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0 20px', gap: 10,
    }}>
      <SegmentedToggle
        value={lang}
        onChange={(v) => { if (v !== lang) toggleLang() }}
        accentColor="#22d3a8"
        options={[
          { value: 'en' as Lang, label: 'English' },
          { value: 'zh' as Lang, label: '中文' },
        ]}
      />
      <SegmentedToggle
        value={t.mode}
        onChange={(v) => { if (v !== t.mode) toggle() }}
        accentColor="#60a5fa"
        options={[
          { value: 'light' as ThemeMode, label: <><SunOutlined style={{ fontSize: 12 }} />{lang === 'en' ? 'Light' : '亮色'}</> },
          { value: 'dark'  as ThemeMode, label: <><MoonOutlined style={{ fontSize: 12 }} />{lang === 'en' ? 'Dark' : '暗色'}</> },
        ]}
      />
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<PageKey>('home')
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [lang, setLang] = useState<Lang>('en')

  const t = mode === 'dark' ? DARK : LIGHT
  const tr = lang === 'en' ? EN : ZH
  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark')
  const toggleLang = () => setLang(l => l === 'en' ? 'zh' : 'en')

  const NAV = buildNav(tr)

  return (
    <ThemeContext.Provider value={{ t, toggle }}>
      <LangContext.Provider value={{ lang, tr, toggleLang }}>
        <ConfigProvider
          theme={{
            algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
            token: {
              colorPrimary: t.accent,
              colorBgBase: t.bg,
              colorBgContainer: t.bgCard,
              borderRadius: 10,
              fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif",
            },
          }}
        >
          <style>{buildGlobalCSS(t)}</style>
          <div style={{
            display: 'flex', height: '100vh',
            background: t.bg, overflow: 'hidden',
            transition: 'background 0.25s ease',
          }}>

            {/* ── Sidebar ── */}
            <aside style={{
              width: 200, flexShrink: 0,
              background: t.bgSidebar,
              borderRight: `1px solid ${t.border}`,
              display: 'flex', flexDirection: 'column',
              transition: 'background 0.25s ease',
            }}>

              {/* Logo */}
              <div style={{ padding: '18px 16px 16px', borderBottom: `1px solid ${t.borderSubtle}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: 'linear-gradient(135deg, #22d3a8 0%, #0ea5e9 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, boxShadow: '0 4px 14px rgba(34,211,168,0.25)',
                  }}>⚡</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: t.text, fontWeight: 700, fontSize: 14, lineHeight: '1.3' }}>Electron</div>
                    <div style={{ color: t.textFaint, fontSize: 12, lineHeight: '1.3' }}>React · TypeScript</div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav style={{ padding: '12px 10px', flex: 1 }}>
                <NavItem item={NAV[0]} active={page === NAV[0].key} onClick={() => setPage(NAV[0].key)} />

                <div style={{
                  color: t.textFaint, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 8px', marginTop: 8, marginBottom: 2,
                }}>{tr.nav.section}</div>

                {NAV.slice(1).map(item => (
                  <NavItem key={item.key} item={item} active={page === item.key} onClick={() => setPage(item.key)} />
                ))}
              </nav>

              {/* Footer */}
              <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${t.borderSubtle}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%', background: t.accent,
                    boxShadow: `0 0 5px ${t.accent}`,
                  }} />
                  <span style={{ color: t.textFaint, fontSize: 11, fontFamily: 'monospace' }}>
                    Electron v41 · antd v6
                  </span>
                </div>
              </div>
            </aside>

            {/* ── Content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <TopBar />
              <main style={{ flex: 1, overflow: 'auto' }} className="scroll-thin">
                {page === 'home'     && <WelcomePage onNavigate={setPage} />}
                {page === 'counter'  && <CounterPage />}
                {page === 'system'   && <SystemInfoPage />}
                {page === 'file'     && <FilePage />}
                {page === 'download' && <DownloadPage />}
                {page === 'note'     && <NotePage />}
              </main>
            </div>

          </div>
        </ConfigProvider>
      </LangContext.Provider>
    </ThemeContext.Provider>
  )
}

function buildGlobalCSS(t: ThemeColors): string {
  const scrollThumb = t.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.12)'
  const scrollThumbHover = t.mode === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.2)'
  const statCardBorder = t.mode === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.15)'
  const statCardBg = t.mode === 'dark' ? '#101826' : '#f8fafc'

  return `
    * { box-sizing: border-box; }
    body { margin: 0; }

    .scroll-thin::-webkit-scrollbar { width: 5px; }
    .scroll-thin::-webkit-scrollbar-track { background: transparent; }
    .scroll-thin::-webkit-scrollbar-thumb { background: ${scrollThumb}; border-radius: 3px; }
    .scroll-thin::-webkit-scrollbar-thumb:hover { background: ${scrollThumbHover}; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .page-enter { animation: fadeUp 0.22s ease both; }

    @keyframes countPop {
      0%   { transform: scale(1); }
      35%  { transform: scale(1.14); }
      100% { transform: scale(1); }
    }
    .count-pop { animation: countPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 0.7; }
    }
    .skeleton { animation: pulse 1.6s ease-in-out infinite; }

    .stat-card:hover {
      border-color: ${statCardBorder} !important;
      background: ${statCardBg} !important;
    }
  `
}
