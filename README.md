# Electron React Demo
<img width="1108" height="722" alt="image" src="https://github.com/user-attachments/assets/1f115e2e-c8f5-4f44-8234-5155b0932480" />
<img width="1108" height="722" alt="image" src="https://github.com/user-attachments/assets/8912cf6b-eae4-460a-9134-383e1073dda4" />


A desktop application starter built with **Electron 42**, **React 18**, and **TypeScript**. It demonstrates common patterns you'll need in a real Electron app — IPC communication, SQLite persistence, file system access, and push events from the main process — all wired up with a clean architecture and a dark UI powered by Ant Design v6.

## Tech Stack

| Layer | Technology |
|---|---|
| Shell | Electron 42 |
| Renderer | React 18 + TypeScript |
| Build | electron-vite + Vite 5 |
| UI | Ant Design v6 (dark theme) |
| Database | better-sqlite3 (WAL mode) |
| Packaging | electron-builder |

## Features

Five self-contained demo pages, each showcasing a different capability:

- **Counter** — local React state with `useState`, animated pop feedback
- **System Info** — reads OS/hardware data from the main process via IPC invoke
- **File Reader** — opens files through Electron's dialog API and streams content over IPC
- **Download** — main-process-initiated download with real-time progress pushed to the renderer
- **Notes** — full CRUD backed by a local SQLite database (`better-sqlite3`)

## Project Structure

```
electron/
  controller/     # IPC handlers (one file per feature)
  service/        # Business logic
  infra/          # Database, config, logger
  window/         # BrowserWindow factory
  preload/        # Context bridge
frontend/
  src/
    pages/        # React page components
    api/          # Typed IPC client wrappers
    hooks/        # Shared hooks
shared/
  types/          # Types shared between main and renderer
  config/         # Shared constants
```

## IPC Architecture

Two typed helpers live in `electron/utils/ipc.ts`:

```ts
// Renderer → Main: registers an invoke handler, returns a structured response
defineIpc(namespace, handlers)

// Main → Renderer: creates a type-safe broadcaster / targeted sender
defineEmitter<T>(namespace)
```

Every IPC call returns `{ ok: true, data }` or `{ ok: false, message, code }`, so the renderer never has to guess whether a call succeeded.

## Getting Started

### Prerequisites

- Node.js 20+
- **Windows only**: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload (required to compile `better-sqlite3`)

### Install & Run

```bash
# Install dependencies, download Electron binary, and rebuild native modules
npm install
npm run postinstall   # downloads Electron binary via mirror
npm run re-sqlite     # compiles better-sqlite3 for Electron

# Start in development mode
npm run dev
```

> `.npmrc` is pre-configured to use `npmmirror.com` for both the npm registry and the Electron binary mirror, which significantly speeds up installation in China.

### Build & Package

```bash
# Type-check only
npm run typecheck

# Package for the current platform
npm run dist

# Platform-specific builds
npm run dist:win    # Windows NSIS installer
npm run dist:mac    # macOS DMG
npm run dist:linux  # AppImage + deb
```

Output goes to the `release/` directory.

## Scripts

| Script | Description |
|---|---|
| `dev` | Start dev server with hot reload |
| `build` | Compile main + renderer |
| `postinstall` | Download Electron binary (runs automatically after `npm install`) |
| `re-sqlite` | Rebuild `better-sqlite3` against the current Electron version |
| `typecheck` | Run TypeScript type checking without emitting |
| `dist` | Build + package for current platform |
| `dist:win / mac / linux` | Build + package for a specific platform |

## Data Storage

At runtime the app writes to a platform-specific data directory (via `app.getPath('userData')`):

```
<userData>/
  app.config.json   # persisted user settings
  app.db            # SQLite database (WAL mode, foreign keys ON)
```

The `data/` folder is excluded from git.

## License

MIT
