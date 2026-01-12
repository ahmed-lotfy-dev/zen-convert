# Quickstart Guide: Core Infrastructure Setup

**Feature**: 001-setup-core-infra | **Date**: 2026-01-12

## Prerequisites

### Required Software

- **Node.js**: Version 20.11 LTS or higher
  - Download: https://nodejs.org/
  - Verify with: `node --version` (should be ≥ 20.11.0)

- **Git**: Version 2.40 or higher
  - Download: https://git-scm.com/
  - Verify with: `git --version`

- **npm**: Version 10 or higher (comes with Node.js)
  - Verify with: `npm --version`

### Platform-Specific Requirements

**Windows**:

- Windows 10 or higher (64-bit)
- Visual Studio Build Tools (for native dependencies)
  - Install via: https://visualstudio.microsoft.com/visual-cpp-build-tools/

**macOS**:

- macOS 11 (Big Sur) or higher
- Xcode Command Line Tools
  - Install via: `xcode-select --install`

**Linux**:

- Ubuntu 20.04+, Debian 11+, or equivalent
- Build dependencies:
  ```bash
  sudo apt-get update
  sudo apt-get install -y build-essential libgtk-3-dev libnotify-dev
  ```

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/zen-convert.git
cd zen-convert
```

### 2. Install Dependencies

```bash
npm install
```

This installs:

- Electron 28
- React 18.2
- TypeScript 5.3
- Vite 5
- All development dependencies

### 3. Verify Installation

```bash
npm run typecheck
npm run lint
```

Both commands should complete without errors.

## Development

### Start Development Server

```bash
npm run dev
```

This starts:

- Vite dev server for renderer process (http://localhost:5173)
- Electron main process with hot reload
- File watcher for automatic reloading

### Project Structure

```
zen-convert/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   ├── window/        # Window management
│   │   ├── ipc/           # IPC handlers
│   │   └── store/         # electron-store setup
│   │
│   ├── preload/           # Preload script
│   │   └── index.ts
│   │
│   └── renderer/          # React frontend
│       ├── main.tsx       # React entry
│       ├── App.tsx        # Root component
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── stores/        # Zustand stores
│       └── services/      # API services
│
├── electron.vite.config.ts    # Vite config for Electron
├── tsconfig.json              # TypeScript config
├── package.json
└── .specify/                  # Feature specs
```

### Key Files

**Main Process** (`src/main/index.ts`):

- Application lifecycle (ready, quit, window-all-closed)
- Window creation and management
- IPC channel registration

**Preload Script** (`src/preload/index.ts`):

- Expose safe APIs to renderer via contextBridge
- TypeScript type definitions for IPC

**Renderer Entry** (`src/renderer/main.tsx`):

- React root render
- Router setup
- Store initialization

## Building

### Build for Development

```bash
npm run build
```

This creates:

- `dist-electron/main/` - Main process bundle
- `dist-electron/preload/` - Preload script bundle
- `dist-electron/renderer/` - Renderer bundle

### Build for Production

```bash
npm run build:prod
```

Production build includes:

- Minified JavaScript/CSS
- Tree shaking (removes unused code)
- Source maps for debugging

## Testing

### Unit Tests

```bash
npm run test:unit
```

Runs Vitest tests for:

- Main process utilities
- Renderer process utilities
- IPC handlers (mocked)

### Component Tests

```bash
npm run test:component
```

Runs React Testing Library tests for:

- Component rendering
- User interactions
- Event handling

### E2E Tests

```bash
npm run test:e2e
```

Runs Playwright tests for:

- Full application flows
- IPC communication
- Window state persistence

### Test Coverage

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory.

## Linting and Type Checking

### Type Check

```bash
npm run typecheck
```

Runs TypeScript compiler to check for type errors.

### Lint

```bash
npm run lint
```

Runs ESLint on all TypeScript files.

### Format Code

```bash
npm run format
```

Formats code using Prettier.

### Fix Issues

```bash
npm run lint:fix
```

Automatically fixes linting issues.

## Packaging

### Package Current Platform

```bash
npm run package
```

Creates platform-specific installer in `dist/`:

- Windows: `ZenConvert Setup 1.0.0.exe`
- macOS: `ZenConvert-1.0.0.dmg`
- Linux: `zen-convert_1.0.0_amd64.deb`

### Package All Platforms

Requires cross-platform build environment. Use GitHub Actions CI/CD.

### Signing

**Windows**:
Set environment variable `CSC_LINK` to path of .pfx certificate file.

**macOS**:
Set environment variables:

- `APPLE_ID`: Apple ID email
- `APPLE_ID_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Developer team ID

## Common Issues

### Issue: "Module not found" errors

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Electron window is blank

**Solution**:

- Check console: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
- Look for React errors in console
- Verify renderer bundle built correctly

### Issue: IPC not working

**Solution**:

- Verify preload script is loaded
- Check IPC channel names match in main and preload
- Enable debug logging: `export DEBUG=*` (Linux/macOS) or `set DEBUG=*` (Windows)

### Issue: Window state not persisting

**Solution**:

- Check electron-store path (logs directory)
- Verify write permissions to config directory
- Clear store: Delete `~/.config/zen-convert/config.json` (Linux/macOS) or `%APPDATA%/zen-convert/config.json` (Windows)

### Issue: File dialog not opening

**Solution**:

- Verify dialog options are valid
- Check Electron version compatibility
- Test in development vs production mode

### Issue: TypeScript errors after installation

**Solution**:

```bash
npm install -D typescript@latest
npm install -D @types/node@latest
npm run typecheck
```

## Development Tips

### Hot Reload

- Changes to renderer process auto-reload via Vite
- Changes to main process require restart (Ctrl+R to reload)
- Use `npm run dev` for optimal dev experience

### Debugging

**Main Process**:

```typescript
// src/main/index.ts
console.log("Debug message", data);
```

**Renderer Process**:

```typescript
// src/renderer/App.tsx
console.log("Debug message", data);
```

**IPC Communication**:
Enable verbose IPC logging:

```typescript
mainWindow.webContents.send("debug:ipc", { channel, payload });
```

### Performance

- Use React.memo() for expensive components
- Virtualize long lists (react-window)
- Debounce window resize events
- Use Web Workers for file operations

### Accessibility

- Test with screen reader (NVDA on Windows, VoiceOver on macOS)
- Verify keyboard navigation (Tab, Enter, Escape)
- Check color contrast with axe DevTools

## Next Steps

After completing this quickstart:

1. Review the feature spec: `specs/001-setup-core-infra/spec.md`
2. Review the implementation plan: `specs/001-setup-core-infra/plan.md`
3. Review the IPC contracts: `specs/001-setup-core-infra/contracts/ipc.md`
4. Review the data model: `specs/001-setup-core-infra/data-model.md`
5. Start implementation following the plan in `tasks.md` (generated by `/speckit.tasks`)

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for development
npm run build:prod       # Build for production

# Testing
npm run test:unit        # Unit tests
npm run test:component   # Component tests
npm run test:e2e         # E2E tests
npm run test:coverage    # Coverage report

# Quality
npm run typecheck        # TypeScript check
npm run lint             # ESLint check
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier

# Packaging
npm run package          # Package current platform
npm run package:all      # Package all platforms (requires CI)

# Utilities
npm run clean            # Clean build artifacts
npm run reset            # Clean node_modules and reinstall
```

## Getting Help

- **Documentation**: See `docs/` directory
- **Issues**: https://github.com/your-username/zen-convert/issues
- **Discussions**: https://github.com/your-username/zen-convert/discussions

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Run `npm run lint` and `npm run typecheck`
4. Run all tests: `npm test`
5. Submit pull request with description of changes

## License

MIT License - see LICENSE file for details.
