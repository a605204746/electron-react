import { useRef, useState } from 'react'

export default function CounterPage() {
  const [count, setCount] = useState(0)
  const numRef = useRef<HTMLDivElement>(null)

  const pop = () => {
    const el = numRef.current
    if (!el) return
    el.classList.remove('count-pop')
    void el.offsetWidth
    el.classList.add('count-pop')
  }

  const inc = () => { setCount(c => c + 1); pop() }
  const dec = () => { setCount(c => c - 1); pop() }
  const reset = () => { setCount(0); pop() }

  const positive = count > 0
  const negative = count < 0
  const accentColor = negative ? '#f87171' : positive ? '#22d3a8' : '#2d3d55'

  return (
    <div
      className="page-enter"
      style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
    >
      <div style={{
        background: '#0d1523',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        padding: '48px 56px',
        width: '100%', maxWidth: 460,
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(34,211,168,0.08)', border: '1px solid rgba(34,211,168,0.2)',
          borderRadius: 20, padding: '4px 14px', marginBottom: 10,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3a8', display: 'inline-block' }} />
          <span style={{ color: '#22d3a8', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em' }}>计数器</span>
        </div>
        <div style={{ color: '#3d4f63', fontSize: 12, marginBottom: 40 }}>演示 React useState 基础状态管理</div>

        {/* Counter display */}
        <div style={{ marginBottom: 10 }}>
          <div
            ref={numRef}
            style={{
              fontSize: 100,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              fontVariantNumeric: 'tabular-nums',
              color: accentColor,
              textShadow: count !== 0 ? `0 0 48px ${accentColor}55` : 'none',
              transition: 'color 0.25s ease, text-shadow 0.25s ease',
              userSelect: 'none',
            }}
          >
            {positive ? `+${count}` : count}
          </div>
        </div>

        {/* Separator line */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}44 50%, transparent 100%)`,
          marginBottom: 36,
          transition: 'background 0.3s ease',
        }} />

        {/* Control buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 20 }}>
          <CounterBtn color="#f87171" onClick={dec} label="−" />
          <CounterBtn color="#22d3a8" onClick={inc} label="+" />
        </div>

        {/* Reset */}
        <ResetBtn onClick={reset} />
      </div>
    </div>
  )
}

function CounterBtn({ color, onClick, label }: { color: string; onClick: () => void; label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 56, height: 56, borderRadius: 14,
        border: `1px solid ${color}${hov ? '66' : '33'}`,
        background: hov ? `${color}1a` : `${color}0d`,
        color, fontSize: 26, fontWeight: 300, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? `0 6px 20px ${color}22` : 'none',
      }}
    >
      {label}
    </button>
  )
}

function ResetBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'transparent',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8, color: hov ? '#6b7a8d' : '#3d4f63',
        fontSize: 12, padding: '6px 22px', cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      重置
    </button>
  )
}
