# zen-convert Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-13

## Active Technologies

- Node.js 20.11 LTS / TypeScript 5.3 + Tauri 2.0, React 18.2, Vite 5, Zustand 4, React Router 6 (001-setup-core-infra)

## Project Structure

```text
src/
src-tauri/
tests/
```

## Commands

npm test; npm run lint; npm run tauri dev

## Code Style

Node.js 20+ / TypeScript 5.3: Follow standard conventions (TDD for critical paths, code reviews, CI/CD)

## Recent Changes

- Migrated from Electron to Tauri 2.0.
- Implemented `convert_image` backend logic using `image` crate (support for resize, quality, and custom output directory).
- Updated `ImageConverter` UI with Width/Height inputs, Quality slider, and Output Directory selection.
- Added output directory persistence and interaction flow (Ask user if undefined).
- Added progress bar and completion dialog for better user feedback.
- Removed `heic` support (not available in standard backend).

## TODOs

- Implement `get_youtube_info` and `download_youtube_video` Rust backend logic.
- Add advanced FFmpeg progress reporting with real-time events.
- Add subtitle styling options UI for ASS format.
- Implement video preview in VideoConverter UI.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
