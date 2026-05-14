import { useEffect, useState } from 'react'
import {
  LaptopOutlined, ThunderboltOutlined, ClusterOutlined, DatabaseOutlined,
  GlobalOutlined, CodeOutlined, ReloadOutlined,
} from '@ant-design/icons'
import type { SystemInfo } from '@shared/types/system'
import { systemApi } from '../api/system'

type Stat = { icon: React.ReactNode; label: string; value: string; color: string }

function buildStats(info: SystemInfo): Stat[] {
  return [
    { icon: <LaptopOutlined />, label: '操作系统', value: info.platform, color: '#60a5fa' },
    { icon: <ThunderboltOutlined />, label: '架构',     value: info.arch,               color: '#a78bfa' },
    { icon: <ClusterOutlined />,    label: 'CPU 核心', value: String(info.cpus) + ' 核', color: '#f59e0b' },
    { icon: <DatabaseOutlined />, label: '总内存', value: info.totalMemory + ' GB', color: '#22d3a8' },
    { icon: <DatabaseOutlined />, label: '空闲内存', value: info.freeMemory + ' GB', color: '#34d399' },
    { icon: <GlobalOutlined />, label: '主机名',   value: info.hostname,  color: '#f472b6' },
    { icon: <CodeOutlined />,   label: 'Node.js',  value: `v${info.nodeVersion}`,      color: '#4ade80' },
    { icon: <CodeOutlined />,   label: 'Electron', value: `v${info.electronVersion}`,  color: '#60a5fa' },
    { icon: <CodeOutlined />,   label: 'Chrome',   value: `v${info.chromeVersion}`,    color: '#fb923c' },
  ]
}

export default function SystemInfoPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setInfo(await systemApi.getInfo()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const stats = info ? buildStats(info) : []

  return (
    <div className="page-enter" style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 10,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
            <span style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em' }}>系统信息</span>
          </div>
          <div style={{ color: '#3d4f63', fontSize: 12 }}>通过 Electron IPC 从主进程获取实时系统数据</div>
        </div>

        <RefreshBtn loading={loading} onClick={load} />
      </div>

      {/* Grid */}
      {loading && !info ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton" style={{
              background: '#0d1523', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, height: 88,
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {stats.map((stat, i) => <StatCard key={i} stat={stat} />)}
        </div>
      )}
    </div>
  )
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div
      className="stat-card"
      style={{
        background: '#0d1523',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, padding: '18px 20px',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <span style={{ color: stat.color, fontSize: 13, opacity: 0.85 }}>{stat.icon}</span>
        <span style={{ color: '#3d4f63', fontSize: 11, fontWeight: 500 }}>{stat.label}</span>
      </div>
      <div style={{
        color: '#dde6f0', fontSize: 15, fontWeight: 600,
        fontFamily: "'Consolas', 'Courier New', monospace",
        letterSpacing: '-0.01em',
      }}>
        {stat.value || '—'}
      </div>
    </div>
  )
}

function RefreshBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '7px 14px',
        color: hov ? '#8899aa' : '#5a6a7e',
        fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
      }}
    >
      <ReloadOutlined style={{ fontSize: 12, animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
      刷新
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
