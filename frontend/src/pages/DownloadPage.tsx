import { useState, useEffect } from 'react'
import { CloudDownloadOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons'
import { downloadApi, downloadEvents } from '../api/download'
import { useIpcEvent } from '../hooks/useIpcEvent'
import type { DownloadProgress } from '@shared/types/download'
import { useTheme } from '../infra/theme'
import { useLang } from '../infra/i18n'

type Status = 'idle' | 'downloading' | 'done' | 'error'

const DEMO_URL = 'https://example.com/releases/v1.0.0/app-setup.zip'

export default function DownloadPage() {
  const { t } = useTheme()
  const { tr } = useLang()
  const [url, setUrl] = useState(DEMO_URL)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState<DownloadProgress>({ percent: 0, speed: '', downloaded: '', total: '' })
  const [resultPath, setResultPath] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [urlFocus, setUrlFocus] = useState(false)

  useIpcEvent(downloadEvents.progress, (p) => { setStatus('downloading'); setProgress(p) })
  useIpcEvent(downloadEvents.done,     (fp)  => { setStatus('done'); setResultPath(fp) })
  useIpcEvent(downloadEvents.error,    (msg) => { setStatus('error'); setErrorMsg(msg) })

  useEffect(() => {
    downloadApi.getLastEvent().then(event => {
      if (!event) return
      if (event.type === 'done')  { setStatus('done');  setResultPath(event.payload) }
      if (event.type === 'error') { setStatus('error'); setErrorMsg(event.payload) }
    })
  }, [])

  const start = () => {
    setStatus('downloading')
    setProgress({ percent: 0, speed: tr.download.calculating, downloaded: '0 KB', total: '50.0 MB' })
    setResultPath(''); setErrorMsg('')
    downloadApi.start(url)
  }
  const cancel = () => downloadApi.cancel()
  const reset  = () => { setStatus('idle'); setProgress({ percent: 0, speed: '', downloaded: '', total: '' }) }

  return (
    <div className="page-enter" style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)',
          borderRadius: 20, padding: '4px 14px', marginBottom: 10,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          <span style={{ color: '#34d399', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em' }}>{tr.download.badge}</span>
        </div>
        <div style={{ color: t.textFaint, fontSize: 12, fontFamily: 'monospace' }}>
          {tr.download.desc}
        </div>
      </div>

      {/* URL input */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ color: t.textFaint, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          {tr.download.urlLabel}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: t.bgDeep,
            border: `1px solid ${urlFocus ? 'rgba(52,211,153,0.4)' : t.border}`,
            borderRadius: 8, padding: '0 12px', transition: 'border-color 0.15s',
          }}>
            <CloudDownloadOutlined style={{ color: urlFocus ? '#34d399' : t.textFaint, fontSize: 13, flexShrink: 0, transition: 'color 0.15s' }} />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onFocus={() => setUrlFocus(true)}
              onBlur={() => setUrlFocus(false)}
              disabled={status === 'downloading'}
              placeholder="https://example.com/file.zip"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: t.text, fontSize: 13, padding: '10px 0',
                fontFamily: "'Consolas', monospace",
                opacity: status === 'downloading' ? 0.4 : 1,
              }}
            />
          </div>
          <ActionBtn status={status} tr={tr.download} onStart={start} onCancel={cancel} onReset={reset} hasUrl={!!url.trim()} />
        </div>
      </div>

      {/* Progress card */}
      {status !== 'idle' && (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>

          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ color: t.textSub, fontSize: 11 }}>{tr.download.progressLabel}</span>
              <span style={{ color: statusColor(status, t.text), fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
                {progress.percent}%
              </span>
            </div>
            <div style={{ height: 6, background: t.bgDeep, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${progress.percent}%`,
                background: status === 'error'
                  ? '#f87171'
                  : status === 'done'
                    ? 'linear-gradient(90deg, #22d3a8, #34d399)'
                    : 'linear-gradient(90deg, #22d3a8, #0ea5e9)',
                transition: 'width 0.18s ease, background 0.3s ease',
                boxShadow: status === 'done' ? '0 0 8px rgba(34,211,168,0.5)' : 'none',
              }} />
            </div>
          </div>

          {/* Stats */}
          {status === 'downloading' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <StatCell label={tr.download.speed}      value={progress.speed}      color="#60a5fa" />
              <StatCell label={tr.download.downloaded} value={progress.downloaded} color="#a78bfa" />
              <StatCell label={tr.download.total}      value={progress.total}      color={t.textSub} />
            </div>
          )}

          {/* Done */}
          {status === 'done' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(34,211,168,0.07)', border: '1px solid rgba(34,211,168,0.2)',
              borderRadius: 8, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 16 }}>✓</span>
              <div>
                <div style={{ color: '#34d399', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{tr.download.done}</div>
                <div style={{ color: '#22d3a8', fontSize: 11, fontFamily: 'monospace' }}>{resultPath}</div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8, padding: '10px 14px',
            }}>
              <span style={{ color: '#f87171', fontSize: 15 }}>✕</span>
              <div style={{ color: '#f87171', fontSize: 12 }}>{errorMsg}</div>
            </div>
          )}
        </div>
      )}

      {/* IPC flow hint */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: t.bgCard, borderRadius: 8, border: `1px solid ${t.borderSubtle}` }}>
        <div style={{ color: t.textFaint, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{tr.download.ipcFlow}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', rowGap: 4 }}>
          {['download.service', 'defineEmitter', 'emit.progress()', 'ipcRenderer.on', 'useIpcEvent', 'React setState'].map((item, i, arr) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: t.textSub, fontSize: 11, fontFamily: 'monospace', background: t.bgDeep, padding: '2px 7px', borderRadius: 4 }}>{item}</span>
              {i < arr.length - 1 && <span style={{ color: t.textFaint, fontSize: 11, margin: '0 3px' }}>→</span>}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}

function statusColor(s: Status, textColor: string) {
  if (s === 'done') return '#34d399'
  if (s === 'error') return '#f87171'
  return textColor
}

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  const { t } = useTheme()
  return (
    <div style={{ background: t.bgDeep, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ color: t.textFaint, fontSize: 10, marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{value}</div>
    </div>
  )
}

type DownloadTr = { cancel: string; reset: string; start: string }

function ActionBtn({ status, tr, onStart, onCancel, onReset, hasUrl }: {
  status: Status; tr: DownloadTr
  onStart: () => void; onCancel: () => void; onReset: () => void; hasUrl: boolean
}) {
  const { t } = useTheme()
  const [hov, setHov] = useState(false)

  if (status === 'downloading') {
    return (
      <button onClick={onCancel} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', minWidth: 80,
        background: hov ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.08)',
        border: '1px solid rgba(248,113,113,0.35)',
        borderRadius: 8, color: '#f87171', fontSize: 13, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s', justifyContent: 'center', outline: 'none',
      }}>
        <CloseOutlined style={{ fontSize: 11 }} />{tr.cancel}
      </button>
    )
  }

  if (status === 'done' || status === 'error') {
    return (
      <button onClick={onReset} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', minWidth: 80,
        background: hov ? t.navHoverBg : 'transparent',
        border: `1px solid ${t.border}`,
        borderRadius: 8, color: t.textSub, fontSize: 13, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s', justifyContent: 'center', outline: 'none',
      }}>
        <ReloadOutlined style={{ fontSize: 11 }} />{tr.reset}
      </button>
    )
  }

  return (
    <button onClick={onStart} disabled={!hasUrl} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', minWidth: 80,
      background: hasUrl ? (hov ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.12)') : 'transparent',
      border: `1px solid ${hasUrl ? 'rgba(52,211,153,0.4)' : 'rgba(52,211,153,0.15)'}`,
      borderRadius: 8, color: hasUrl ? '#34d399' : 'rgba(52,211,153,0.4)', fontSize: 13, fontWeight: 500,
      cursor: hasUrl ? 'pointer' : 'default', transition: 'all 0.15s', justifyContent: 'center', outline: 'none',
    }}>
      <CloudDownloadOutlined style={{ fontSize: 12 }} />{tr.start}
    </button>
  )
}
