# ElectronReactDemo

A desktop application starter built with Electron 41 + React 18 + TypeScript, featuring a type-safe IPC framework, SQLite local database, i18n, theme system, and centralized configuration.

<img width="1108" height="754" alt="image" src="https://github.com/user-attachments/assets/d5c1deb7-a593-421d-88e2-adfa535943e6" />
<img width="1108" height="754" alt="image" src="https://github.com/user-attachments/assets/68be3c84-a340-47e0-8268-d92f8b920277.png" />

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Desktop shell | Electron | ^41 |
| Frontend | React + TypeScript | ^18 / ^5.5 |
| Build tool | electron-vite + Vite | ^2.3 / ^5.4 |
| UI library | Ant Design | ^6.3 |
| Local database | better-sqlite3 | ^12.10 |
| Packaging | electron-builder | ^24.13 |

---

## Project Structure

```
electron-react/
├── app.config.json           # ★ Single source of truth for all config
├── electron-builder.yml      # Packaging config (auto-synced from app.config.json)
├── electron.vite.config.ts   # Build config (main, preload, renderer)
│
├── electron/                 # Main process
│   ├── index.ts              # Entry: app lifecycle, single-instance guard
│   ├── window/
│   │   └── mainWindow.ts     # Create main window (icon/title from app.config.json)
│   ├── preload/
│   │   └── index.ts          # Security bridge: contextBridge + channel allowlist
│   ├── controller/           # IPC handler registration layer
│   ├── service/              # Business logic layer
│   ├── infra/
│   │   ├── config.ts         # Runtime config loader (userData/data/app.config.json)
│   │   ├── database.ts       # SQLite init + migrations
│   │   └── logger.ts         # Logger (terminal + file dual output)
│   └── utils/
│       └── ipc.ts            # defineIpc / defineEmitter utilities
│
├── frontend/                 # Renderer process (React)
│   ├── index.html            # HTML entry
│   └── src/
│       ├── App.tsx           # Main component (routing, layout, lang/theme toggle)
│       ├── api/              # IPC call wrappers (mirror of controllers)
│       ├── pages/            # Page components
│       ├── hooks/            # Custom hooks
│       └── infra/
│           ├── i18n.ts       # Internationalization (EN/ZH toggle)
│           ├── theme.ts      # Theme system (dark/light toggle)
│           └── logger.ts     # Renderer-side logger
│
├── shared/                   # Types shared between main and renderer
│   ├── types/                # IPC channel allowlists, module type definitions
│   └── config/
│       └── index.ts          # AppConfig type + defaults (from app.config.json)
│
├── scripts/
│   ├── sync-config.mjs       # Config sync script (auto-runs before dev/build)
│   └── generate-icon.mjs     # Icon generator (sharp → PNG + ICO)
│
├── resources/                # App icons
│   ├── icon.png              # 256×256 (Linux / dev mode)
│   ├── icon.ico              # Multi-size ICO (Windows packaging)
│   └── icon.icns             # macOS packaging (auto-converted by electron-builder)
│
├── data/                     # Runtime data (dev mode, gitignored)
├── out/                      # Compiled output
└── release/                  # Packaging output
```

---

## Quick Start

### Requirements

- Node.js >= 18
- npm >= 9
- **Developer Mode** enabled on Windows (required for packaging — symlink permission)

### Install

```bash
npm install
```

> `better-sqlite3` is a C++ native module and will compile during install. Windows requires **Visual Studio Build Tools**; Linux requires **build-essential**.

### Development

```bash
npm run dev
```

Config sync runs automatically via the `predev` hook — no manual step needed.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development mode (auto-sync config + hot-reload) |
| `npm run build` | Compile to `out/` (auto-sync config) |
| `npm run preview` | Preview production build locally |
| `npm run pack` | Compile + unpacked app (fast testing, no installer) |
| `npm run dist:win` | Compile + Windows NSIS installer |
| `npm run dist:mac` | Compile + macOS DMG |
| `npm run dist:linux` | Compile + Linux AppImage/deb |
| `npm run typecheck` | Full TypeScript type check |
| `npm run sync-config` | Manually sync app.config.json to all targets |
| `npm run gen-icon` | Regenerate app icons |

---

## Centralized Configuration

**All configuration lives in `app.config.json`** — the single source of truth:

```json
{
  "branding": {
    "appId":          "com.demo.electron-react",
    "productName":    "ElectronReactDemo",
    "author":         "Demo",
    "copyright":      "Copyright © 2024",
    "description":    "Electron + React starter template",
    "appUserModelId": "com.demo",
    "title":          "ElectronReactDemo",
    "icon": {
      "win":   "resources/icon.ico",
      "mac":   "resources/icon.icns",
      "linux": "resources/icon.png"
    }
  },
  "window": { "width": 900, "height": 640, "minWidth": 680, "minHeight": 480 },
  "tray":   { "enabled": false, "tooltip": "ElectronReactDemo" },
  "log":    { "level": "info", "maxDays": 7 },
  "server": { "port": 3000 }
}
```

### Config Flow

```
app.config.json (single source of truth)
  ├─→ Main process code     Direct import (branding, window, log, server)
  ├─→ shared/config         DEFAULT_CONFIG reads from here
  ├─→ package.json          sync-config syncs: name, author, description
  ├─→ electron-builder.yml  sync-config syncs: appId, productName, icons, etc.
  └─→ frontend/index.html   sync-config syncs: <title>
```

`npm run dev` and `npm run build` automatically run `sync-config` via `predev` / `prebuild` hooks. Just edit `app.config.json` and start — no manual sync needed.

### Runtime Config

On first launch, the app creates `userData/data/app.config.json` as a deep copy of the defaults. Users can manually edit this file and restart to override defaults.

| Item | Dev Mode Path | Packaged Path |
|---|---|---|
| Data directory | `<project-root>/data/` | `<userData>/data/` |
| Config file | `data/app.config.json` | `<userData>/data/app.config.json` |
| Database | `data/app.db` | `<userData>/data/app.db` |
| Log files | `data/logs/YYYY-MM-DD.log` | `<userData>/data/logs/YYYY-MM-DD.log` |

> On Windows, `<userData>` is `C:\Users\<username>\AppData\Roaming\ElectronReactDemo\`

---

## IPC Communication

Electron enforces strict process isolation — all interaction must go through IPC. This project provides a type-safe bidirectional IPC framework.

### Full Call Chain

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

### Direction 1 — Renderer → Main (request/response)

**Step 1: Register channel in allowlist**

```ts
// shared/types/ipc.ts
export const INVOKE_CHANNELS = [
  'note:list',
  'note:create',
  // new channels must be added here first
] as const
```

**Step 2: Register handler in main process**

```ts
// electron/controller/note.controller.ts
defineIpc('note', {
  list:   ()      => noteService.list(),
  create: (input) => noteService.create(input),
})
```

`defineIpc` auto-registers `ipcMain.handle` and wraps every response into `{ ok: true, data }` or `{ ok: false, message }`.

**Step 3: Wrap API in renderer**

```ts
// frontend/src/api/note.ts
export const noteApi = createApi<{ list: () => Promise<Note[]> }>('note')
```

**Step 4: Call from component**

```ts
const notes = await noteApi.list()
```

### Direction 2 — Main → Renderer (event push)

**Main process emits events:**

```ts
const emit = defineEmitter<DownloadEventMap>('download')
emit.broadcast.progress({ percent: 50, speed: '1.2 MB/s' })
emit.to(win).progress(...)           // target specific window
```

**Renderer subscribes:**

```ts
export const downloadEvents = createEvents<DownloadEventMap>('download')

// In component — auto subscribe/cleanup
useIpcEvent(downloadEvents.progress, (p) => setProgress(p))
```

### Adding a New IPC Endpoint (full walkthrough)

```
1. shared/types/ipc.ts       — Add to allowlist
2. shared/types/xxx.ts       — Define namespace constant and types
3. electron/service/xxx.ts   — Business logic
4. electron/controller/xxx.ts — defineIpc registration
5. frontend/src/api/xxx.ts   — createApi / createEvents wrapper
6. Use in component
```

Controllers are auto-loaded via `import.meta.glob` — no manual registration needed.

---

## Internationalization (i18n)

Lightweight React Context-based i18n system (no external dependencies), supporting English and Chinese.

```tsx
// Toggle language
const { lang, tr, toggleLang } = useLang()

// Use translations
<h1>{tr.welcome.title}</h1>
<p>{tr.note.created(note.createdAt, note.locale)}</p>
```

All translations are centralized in `frontend/src/infra/i18n.ts`. Supports functional interpolation (e.g. date formatting). Language toggle available in the top toolbar.

---

## Theme System

Dark/light theme toggle with a custom color system seamlessly integrated with Ant Design.

```tsx
// Toggle theme
const { t, toggle } = useTheme()

// Use theme colors
background: t.bgCard
color: t.accent
```

- 17 semantic color tokens (backgrounds, borders, text, accent, etc.)
- Auto-mapped to Ant Design's `ConfigProvider` (`colorPrimary`, `colorBgBase`, etc.)
- Global CSS (scrollbars, animations) adapts to theme automatically

---

## Logger

### Main Process Logger

| Feature | Behavior |
|---|---|
| Dev mode | ANSI-colored console output, `debug` level |
| Prod mode | File + stdout output, level from `app.config.json` `log.level` |
| Log path | `<userData>/data/logs/YYYY-MM-DD.log` |
| Retention | `log.maxDays` config (default 7 days; old files need manual cleanup) |

```ts
const logger = createLogger('namespace')
logger.info('message', { key: 'value' })
```

### Renderer Logger

Console-only output (no file writing in browser). Dev mode: `debug` level. Prod mode: `info` level.

---

## SQLite

### Database Path

```ts
// electron/infra/config.ts
export function getDataDir(): string {
  return join(app.getPath('userData'), 'data')   // writable after packaging
}
```

| Environment | Database Path |
|---|---|
| Development | `<project-root>/data/app.db` |
| Packaged | `<userData>/data/app.db` |

### Migrations

```ts
// electron/infra/database.ts
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS notes (...)`,
  // append new migration SQL for future versions
]
```

Migrations run on every startup in order. Current statements use `IF NOT EXISTS` for idempotency.

### Important Notes

- **better-sqlite3 is synchronous** — only use in main process, never in renderer
- **WAL mode** creates `app.db-wal` and `app.db-shm` temp files; they vanish on clean shutdown
- After upgrading Electron, recompile the native module: `npm run re-sqlite`

---

## Packaging

### out/ vs release/

```
npm run build     → out/      Compiled JS/HTML (no Electron runtime, cannot run standalone)
npm run dist:win  → release/  Full packaged app (Chromium + Node.js, ready to ship)
```

`electron-builder` packs `out/` contents into `resources/app.asar` and merges with the Electron runtime to produce the installer.

### Blank White Screen After Packaging

The `loadFile` path is computed relative to `__dirname`. Dev mode uses `loadURL(devServer)` so the path is never evaluated — the bug only surfaces in production.

```
Packaged directory layout:
  resources/app.asar/
    out/main/index.js       ← __dirname points here
    out/renderer/index.html ← target file

✅ Correct:  join(__dirname, '../renderer/index.html')
❌ Wrong:    join(__dirname, '../../renderer/index.html')  → escapes out/ → blank screen
```

### Windows Packaging Fails: "Cannot Create Symbolic Link"

**Error**: `Cannot create symbolic link : A required privilege is not held by the client`

**Cause**: `electron-builder` downloads a `winCodeSign` archive containing macOS `.dylib` symlinks. Extracting them on Windows requires the *Create symbolic links* privilege.

**Fix**: Enable **Developer Mode** in Windows Settings.

> Settings → System → For developers → Developer Mode → On

> Open a **new terminal** after enabling it — existing sessions don't inherit the privilege.

### Package Size

`win-unpacked/` is ~422 MB (Chromium ~280 MB + Electron ~120 MB + app ~5 MB) — this is Electron's fixed overhead. The **NSIS installer** compresses to ~80–100 MB.

---

## Icons

### Current Icon

Purple-blue gradient rounded rectangle with white "ER" text, generated by `scripts/generate-icon.mjs`.

### Regenerate

```bash
npm run gen-icon
```

Edit the SVG template in the script (colors, text) and regenerate.

### Replace with Custom Icon

Place your icon files in `resources/`:
- `icon.ico` — Windows (multi-size: 16/32/48/256)
- `icon.png` — Linux / dev mode (256×256)
- `icon.icns` — macOS

Then update `branding.icon` paths in `app.config.json` and run `npm run dev` (auto-syncs).

---

## Dev vs Prod Differences

| Feature | Dev Mode | Prod Mode |
|---|---|---|
| Log level | `debug` | From `app.config.json` (default `info`) |
| Page loading | Vite dev server URL | `out/renderer/index.html` |
| DevTools | Auto-open | Not opened |
| Menu bar | Visible | Auto-hidden |
| Security warnings | Suppressed (Vite HMR needs `unsafe-eval`) | Normal |
| Single instance | PID file guard (prevents duplicate windows) | None |

---

## .npmrc Mirror

The project uses Chinese mirrors for faster downloads:

```ini
registry=https://registry.npmmirror.com/
electron_mirror=https://npmmirror.com/mirrors/electron/
```