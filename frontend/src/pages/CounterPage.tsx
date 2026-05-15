import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../infra/theme'
import { useLang } from '../infra/i18n'

const RANGE = 20

export default function CounterPage() {
  const { t } = useTheme()
  const { tr } = useLang()
  const [count, setCount] = useState(0)
  const numRef = useRef<HTMLDivElement>(null)

  const pop = () => {
    const el = numRef.current
    if (!el) return
    el.classList.remove('count-pop')
    void el.offsetWidth
    el.classList.add('count-pop')
  }

  const inc   = () => { setCount(c => c + 1); pop() }
  const dec   = () => { setCount(c => c - 1); pop() }
  const reset = () => { setCount(0); pop() }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target !== document.body && e.target !== document.documentElement) return
      if (e.key === 'ArrowRight' || e.key === '=') inc()
      else if (e.key === 'ArrowLeft' || e.key === '-') dec()
      else if (e.key === 'r' || e.key === 'R' || e.key === 'Escape') reset()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const isPositive = count > 0
  const isNegative = count < 0
  const accentColor = isNegative ? '#f87171' : isPositive ? t.accent : t.textSub
  const progress = Math.min(Math.abs(count) / RANGE, 1)

  return (
    <div
      className="page-enter"
      style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
    >
      <div style={{
        background: t.bgCard,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        padding: '44px 52px 40px',
        width: '100%', maxWidth: 440,
        textAlign: 'center',
        boxShadow: t.mode === 'dark'
          ? '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
      }}>

        {t.mode === 'dark' && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 65% 45% at 50% 48%, ${accentColor}0a 0%, transparent 70%)`,
            transition: 'background 0.4s ease',
          }} />
        )}

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: t.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${t.border}`,
          borderRadius: 20, padding: '4px 14px', marginBottom: 8,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: accentColor, display: 'inline-block',
            transition: 'background 0.3s',
            boxShadow: t.mode === 'dark' ? `0 0 6px ${accentColor}99` : 'none',
          }} />
          <span style={{ color: t.textSub, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em' }}>{tr.counter.badge}</span>
        </div>

        <div style={{ color: t.textFaint, fontSize: 12, marginBottom: 40, lineHeight: 1.6 }}>
          {tr.counter.desc}
        </div>

        {/* Number */}
        <div
          ref={numRef}
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            fontVariantNumeric: 'tabular-nums',
            color: accentColor,
            textShadow: count !== 0 && t.mode === 'dark' ? `0 0 60px ${accentColor}40` : 'none',
            transition: 'color 0.3s ease, text-shadow 0.3s ease',
            userSelect: 'none',
            marginBottom: 28,
          }}
        >
          {isPositive ? `+${count}` : count}
        </div>

        {/* Progress bar */}
        <div style={{ position: 'relative', height: 3, marginBottom: 36 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: t.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
            borderRadius: 99,
          }} />
          <div style={{
            position: 'absolute',
            top: 0, height: '100%',
            borderRadius: 99,
            background: accentColor,
            boxShadow: t.mode === 'dark' ? `0 0 8px ${accentColor}77` : 'none',
            transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1), width 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s, opacity 0.3s',
            left: isNegative ? `${50 - progress * 50}%` : '50%',
            width: `${progress * 50}%`,
            opacity: count !== 0 ? 1 : 0,
          }} />
          <div style={{
            position: 'absolute',
            left: '50%', top: -3,
            width: 1, height: 9,
            background: t.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)',
            transform: 'translateX(-50%)',
          }} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 20 }}>
          <ActionBtn color="#f87171" label="−" shortcut="←" onClick={dec} />
          <ActionBtn color={t.accent} label="+" shortcut="→" onClick={inc} />
        </div>

        <ResetBtn label={tr.counter.reset} onClick={reset} />
      </div>
    </div>
  )
}

function ActionBtn({
  color, label, shortcut, onClick,
}: { color: string; label: string; shortcut: string; onClick: () => void }) {
  const { t } = useTheme()
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: 64, height: 64, borderRadius: 16,
        border: `1px solid ${color}${hov ? '55' : '22'}`,
        background: hov ? `${color}18` : `${color}0a`,
        color,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.15s ease',
        transform: pressed ? 'scale(0.92)' : hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov && !pressed
          ? t.mode === 'dark'
            ? `0 8px 24px ${color}22, inset 0 1px 0 ${color}22`
            : `0 4px 14px ${color}22`
          : 'none',
      }}
    >
      <span style={{ fontSize: 26, fontWeight: 300, lineHeight: 1 }}>{label}</span>
      <span style={{ fontSize: 9, opacity: 0.35, fontFamily: 'monospace' }}>{shortcut}</span>
    </button>
  )
}

function ResetBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const { t } = useTheme()
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'transparent',
        border: `1px solid ${hov ? t.border.replace('0.07', '0.15').replace('0.08', '0.18') : t.border}`,
        borderRadius: 8,
        color: hov ? t.textSub : t.textFaint,
        fontSize: 11,
        padding: '6px 22px',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.15s',
        letterSpacing: '0.04em',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {label}
      <span style={{ opacity: 0.35, fontFamily: 'monospace', fontSize: 10 }}>R</span>
    </button>
  )
}
