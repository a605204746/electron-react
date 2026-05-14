import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { ControlOutlined, DesktopOutlined, FileSearchOutlined, CloudDownloadOutlined, FileTextOutlined } from '@ant-design/icons'
import CounterPage from './pages/CounterPage'
import SystemInfoPage from './pages/SystemInfoPage'
import FilePage from './pages/FilePage'
import DownloadPage from './pages/DownloadPage'
import NotePage from './pages/NotePage'

type PageKey = 'counter' | 'system' | 'file' | 'download' | 'note'

const NAV = [
  { key: 'counter'  as PageKey, icon: <ControlOutlined />,       label: '计数器', sub: 'useState · 状态管理' },
  { key: 'system'   as PageKey, icon: <DesktopOutlined />,        label: '系统信息', sub: 'IPC · 主进程通信' },
  { key: 'file'     as PageKey, icon: <FileSearchOutlined />,     label: '文件读取', sub: 'IPC · 文件系统' },
  { key: 'download' as PageKey, icon: <CloudDownloadOutlined />,  label: '下载示例', sub: 'IPC · 主进程推送' },
  { key: 'note'     as PageKey, icon: <FileTextOutlined />,       label: '笔记',    sub: 'SQLite · 本地存储' },
]

function NavItem({
  item, active, onClick,
}: { item: typeof NAV[0]; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 10px', border: 'none', borderRadius: 8,
        cursor: 'pointer', marginBottom: 3, textAlign: 'left',
        background: active
          ? 'rgba(34,211,168,0.1)'
          : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        color: active ? '#22d3a8' : hovered ? '#a0aec0' : '#5a6a7e',
        borderLeft: `2px solid ${active ? '#22d3a8' : 'transparent'}`,
        transition: 'all 0.15s ease',
      }}
    >
      <span style={{ fontSize: 15, width: 20, textAlign: 'center', opacity: active ? 1 : 0.6, flexShrink: 0 }}>
        {item.icon}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, lineHeight: '1.35' }}>{item.label}</div>
        <div style={{ fontSize: 10, lineHeight: '1.3', color: active ? 'rgba(34,211,168,0.55)' : '#2d3d55' }}>{item.sub}</div>
      </div>
    </button>
  )
}

export default function App() {
  const [page, setPage] = useState<PageKey>('counter')

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#22d3a8',
          colorBgBase: '#080d18',
          colorBgContainer: '#0d1523',
          borderRadius: 10,
          fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif",
        },
      }}
    >
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: 'flex', height: '100vh', background: '#080d18', overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 200, flexShrink: 0,
          background: 'linear-gradient(180deg, #070b16 0%, #060a12 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Logo */}
          <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: 'linear-gradient(135deg, #22d3a8 0%, #0ea5e9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, boxShadow: '0 4px 14px rgba(34,211,168,0.3)',
              }}>⚡</div>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13, lineHeight: '1.3' }}>Electron</div>
                <div style={{ color: '#2d3d55', fontSize: 11, lineHeight: '1.3' }}>React · TypeScript</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '12px 10px', flex: 1 }}>
            <div style={{
              color: '#1e2d40', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '4px 8px', marginBottom: 4,
            }}>示例</div>
            {NAV.map(item => (
              <NavItem key={item.key} item={item} active={page === item.key} onClick={() => setPage(item.key)} />
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%', background: '#22d3a8',
                boxShadow: '0 0 5px #22d3a8',
              }} />
              <span style={{ color: '#1e2d40', fontSize: 10, fontFamily: 'monospace' }}>Electron v42 · antd v6</span>
            </div>
          </div>
        </aside>

        {/* ── Content ── */}
        <main style={{ flex: 1, overflow: 'auto' }} className="scroll-thin">
          {page === 'counter'  && <CounterPage />}
          {page === 'system'   && <SystemInfoPage />}
          {page === 'file'     && <FilePage />}
          {page === 'download' && <DownloadPage />}
          {page === 'note'     && <NotePage />}
        </main>

      </div>
    </ConfigProvider>
  )
}

const GLOBAL_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }

  .scroll-thin::-webkit-scrollbar { width: 5px; }
  .scroll-thin::-webkit-scrollbar-track { background: transparent; }
  .scroll-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 3px; }
  .scroll-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.13); }

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
    border-color: rgba(255,255,255,0.13) !important;
    background: #101826 !important;
  }
`
