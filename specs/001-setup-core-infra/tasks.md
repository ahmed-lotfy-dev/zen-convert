---
description: "Task list for Core Infrastructure Setup feature implementation"
---

# Tasks: Core Infrastructure Setup

**Input**: Design documents from `/specs/001-setup-core-infra/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The Constitution requires TDD for critical paths, so tests are included for critical paths.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize Node.js 20.11 LTS project with TypeScript 5.3, Electron 28, React 18.2, Vite 5, Zustand 4, React Router 6, Electron Builder 24 dependencies
- [ ] T003 [P] Configure ESLint in .eslintrc.cjs for TypeScript strict mode
- [ ] T004 [P] Configure Prettier in .prettierrc for code formatting
- [ ] T005 [P] Configure TypeScript in tsconfig.json with strict mode and path aliases
- [ ] T006 [P] Configure electron-vite in electron.vite.config.ts for main, preload, renderer processes
- [ ] T007 [P] Configure Vitest in vitest.config.ts for unit testing
- [ ] T008 [P] Configure Playwright in playwright.config.ts for E2E testing
- [ ] T009 [P] Add npm scripts to package.json (dev, build, test:unit, test:e2e, lint, typecheck, package)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create TypeScript type definitions for WindowState in src/renderer/types/window.ts
- [ ] T011 [P] Create TypeScript type definitions for NavigationState in src/renderer/types/navigation.ts
- [ ] T012 [P] Create TypeScript type definitions for SelectedFile in src/renderer/types/file.ts
- [ ] T013 Create IPC request/response interfaces in src/preload/ipc-types.ts
- [ ] T014 Setup electron-store configuration in src/main/store/index.ts with WindowState and NavigationState schemas
- [ ] T015 Create main process entry point in src/main/index.ts with Electron app lifecycle (ready, quit, window-all-closed)
- [ ] T016 Create preload script in src/preload/index.ts with contextBridge exposing safe IPC APIs
- [ ] T017 Create renderer entry point in src/renderer/main.tsx with React 18.2 root render
- [ ] T018 [P] Setup electron-log structured logging in src/main/utils/logger.ts with path redaction
- [ ] T019 [P] Create license-checker script in package.json for automated license validation
- [ ] T020 Configure GitHub Actions workflow in .github/workflows/ci.yml with matrix builds for Windows/macOS/Linux

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Application Launch and Basic Navigation (Priority: P1) 🎯 MVP

**Goal**: Establish the application shell with a responsive window, header, sidebar navigation, and main content area. Users can launch the app and navigate between the three tool sections.

**Independent Test**: Launch the application and verify:

1. Window opens at 900x600 minimum size
2. Header displays "ZenConvert"
3. Sidebar shows Image Converter, Video Converter, YouTube Downloader
4. Clicking navigation items highlights them and updates main content
5. Window state persists across restarts

### Tests for User Story 1 (TDD for critical paths) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US1] E2E test for application launch in tests/e2e/launch.spec.ts
- [ ] T022 [P] [US1] E2E test for navigation switching in tests/e2e/navigation.spec.ts
- [ ] T023 [P] [US1] Unit test for window state persistence in tests/unit/main/store/store.test.ts

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create WindowManager class in src/main/window/WindowManager.ts for window lifecycle
- [ ] T025 [P] [US1] Create bounds calculation utility in src/main/window/bounds.ts for platform-specific window positioning
- [ ] T026 [P] [US1] Create Header component in src/renderer/components/layout/Header.tsx with "ZenConvert" title
- [ ] T027 [P] [US1] Create Sidebar component in src/renderer/components/layout/Sidebar.tsx with navigation items (Image Converter, Video Converter, YouTube Downloader)
- [ ] T028 [P] [US1] Create MainContent component in src/renderer/components/layout/MainContent.tsx for displaying active tool
- [ ] T029 [US1] Create navigation Zustand store in src/renderer/stores/navigation.ts with ToolType enum (IMAGE_CONVERTER, VIDEO_CONVERTER, YOUTUBE_DOWNLOADER)
- [ ] T030 [US1] Create window IPC handlers in src/main/ipc/window.ts for get-state, minimize, maximize, unmaximize, set-bounds
- [ ] T031 [US1] Create navigation IPC handlers in src/main/ipc/navigation.ts for set-tool, get-tool
- [ ] T032 [US1] Create window service in src/renderer/services/window.ts to wrap window IPC calls
- [ ] T033 [US1] Create navigation service in src/renderer/services/navigation.ts to wrap navigation IPC calls
- [ ] T034 [US1] Implement window state restoration in src/main/window/WindowManager.ts (restore bounds from electron-store on app.ready)
- [ ] T035 [US1] Implement window state persistence in src/main/window/WindowManager.ts (save bounds on resize, move, maximize)
- [ ] T036 [US1] Create navigation persistence middleware in src/renderer/stores/navigation.ts to sync Zustand state with electron-store
- [ ] T037 [US1] Update main process in src/main/index.ts to register window and navigation IPC handlers
- [ ] T038 [US1] Update preload script in src/preload/index.ts to expose window and navigation IPC APIs via contextBridge
- [ ] T039 [US1] Create placeholder page components in src/renderer/pages/ (ImageConverter.tsx, VideoConverter.tsx, YouTubeDownloader.tsx)
- [ ] T040 [US1] Create App component in src/renderer/App.tsx that uses React Router 6 to render Sidebar, Header, and MainContent
- [ ] T041 [US1] Connect Sidebar navigation to navigation store in src/renderer/components/layout/Sidebar.tsx (highlight active tool)
- [ ] T042 [US1] Connect MainContent to navigation store in src/renderer/components/layout/MainContent.tsx (render active tool page)
- [ ] T043 [US1] Configure React Router 6 in src/renderer/main.tsx with routes for image-converter, video-converter, youtube-downloader
- [ ] T044 [US1] Add WCAG 2.1 Level AA accessibility attributes to layout components (ARIA labels, semantic HTML, keyboard nav)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - File Selection and Display (Priority: P2)

**Goal**: Enable users to select files from their system via a file picker dialog and see them displayed in a list with their filenames and basic metadata. Users can remove files from the list.

**Independent Test**:

1. Click file selection button
2. Select one or more image files from dialog
3. Files appear in the UI with filenames
4. Click remove button next to a file
5. File is removed from list and other files remain visible

### Tests for User Story 2 (TDD for critical paths) ⚠️

- [ ] T045 [P] [US2] Integration test for file dialog IPC flow in tests/integration/dialog.test.ts
- [ ] T046 [P] [US2] Unit test for SelectedFile validation in tests/unit/main/ipc/files.test.ts

### Implementation for User Story 2

- [ ] T047 [P] [US2] Create FileFilter utility in src/main/utils/file.ts to validate file extensions (jpg, jpeg, png, webp, mp4, avi, mov, mkv, mp3, wav, ogg, flac)
- [ ] T048 [P] [US2] Create file validation utility in src/main/utils/validation.ts to check file existence, readability, size limits (100MB images, 1GB videos, 50MB audio)
- [ ] T049 [P] [US2] Create file metadata extraction utility in src/main/utils/file.ts to read file size, last modified timestamp, MIME type
- [ ] T050 [P] [US2] Create FilePicker component in src/renderer/components/files/FilePicker.tsx with "Select Files" button
- [ ] T051 [P] [US2] Create FileItem component in src/renderer/components/files/FileItem.tsx to display single file with remove button
- [ ] T052 [P] [US2] Create FileList component in src/renderer/components/files/FileList.tsx to display array of FileItems
- [ ] T053 [US2] Create files Zustand store in src/renderer/stores/files.ts with SelectedFile[] state
- [ ] T054 [US2] Create dialog IPC handlers in src/main/ipc/dialog.ts for open, save operations
- [ ] T055 [US2] Create files IPC handlers in src/main/ipc/files.ts for validate, get-metadata operations
- [ ] T056 [US2] Create dialog service in src/renderer/services/dialog.ts to wrap dialog.open IPC call with FileFilter[]
- [ ] T057 [US2] Create files service in src/renderer/services/files.ts to wrap files.validate and files.get-metadata IPC calls
- [ ] T058 [US2] Implement dialog IPC handler in src/main/ipc/dialog.ts for opening file dialog with platform-specific options (multiSelections, properties per OS)
- [ ] T059 [US2] Implement file validation in src/main/ipc/files.ts with error codes (FILE_NOT_FOUND, FILE_TOO_LARGE, UNSUPPORTED_FORMAT, FILE_NOT_READABLE)
- [ ] T060 [US2] Implement SelectedFile creation in src/main/ipc/dialog.ts with UUID generation and metadata extraction
- [ ] T061 [US2] Update preload script in src/preload/index.ts to expose dialog and files IPC APIs via contextBridge
- [ ] T062 [US2] Connect FilePicker to dialog service in src/renderer/components/files/FilePicker.tsx
- [ ] T063 [US2] Connect FilePicker to files store in src/renderer/components/files/FilePicker.tsx to add selected files
- [ ] T064 [US2] Connect FileItem remove button to files store in src/renderer/components/files/FileItem.tsx to remove file
- [ ] T065 [US2] Connect FileList to files store in src/renderer/components/files/FileList.tsx to display files
- [ ] T066 [US2] Add FileList to ImageConverter page in src/renderer/pages/ImageConverter.tsx as initial file selection UI
- [ ] T067 [US2] Add WCAG 2.1 Level AA accessibility to file components (keyboard navigation, focus indicators, ARIA labels)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Communication Between Frontend and Backend (Priority: P2)

**Goal**: Establish a working communication layer with request/response pattern for all IPC operations. File dialogs, navigation, and window operations work via IPC with proper error handling.

**Independent Test**:

1. Renderer sends test message to backend
2. Backend receives and responds
3. File dialog request opens system dialog
4. Error conditions return proper error messages to UI

### Tests for User Story 3 (TDD for critical paths) ⚠️

- [ ] T068 [P] [US3] Integration test for IPC request/response in tests/integration/ipc-communication.test.ts
- [ ] T069 [P] [US3] E2E test for error handling in tests/e2e/error-handling.spec.ts

### Implementation for User Story 3

- [ ] T070 [P] [US3] Create IPC request validation middleware in src/main/ipc/middleware.ts to validate request schemas and enforce rate limits (100 req/sec)
- [ ] T071 [P] [US3] Create IPC error handler in src/main/ipc/error-handler.ts to format errors with error codes (FILE_NOT_FOUND, DIALOG_CANCELLED, etc.)
- [ ] T072 [P] [US3] Create IPC timeout handler in src/main/ipc/timeout-handler.ts with 30s default timeout
- [ ] T073 [US3] Implement request/response pattern in src/main/ipc/dialog.ts with requestId correlation and error handling
- [ ] T074 [US3] Implement request/response pattern in src/main/ipc/window.ts with requestId correlation and error handling
- [ ] T075 [US3] Implement request/response pattern in src/main/ipc/files.ts with requestId correlation and error handling
- [ ] T076 [US3] Implement request/response pattern in src/main/ipc/navigation.ts with requestId correlation and error handling
- [ ] T077 [US3] Create event emitters in src/main/ipc/events.ts for navigation:changed, window:bounds-changed, files:progress
- [ ] T078 [US3] Update main process in src/main/index.ts to register IPC middleware and error handlers
- [ ] T079 [US3] Update preload script in src/preload/index.ts to implement request/response wrapper with timeout handling
- [ ] T080 [US3] Create ErrorAlert component in src/renderer/components/ui/ErrorAlert.tsx to display error messages with user-friendly text
- [ ] T081 [US3] Add error handling to dialog service in src/renderer/services/dialog.ts (catch errors, display ErrorAlert)
- [ ] T082 [US3] Add error handling to files service in src/renderer/services/files.ts (catch errors, display ErrorAlert)
- [ ] T083 [US3] Add error handling to window service in src/renderer/services/window.ts (catch errors, display ErrorAlert)
- [ ] T084 [US3] Add error handling to navigation service in src/renderer/services/navigation.ts (catch errors, display ErrorAlert)
- [ ] T085 [US3] Add ErrorAlert to App component in src/renderer/App.tsx as global error display

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T086 [P] Update README.md with installation and development instructions
- [ ] T087 [P] Add performance benchmarks to scripts in package.json (measure launch time, IPC round-trip)
- [ ] T088 [P] Add accessibility audit script in package.json using @axe-core/react
- [ ] T089 [P] Create converter plugin registry stub in src/main/converters/registry.ts for future extensibility
- [ ] T090 [P] Add platform-specific launch scripts in package.json for Windows, macOS, Linux
- [ ] T091 Code cleanup: Remove unused imports and dead code across all files
- [ ] T092 Add inline comments for critical path logic (window state, IPC, file validation)
- [ ] T093 Performance optimization: Add React.memo() to expensive components (FileList, Sidebar)
- [ ] T094 Performance optimization: Debounce window resize events in src/renderer/services/window.ts (100ms debounce)
- [ ] T095 Performance optimization: Lazy load page components in src/renderer/App.tsx using React.lazy()
- [ ] T096 Security: Add path sanitization in src/main/utils/logger.ts to redact all user paths
- [ ] T097 Security: Add file path validation in src/main/ipc/files.ts to reject relative paths and parent directory references
- [ ] T098 [P] Add unit tests for utility functions in tests/unit/main/utils/file.test.ts and tests/unit/main/utils/validation.test.ts
- [ ] T099 [P] Add component tests for UI components in tests/unit/renderer/components/layout.test.ts
- [ ] T100 [P] Add store tests for Zustand stores in tests/unit/renderer/stores/navigation.test.ts and tests/unit/renderer/stores/files.test.ts
- [ ] T101 Run all tests: `npm test` (Vitest unit tests + Playwright E2E tests)
- [ ] T102 Run linting: `npm run lint` and fix all issues
- [ ] T103 Run typecheck: `npm run typecheck` and fix all errors
- [ ] T104 Validate quickstart.md: Follow all installation and development steps, verify no errors
- [ ] T105 Validate window state persistence: Launch app, resize window, close and reopen, verify size/position restored
- [ ] T106 Validate navigation persistence: Switch tools, close and reopen app, verify last tool is active
- [ ] T107 Measure launch time: Ensure <3s cold start on modern hardware (as per SC-001)
- [ ] T108 Measure IPC round-trip: Ensure <100ms for simple operations (as per SC-005)
- [ ] T109 Test file list performance: Select 50 files, verify no UI lag (as per SC-004)
- [ ] T110 Run accessibility audit: Test with NVDA (Windows), VoiceOver (macOS), ORCA (Linux)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 layout but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 and US2 with error handling but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD for critical paths)
- Components can be created in parallel (different files)
- IPC handlers depend on type definitions from Foundational phase
- Services depend on IPC handlers
- Components depend on services and stores
- Page components depend on layout components
- App component integrates all components

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD approach):
Task: "E2E test for application launch in tests/e2e/launch.spec.ts"
Task: "E2E test for navigation switching in tests/e2e/navigation.spec.ts"
Task: "Unit test for window state persistence in tests/unit/main/store/store.test.ts"

# After tests fail, launch all components for User Story 1 together:
Task: "Create Header component in src/renderer/components/layout/Header.tsx"
Task: "Create Sidebar component in src/renderer/components/layout/Sidebar.tsx"
Task: "Create MainContent component in src/renderer/components/layout/MainContent.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together (TDD approach):
Task: "Integration test for file dialog IPC flow in tests/integration/dialog.test.ts"
Task: "Unit test for SelectedFile validation in tests/unit/main/ipc/files.test.ts"

# After tests fail, launch all components for User Story 2 together:
Task: "Create FilePicker component in src/renderer/components/files/FilePicker.tsx"
Task: "Create FileItem component in src/renderer/components/files/FileItem.tsx"
Task: "Create FileList component in src/renderer/components/files/FileList.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch all tests for User Story 3 together (TDD approach):
Task: "Integration test for IPC request/response in tests/integration/ipc-communication.test.ts"
Task: "E2E test for error handling in tests/e2e/error-handling.spec.ts"

# After tests fail, launch all middleware for User Story 3 together:
Task: "Create IPC request validation middleware in src/main/ipc/middleware.ts"
Task: "Create IPC error handler in src/main/ipc/error-handler.ts"
Task: "Create IPC timeout handler in src/main/ipc/timeout-handler.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T020) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T021-T044)
4. **STOP and VALIDATE**:
   - Launch app: verify window opens at 900x600
   - Check header displays "ZenConvert"
   - Click navigation items: verify highlighting and content updates
   - Close and reopen: verify window state and navigation persisted
   - Measure launch time: should be <3s
5. Run validation: `npm run lint`, `npm run typecheck`, `npm test`
6. Demo: Show working application with navigation

### Incremental Delivery

1. Complete Setup + Foundational (T001-T020) → Foundation ready
2. Add User Story 1 (T021-T044) → Test independently → Deploy/Demo (MVP!)
   - Launch app, navigate between tools, verify persistence
3. Add User Story 2 (T045-T067) → Test independently → Deploy/Demo
   - Select files, see in list, remove files
4. Add User Story 3 (T068-T085) → Test independently → Deploy/Demo
   - Verify error handling, IPC communication
5. Polish (T086-T110) → Final release
   - Performance optimization, accessibility audit, documentation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T020)
2. Once Foundational is done:
   - Developer A: User Story 1 (T021-T044)
   - Developer B: User Story 2 (T045-T067)
   - Developer C: User Story 3 (T068-T085)
3. Stories complete and integrate independently
4. Team completes Polish together (T086-T110)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD for critical paths)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)
- All user stories are required for feature completion
- Window state persistence and navigation persistence are critical for all stories
- IPC error handling (User Story 3) enhances reliability of all operations
- Accessibility (WCAG 2.1 Level AA) applies to all components
- Performance targets: <3s launch, <100ms IPC, 50 files without lag
