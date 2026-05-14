import { useState } from 'react'
import { FolderOpenOutlined, ReloadOutlined } from '@ant-design/icons'
import { fileApi } from '../api/file'

export default function FilePage() {
  const [path, setPath] = useState('')
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const read = async () => {
    if (!path.trim()) return
    setLoading(true)
    setError(null)
    setContent(null)
    try {
      setContent(await fileApi.readFile(path.trim()))
    } catch (e: any) {
      setError(e.message ?? '读取失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter" style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 20, padding: '4px 14px', marginBottom: 10,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
          <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em' }}>文件读取</span>
        </div>
        <div style={{ color: '#3d4f63', fontSize: 12, fontFamily: 'monospace' }}>
          FilePage → fileApi → ipc.invoke → ipcMain.handle → fs.readFile
        </div>
      </div>

      {/* Input card */}
      <div style={{
        background: '#0d1523', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '20px', marginBottom: 16,
      }}>
        <div style={{ color: '#2d3d55', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          文件路径
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PathInput value={path} onChange={setPath} onEnter={read} />
          <ReadBtn onClick={read} loading={loading} disabled={!path.trim()} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.22)',
          borderRadius: 10, padding: '13px 16px', marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ color: '#f87171', fontSize: 14, marginTop: 1 }}>✕</span>
          <div>
            <div style={{ color: '#f87171', fontSize: 13, fontWeight: 500, marginBottom: 3 }}>读取失败</div>
            <div style={{ color: '#c87171', fontSize: 12, fontFamily: 'monospace' }}>{error}</div>
          </div>
        </div>
      )}

      {/* File content */}
      {content !== null && (
        <div style={{
          background: '#060b14', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {/* Terminal titlebar */}
          <div style={{
            padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#080e1a',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#f87171', '#fbbf24', '#34d399'].map((c, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
            </div>
            <span style={{ color: '#2d3d55', fontSize: 10, fontFamily: 'monospace' }}>
              {content.split('\n').length} 行 · {content.length} 字符
            </span>
          </div>
          <pre style={{
            margin: 0, padding: '16px 20px',
            color: '#a8b8cc', fontSize: 12, lineHeight: 1.75,
            fontFamily: "'Consolas', 'Courier New', monospace",
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            maxHeight: 420, overflow: 'auto',
          }}>
            {content}
          </pre>
        </div>
      )}

      {/* Empty state */}
      {content === null && !error && (
        <div style={{
          background: '#0d1523', border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '52px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.2 }}>📄</div>
          <div style={{ color: '#2d3d55', fontSize: 13 }}>输入文件绝对路径后按回车或点击读取</div>
        </div>
      )}

    </div>
  )
}

function PathInput({ value, onChange, onEnter }: { value: string; onChange: (v: string) => void; onEnter: () => void }) {
  const [focus, setFocus] = useState(false)
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 8,
      background: '#060b14',
      border: `1px solid ${focus ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 8, padding: '0 12px',
      transition: 'border-color 0.15s',
    }}>
      <FolderOpenOutlined style={{ color: focus ? '#a78bfa' : '#2d3d55', fontSize: 14, transition: 'color 0.15s', flexShrink: 0 }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter()}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder="C:\Users\BS\Desktop\test.txt"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: '#e2e8f0', fontSize: 13,
          fontFamily: "'Consolas', 'Courier New', monospace",
          padding: '10px 0',
        }}
      />
    </div>
  )
}

function ReadBtn({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, minWidth: 80,
        background: !disabled ? (hov ? 'rgba(167,139,250,0.2)' : 'rgba(167,139,250,0.12)') : 'transparent',
        border: `1px solid ${!disabled ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 8, padding: '0 18px',
        color: !disabled ? '#a78bfa' : '#2d3d55',
        fontSize: 13, fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s', justifyContent: 'center',
      }}
    >
      {loading && <ReloadOutlined style={{ fontSize: 12, animation: 'spin 0.8s linear infinite' }} />}
      读取
    </button>
  )
}
