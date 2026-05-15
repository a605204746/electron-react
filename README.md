# Electron + React Starter Template

A desktop application starter built with Electron 41 + React 18 + TypeScript, featuring a type-safe IPC framework, SQLite local database, file operations, and real-time event push examples.

<img width="1108" height="722" alt="image" src="https://github.com/user-attachments/assets/1f115e2e-c8f5-4f44-8234-5155b0932480" />
<img width="1108" height="722" alt="image" src="https://github.com/user-attachments/assets/8912cf6b-eae4-460a-9134-383e1073dda4" />

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 41 |
| Frontend | React 18 + TypeScript |
| Build tool | electron-vite + Vite 5 |
| UI library | Ant Design 6 |
| Local database | better-sqlite3 |
| Packaging | electron-builder 24 |

---

## Project Structure

```
electron-react/
├── electron/               # Main process
│   ├── index.ts            # Entry: app lifecycle
│   ├── window/
│   │   └── mainWindow.ts   # Create main window
│   ├── preload/
│   │   └── index.ts        # Security bridge: expose ipc to renderer
│   ├── controller/         # IPC handler registration layer
│   ├── service/            # Business logic layer
│   ├── infra/
│   │   ├── config.ts       # Config loader (data/app.config.json)
│   │   ├── database.ts     # SQLite init + migrations
│   │   └── logger.ts       # Logger
│   └── utils/
│       └── ipc.ts          # defineIpc / defineEmitter utilities
├── frontend/               # Renderer process (React)
│   ├── src/
│   │   ├── api/            # IPC call wrappers (mirror of controllers)
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── infra/          # Theme / i18n contexts
│   └── index.html
├── shared/                 # Types shared between main and renderer
│   ├── types/
│   │   ├── ipc.ts          # Channel allowlists + IpcResponse type
│   │   ├── note.ts
│   │   ├── download.ts
│   │   └── ...
│   └── config/
│       └── index.ts        # AppConfig type + defaults
├── data/                   # Runtime data dir (auto-created, do not commit)
│   ├── app.db              # SQLite database file
│   └── app.config.json     # App configuration
├── out/                    # Compiled output (electron-vite build)
├── release/                # Packaged output (electron-builder)
├── electron.vite.config.ts
├── electron-builder.yml
└── package.json
```

---

## Getting Started

### Requirements

- Node.js >= 18
- npm >= 9

### Install dependencies

```bash
npm install
```

> `better-sqlite3` is a native module and will be compiled during install.
> Windows requires **Visual Studio Build Tools**; Linux requires **build-essential**.

### Start development

```bash
npm run dev
```

This starts both the Vite dev server (renderer hot-reload) and the main-process file watcher (Electron auto-restarts on main-process changes).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development mode with hot-reload |
| `npm run build` | Compile only — outputs to `out/` |
| `npm run pack` | Compile + generate unpacked app (no installer, fast for testing) |
| `npm run dist:win` | Compile + build Windows installer — outputs to `release/` |
| `npm run typecheck` | Full TypeScript type check across all packages |

---

## IPC Communication

Electron enforces strict process isolation between the renderer (web page) and the main process (Node.js). All communication must go through IPC. This project provides a type-safe bidirectional IPC framework on top of Electron's primitives.

### Full call chain

```
React Component
  └─ api/xxx.ts              createApi / createEvents
       └─ window.ipc          contextBridge-exposed safe API
            └─ preload         channel allowlist check
                 └─ ipcRenderer.invoke / on
                      ↕  [process boundary]
                 └─ ipcMain.handle / webContents.send
            └─ controller      handler registration
                 └─ service     business logic
                      └─ database / fs / system APIs
```

---

### Direction 1 — Renderer → Main (request / response)

#### Step 1: Register the channel in the allowlist

```ts
// shared/types/ipc.ts
export const INVOKE_CHANNELS = [
  'note:list',
  'note:create',
  'note:update',
  'note:delete',
] as const
```

Every new channel **must** be added here first. The preload layer blocks any channel not in this list and throws immediately.

#### Step 2: Register a handler in the main process

```ts
// electron/controller/note.controller.ts
import { defineIpc } from '@main/utils/ipc'
import { noteService } from '@main/service/note.service'

defineIpc('note', {
  list:   ()      => noteService.list(),
  create: (input) => noteService.create(input),
  update: (input) => noteService.update(input),
  delete: (id)    => noteService.delete(id),
})
```

`defineIpc` registers each method as `ipcMain.handle('note:list', ...)` and wraps every response into a uniform envelope:

```ts
// success
{ ok: true, data: Note[] }

// failure (exception thrown inside the handler)
{ ok: false, message: 'something went wrong', code?: 'ENOENT' }
```

#### Step 3: Wrap the API in the renderer

```ts
// frontend/src/api/note.ts
import { createApi } from './_ipc'

export const noteApi = createApi<{
  list:   () => Promise<Note[]>
  create: (input: CreateNoteInput) => Promise<Note>
  update: (input: UpdateNoteInput) => Promise<Note>
  delete: (id: number) => Promise<void>
}>('note')
```

`createApi` returns a Proxy. Calling `noteApi.list()` automatically builds the channel name `note:list` and calls `window.ipc.invoke`. On failure it throws an `IpcError`.

#### Step 4: Call from a component

```ts
const notes = await noteApi.list()
const note  = await noteApi.create({ title: 'New note', content: '' })
```

---

### Direction 2 — Main → Renderer (event push)

Use this for download progress, background tasks, real-time notifications, or any case where the main process needs to push data without being asked.

#### Main process — emit events

```ts
// electron/service/download.service.ts
import { defineEmitter } from '@main/utils/ipc'

const emit = defineEmitter<DownloadEventMap>('download')

// Broadcast to all windows
emit.broadcast.progress({ percent: 50, speed: '1.2 MB/s', ... })
emit.broadcast.done('/path/to/file.zip')
emit.broadcast.error('Connection timed out')

// Or target a specific window
emit.to(win).progress(...)
```

#### Renderer — subscribe to events

```ts
// frontend/src/api/download.ts
import { createEvents } from './_ipc'

export const downloadEvents = createEvents<DownloadEventMap>('download')

// Inside a component — useIpcEvent manages subscribe/unsubscribe automatically
useIpcEvent(downloadEvents.progress, (p)   => setProgress(p))
useIpcEvent(downloadEvents.done,     (fp)  => setResultPath(fp))
useIpcEvent(downloadEvents.error,    (msg) => setError(msg))
```

`useIpcEvent` subscribes on mount and unsubscribes on unmount — no memory leaks.

---

### Adding a new IPC endpoint (full walkthrough)

Example: read the system clipboard.

```ts
// 1. shared/types/ipc.ts — add to allowlist
export const INVOKE_CHANNELS = [
  ...existing,
  'clipboard:read',
] as const

// 2. shared/types/clipboard.ts — define namespace constant
export const CLIPBOARD_NS = 'clipboard' as const

// 3. electron/service/clipboard.service.ts
import { clipboard } from 'electron'
export const clipboardService = {
  read: () => clipboard.readText(),
}

// 4. electron/controller/clipboard.controller.ts
import { defineIpc } from '@main/utils/ipc'
import { clipboardService } from '@main/service/clipboard.service'
defineIpc('clipboard', {
  read: () => clipboardService.read(),
})

// 5. frontend/src/api/clipboard.ts
import { createApi } from './_ipc'
export const clipboardApi = createApi<{
  read: () => Promise<string>
}>('clipboard')

// 6. Use in a component
const text = await clipboardApi.read()
```

---

## SQLite

### Where is the database file?

```ts
// electron/infra/config.ts
export function getDataDir(): string {
  return join(app.getAppPath(), 'data')  // always relative to the app root
}
```

| Context | Path to app.db |
|---|---|
| Development | `<project-root>/data/app.db` |
| Packaged (win-unpacked) | `release/win-unpacked/resources/app/data/app.db` |
| Installed app | `<install-dir>/resources/app/data/app.db` |

### Schema migrations

```ts
// electron/infra/database.ts
const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  // append new migration SQL here for future versions
]
```

All migration statements run on every startup in order. Current statements are idempotent (`IF NOT EXISTS`). For production apps, consider adding a schema version table to track which migrations have already run.

---

### ⚠️ Gotcha: native module must be recompiled for Electron

`better-sqlite3` is a C++ native addon. The binary compiled against your system Node.js **cannot be loaded by Electron**, which ships its own Node.js version. The two must match exactly.

```bash
# Run this whenever you upgrade Electron
npm run re-sqlite
# equivalent to: electron-rebuild -f -w better-sqlite3
```

`electron-builder` automatically recompiles native modules against the correct Electron version during packaging, so you don't need to worry about it for production builds.

### ⚠️ Gotcha: better-sqlite3 is synchronous — never use it in the renderer

All `better-sqlite3` APIs are **synchronous by design**. Calling them from the renderer would block the UI thread, and the renderer sandbox cannot load native modules anyway.

**The right pattern**: all database access lives in main-process services; the renderer calls them over IPC. This project enforces this by design.

### ⚠️ Gotcha: WAL mode leaves helper files on disk

The database is opened in WAL mode:

```ts
_db.pragma('journal_mode = WAL')
```

WAL mode creates two extra files alongside `app.db`: `app.db-wal` and `app.db-shm`. They disappear on a clean shutdown. If the app crashes, they remain on disk but SQLite will recover them automatically on the next startup — no data is lost.

---

## Packaging

### What is the difference between `out/` and `release/`?

```
npm run build    →  out/      Compiled JS/HTML — no Electron runtime, cannot run standalone
npm run dist:win →  release/  Full packaged app — includes Chromium + Node.js, ready to ship
```

`electron-builder` compresses the contents of `out/` into `resources/app.asar` and merges it with the Electron runtime to produce the installer.

---

### ⚠️ Gotcha: blank white screen after packaging

**Root cause**: the `loadFile` path is computed relative to `__dirname`. In development the app uses `loadURL(devServerUrl)` so the path is never evaluated — the bug only surfaces in a production build.

```
Packaged directory layout:
  resources/app.asar/
    out/main/index.js       ← __dirname points here
    out/renderer/index.html ← target file

✅ Correct:  join(__dirname, '../renderer/index.html')
             one level up → out/ → renderer/index.html

❌ Wrong:    join(__dirname, '../../renderer/index.html')
             two levels up → escapes out/ → file not found → blank screen
```

### ⚠️ Gotcha: Windows packaging fails with "cannot create symbolic link"

**Error**: `Cannot create symbolic link : A required privilege is not held by the client`

**Cause**: `electron-builder` downloads a `winCodeSign` archive that contains macOS `.dylib` symlinks. Extracting them on Windows requires the *Create symbolic links* privilege, which standard users do not have by default.

**Fix A** (recommended — permanent):

Enable **Developer Mode** in Windows Settings:

> Settings → System → For developers → Developer Mode → On

> ⚠️ You must open a **new terminal** after enabling it. The privilege is not inherited by existing sessions.

**Fix B** (build-script only — disables code-signing auto-discovery):

```json
// package.json
"dist:win": "npm run build && set CSC_IDENTITY_AUTO_DISCOVERY=false&& electron-builder --win"
```

This prevents `electron-builder` from looking for signing certificates, which in turn skips the `winCodeSign` download entirely. Safe to use when you have no signing certificate.

### ⚠️ Gotcha: the packaged app is 400+ MB

This is expected and is not a bug — it is the fixed overhead of Electron.

```
win-unpacked/ ≈ 422 MB breakdown:
  ~280 MB  Chromium rendering engine  (mandatory)
  ~120 MB  Electron executable + Node.js runtime
  ~  5 MB  Your actual application code (app.asar)
```

For reference: VS Code ships ~350 MB, Slack ~450 MB, Discord ~300 MB.

The **NSIS installer** (`.exe`) that users actually download is compressed to roughly **80–100 MB**. The `win-unpacked` folder is the raw, uncompressed form — users never interact with it directly.

If binary size is a hard requirement, consider [Tauri](https://tauri.app/) (uses the OS WebView instead of bundling Chromium — installers are typically 3–10 MB).

---

## App Configuration

On first launch, the app writes `data/app.config.json` with the following defaults. Edit it manually and restart to apply changes.

```json
{
  "window": {
    "width": 900,
    "height": 640,
    "minWidth": 680,
    "minHeight": 480
  },
  "tray": {
    "enabled": false,
    "tooltip": "Electron App"
  },
  "log": {
    "level": "info",
    "maxDays": 7
  }
}
```
