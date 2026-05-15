import { useState } from 'react'
import {
  ControlOutlined, DesktopOutlined, FileSearchOutlined,
  CloudDownloadOutlined, FileTextOutlined, ArrowRightOutlined,
  GithubOutlined, StarOutlined,
} from '@ant-design/icons'
import { useTheme } from '../infra/theme'
import { useLang } from '../infra/i18n'

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  counter:  <ControlOutlined />,
  system:   <DesktopOutlined />,
  file:     <FileSearchOutlined />,
  download: <CloudDownloadOutlined />,
  note:     <FileTextOutlined />,
}

const FEATURE_COLORS: Record<string, string> = {
  counter:  '#22d3a8',
  system:   '#60a5fa',
  file:     '#a78bfa',
  download: '#34d399',
  note:     '#f59e0b',
}

const FEATURE_KEYS = ['counter', 'system', 'file', 'download', 'note'] as const

const STACK = [
  { label: 'Electron', version: 'v41',           color: '#60a5fa' },
  { label: 'React',    version: 'v18',            color: '#22d3a8' },
  { label: 'TypeScript', version: 'v5',           color: '#818cf8' },
  { label: 'antd',     version: 'v6',             color: '#a78bfa' },
  { label: 'Vite',     version: 'v5',             color: '#f472b6' },
  { label: 'SQLite',   version: 'better-sqlite3', color: '#f59e0b' },
]

type PageKey = 'counter' | 'system' | 'file' | 'download' | 'note'

export default function WelcomePage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { t } = useTheme()
  const { tr } = useLang()

  return (
    <div
      className="page-enter scroll-thin"
      style={{ height: '100%', overflowY: 'auto', padding: '52px 44px 48px' }}
    >
      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative' }}>
        {t.mode === 'dark' && (
          <div style={{
            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
            width: 480, height: 240, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(34,211,168,0.07) 0%, transparent 70%)',
          }} />
        )}

        {/* Logo */}
        <div style={{
          width: 68, height: 68, borderRadius: 20, margin: '0 auto 22px',
          background: 'linear-gradient(135deg, #22d3a8 0%, #0ea5e9 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          boxShadow: t.mode === 'dark'
            ? '0 8px 32px rgba(34,211,168,0.28), 0 0 0 1px rgba(34,211,168,0.12)'
            : '0 6px 20px rgba(34,211,168,0.22)',
        }}>⚡</div>

        {/* Title */}
        <h1 style={{
          color: t.text, fontSize: 32, fontWeight: 800, margin: '0 0 10px',
          letterSpacing: '-0.03em', lineHeight: 1.2,
        }}>
          {tr.welcome.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          color: t.textSub, fontSize: 15, margin: '0 auto 28px',
          lineHeight: 1.65, maxWidth: 460,
        }}>
          {tr.welcome.subtitle}
        </p>

        {/* Stack badges */}
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {STACK.map(s => (
            <span key={s.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: '4px 11px', fontSize: 11,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: t.textSub, fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: t.textFaint, fontFamily: 'monospace' }}>{s.version}</span>
            </span>
          ))}
        </div>

        <GithubBtn />
      </div>

      {/* ── Feature cards ── */}
      <div style={{ maxWidth: 860, margin: '0 auto 44px' }}>
        <div style={{
          color: t.textFaint, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', marginBottom: 14, textAlign: 'center',
        }}>
          {tr.welcome.sectionLabel}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 13,
        }}>
          {FEATURE_KEYS.map(key => (
            <FeatureCard
              key={key}
              featureKey={key}
              color={FEATURE_COLORS[key]}
              icon={FEATURE_ICONS[key]}
              title={tr.welcome.features[key].title}
              tag={tr.welcome.features[key].tag}
              desc={tr.welcome.features[key].desc}
              onClick={() => onNavigate(key)}
            />
          ))}
        </div>
      </div>

      {/* ── Architecture hint ── */}
      <div style={{
        maxWidth: 860, margin: '0 auto',
        background: t.bgCard, border: `1px solid ${t.borderSubtle}`,
        borderRadius: 12, padding: '16px 22px',
      }}>
        <div style={{ color: t.textFaint, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
          {tr.welcome.ipcArch}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', rowGap: 6 }}>
          {[
            { label: 'React 组件', color: '#22d3a8' },
            { label: 'api/*.ts',   color: '#60a5fa' },
            { label: 'ipcRenderer', color: '#a78bfa' },
            { label: 'preload.ts', color: '#f59e0b' },
            { label: 'ipcMain',    color: '#34d399' },
            { label: 'service/*.ts', color: '#f472b6' },
          ].map((item, i, arr) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontSize: 11, fontFamily: 'monospace', padding: '3px 9px',
                borderRadius: 5, border: `1px solid ${item.color}28`,
                background: `${item.color}0f`, color: item.color,
              }}>{item.label}</span>
              {i < arr.length - 1 && (
                <span style={{ color: t.textFaint, fontSize: 11, margin: '0 2px' }}>→</span>
              )}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}

/* ── Sub-components ── */

function FeatureCard({ featureKey, color, icon, title, tag, desc, onClick }: {
  featureKey: string; color: string; icon: React.ReactNode
  title: string; tag: string; desc: string; onClick: () => void
}) {
  const { t } = useTheme()
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: t.bgCard,
        border: `1px solid ${hov ? color + '50' : t.border}`,
        borderRadius: 14, padding: '20px 20px 18px',
        cursor: 'pointer', position: 'relative',
        transition: 'all 0.18s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov
          ? t.mode === 'dark'
            ? `0 12px 32px ${color}12, 0 4px 12px rgba(0,0,0,0.25)`
            : `0 8px 24px ${color}18, 0 2px 6px rgba(0,0,0,0.06)`
          : t.mode === 'dark'
            ? '0 1px 4px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 12, marginBottom: 14,
        background: hov ? `${color}20` : `${color}12`,
        border: `1px solid ${color}${hov ? '40' : '20'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, fontSize: 18,
        transition: 'all 0.18s ease',
        boxShadow: hov && t.mode === 'dark' ? `0 0 14px ${color}25` : 'none',
      }}>
        {icon}
      </div>

      {/* Title + tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{title}</span>
        <span style={{
          color, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
          background: `${color}14`, border: `1px solid ${color}28`,
          borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace',
        }}>{tag}</span>
      </div>

      {/* Description */}
      <div style={{ color: t.textSub, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>

      {/* Arrow */}
      <div style={{
        position: 'absolute', bottom: 17, right: 17,
        color, fontSize: 12,
        opacity: hov ? 0.75 : 0,
        transform: hov ? 'translateX(0)' : 'translateX(-4px)',
        transition: 'all 0.18s ease',
      }}>
        <ArrowRightOutlined />
      </div>
    </div>
  )
}

function GithubBtn() {
  const { t } = useTheme()
  const { tr } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => window.open('https://github.com', '_blank')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: hov ? t.navHoverBg : 'transparent',
        border: `1px solid ${t.border}`,
        borderRadius: 8, padding: '7px 16px',
        color: hov ? t.textSub : t.textFaint,
        fontSize: 13, cursor: 'pointer',
        transition: 'all 0.15s ease', outline: 'none',
      }}
    >
      <GithubOutlined style={{ fontSize: 15 }} />
      {tr.welcome.github}
      <StarOutlined style={{ fontSize: 12, opacity: 0.6 }} />
    </button>
  )
}
