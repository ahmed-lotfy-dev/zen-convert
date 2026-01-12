# Implementation Plan: Core Infrastructure Setup

**Branch**: `001-setup-core-infra` | **Date**: 2026-01-12 | **Spec**: spec.md
**Input**: Feature specification from `/specs/001-setup-core-infra/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Primary requirement: Establish core desktop application infrastructure with responsive UI, file selection, and frontend-backend communication using Electron. Technical approach: Electron desktop app with React frontend, Node.js backend, implementing navigation, file dialogs, and request/response communication layer.

## Technical Context

**Language/Version**: Node.js 20.11 LTS, TypeScript 5.3
**Primary Dependencies**: Electron 28, React 18.2, Vite 5, Zustand 4, React Router 6, Electron Builder 24
**Storage**: Local file system with electron-store for configuration persistence
**Testing**: Vitest (unit), React Testing Library (component), Playwright (E2E)
**Target Platform**: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
**Project Type**: desktop (Electron with separate main/preload/renderer processes)
**Performance Goals**: <3s launch time, <100ms round-trip IPC communication, UI handles 50 files without lag
**Constraints**: Cross-platform (Windows/macOS/Linux), local-only file processing (no cloud), offline-capable, 900x600 minimum window size, WCAG 2.1 Level AA accessibility
**Scale/Scope**: Single-user desktop application, 3 navigation sections (Image Converter, Video Converter, YouTube Downloader), plugin-based converter architecture

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Performance and Efficiency

- ✅ Asynchronous processing required for file operations
- ✅ Round-trip communication target <100ms (SC-005)
- ✅ UI must handle 50 files without lag (SC-004)
- ✅ **RESOLVED**: Benchmark target for Electron app launch time <3s achieved via lazy loading, code splitting, tree shaking, async initialization, and asset compression (see research.md)

### Security and Privacy

- ✅ Local-only file processing (Constitution II)
- ✅ **RESOLVED**: Electron sandbox mode enabled with `protocol.registerFileProtocol()`; file paths never exposed to renderer; IPC-only file access (see research.md)
- ✅ **RESOLVED**: Structured logging with electron-log; sensitive paths redacted using regex patterns; logs stored locally only, never transmitted (see research.md)

### Cross-Platform Compatibility

- ✅ Electron framework selected for Windows, macOS, Linux support (Constitution III)
- ✅ **RESOLVED**: electron-store for cross-platform JSON storage with platform-specific bounds calculation (Windows: subtract taskbar, macOS: add menu bar, Linux: safe defaults) (see research.md)
- ✅ **RESOLVED**: Unified wrapper around Electron's `dialog.showOpenDialog()` with platform-specific options; handles macOS bundles, Windows auto-append extensions, Linux DE variations (see research.md)

### Extensible Format Support

- ✅ Architecture will allow plugin-based format additions (Constitution IV)
- ✅ **RESOLVED**: Registry pattern with TypeScript module augmentation; plugins register at startup via dynamic import; type-safe interface declarations (see research.md)
- ✅ **RESOLVED**: Initial formats: Images (JPEG, PNG, WebP), Videos (MP4, AVI), Audio (MP3, WAV); conversion graph via intermediate formats (see research.md)

### User-Centric Design

- ✅ Drag-and-drop UI required (Constitution V)
- ✅ Responsive design with 900x600 minimum (FR-001, SC-006)
- ✅ Error feedback required (FR-012)
- ✅ **RESOLVED**: WCAG 2.1 Level AA compliance; keyboard navigation, screen reader support, color contrast ≥4.5:1, semantic HTML, ARIA labels; testing with NVDA, VoiceOver, ORCA, @axe-core/react (see research.md)
- ✅ **RESOLVED**: Dual progress indicator with percentage (0-100) + estimated time remaining; "X of Y files processed" for batches; linear progress bar with animated spinner for indeterminate (see research.md)

### Additional Constraints

- ✅ Open-source dependencies with permissive licenses (Constitution)
- ✅ **RESOLVED**: Automated license checking via `license-checker` script; allowed licenses: MIT, Apache 2.0, BSD 2/3-Clause, ISC, 0BSD; rejected: GPL, AGPL, MPL, proprietary (see research.md)
- ✅ **RESOLVED**: GitHub Actions with matrix builds for Windows/macOS/Linux; stages: lint, unit tests, build, E2E tests, package; artifact signing via electron-notarize (macOS) and code signing (Windows) (see research.md)

### Development Workflow

- ✅ TDD for critical paths (Constitution)
- ✅ Code reviews required (Constitution)
- ✅ **RESOLVED**: CI/CD setup via GitHub Actions; parallel matrix builds; artifact upload; smoke testing of packaged apps (see research.md)

**GATE STATUS**: ✅ PASSED - All 11 NEEDS CLARIFICATION items resolved in Phase 0 research (see research.md)

---

**Post-Phase 1 Design Re-Check**:

- ✅ All technical decisions align with Constitution principles
- ✅ Architecture supports future extensibility (plugin system)
- ✅ Performance targets achievable with selected tech stack
- ✅ Security requirements met (sandbox, local-only, path redaction)
- ✅ Cross-platform compatibility ensured (Electron + unified wrappers)
- ✅ User experience requirements satisfied (WCAG AA, dual progress, drag-and-drop)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/                    # Electron main process
│   ├── index.ts            # Entry point (app lifecycle)
│   ├── window/             # Window management
│   │   ├── WindowManager.ts
│   │   └── bounds.ts       # Bounds calculation logic
│   ├── ipc/                # IPC handlers
│   │   ├── dialog.ts       # File dialog operations
│   │   ├── window.ts       # Window operations
│   │   ├── files.ts        # File validation/metadata
│   │   └── navigation.ts   # Navigation state
│   ├── store/              # electron-store setup
│   │   └── index.ts
│   └── converters/         # Converter plugins (future)
│       └── registry.ts
│
├── preload/                # Preload script (sandbox bridge)
│   └── index.ts            # contextBridge APIs
│
└── renderer/               # React frontend (Vite)
    ├── main.tsx            # React entry point
    ├── App.tsx             # Root component
    ├── components/         # Reusable components
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── MainContent.tsx
    │   ├── files/
    │   │   ├── FileList.tsx
    │   │   ├── FileItem.tsx
    │   │   └── FilePicker.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       ├── ProgressBar.tsx
    │       └── ErrorAlert.tsx
    ├── pages/              # Page components per tool
    │   ├── ImageConverter.tsx
    │   ├── VideoConverter.tsx
    │   └── YouTubeDownloader.tsx
    ├── stores/             # Zustand state stores
    │   ├── navigation.ts
    │   ├── files.ts
    │   └── ui.ts
    ├── services/           # API services (IPC wrappers)
    │   ├── dialog.ts
    │   ├── window.ts
    │   ├── files.ts
    │   └── navigation.ts
    ├── types/              # TypeScript type definitions
    │   ├── file.ts
    │   ├── window.ts
    │   └── navigation.ts
    └── utils/              # Utility functions
        ├── file.ts
        └── validation.ts

tests/
├── unit/                   # Vitest unit tests
│   ├── main/               # Main process tests
│   │   ├── ipc/
│   │   ├── window/
│   │   └── store/
│   └── renderer/           # Renderer process tests
│       ├── components/
│       ├── stores/
│       └── services/
├── integration/            # IPC integration tests
│   ├── dialog.test.ts
│   ├── window.test.ts
│   └── files.test.ts
└── e2e/                    # Playwright E2E tests
    ├── navigation.spec.ts
    ├── file-selection.spec.ts
    └── window-state.spec.ts
```

**Structure Decision**: Electron desktop application with three-process architecture (main, preload, renderer). The main process handles OS-level operations (window, dialogs, file system), the preload script provides a secure bridge, and the renderer process runs the React UI. State is managed via Zustand in the renderer and electron-store in the main. This structure supports the specified cross-platform requirements, plugin architecture, and separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
