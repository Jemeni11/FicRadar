# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[//]: # "Types of changes"
[//]: # "- **Added** for new features."
[//]: # "- **Changed** for changes in existing functionality."
[//]: # "- **Deprecated** for soon-to-be removed features."
[//]: # "- **Removed** for now removed features."
[//]: # "- **Fixed** for any bug fixes."
[//]: # "- **Security** in case of vulnerabilities."

## [Unreleased]

- Nil

## [1.2.0] - 2026-03-03

### Added

- Add real‑time scraping logs to the Author Scrape tab with `debug`/`info`/`warn`/`error` levels and timestamps.
- Add list / grid view toggle for story results in the Author Scrape tab.
- Add consistent footer with “Buy me a coffee” button and TalesTrove project link to both Author Scrape and File Upload tabs.
- Add structured `LogLevel` and `LogEntry` types to `src/types/index.ts` to support adapter logging.
- Add favicon to `author-scrape.html` and `file-upload.html`.

### Changed

- Switch XenForo adapter to use `progressCallback`‑driven logging instead of raw `console.*` calls, so logs appear in the UI without interfering with page‑progress values.
- Rename `*.html` bookmark exports to `*_stories_bookmark.html` to distinguish from regular `*.html` exports.
- Update `saveCSVFile` to escape CSV cells and add a UTF‑8 BOM (`\\uFEFF`) for better compatibility with spreadsheet apps.
- Update `saveHTMLFile` to simplify header‑extraction logic and remove redundant `StoryResult`‑type import.
- Restructure `author-scrape.tsx` and `file-upload.tsx` main‑content containers to use `flex flex‑col` and `overflow‑hidden` layouts while preserving responsive padding and spacing.

### Fixed

- Improve XenForo adapter’s edge‑case handling:
  - Log clearer messages when user has no recent content or no results on a page.
- Improve story‑list layout:
  - Use `w-full` container and `break‑all` for `author.name` to better handle long usernames.
  - Update page‑progress bar to avoid division‑by‑zero by using `Math.max(pagesTotal, 1)`.
- Minor fix in `extractUsername.ts` to handle `/search/member?user_id=`‑style URLs instead of silently failing.
- Corrected minimum Firefox version to 79 (from 45 desktop / 54 Android) in both documentation and manifest.

## [1.1.0] - 2025-09-25

### Added

- Responsive sidebar for author scraping tab, including a mobile toggle, overlay, and close button.
- Custom HTML templates for popup and tab pages, including meta tags and titles for better mobile rendering.
- Upload UX for mobile: full-page upload fallback and in-popup guidance (warnings and "Open Upload Page" CTA).
- Popovers with detailed supported file format instructions and browser-specific upload caveats.
- Documentation updates: Firefox compatibility notes (API/version support) and link to official guide for Firefox for Android development.
- Explicit `data_collection_permissions` declaration in Firefox manifest (set to `"none"`).

### Changed

- Improved sidebar behavior on small screens: closes automatically after selecting an author, transitions smoothly in/out, and adjusts main content layout accordingly.
- Updated `file-upload` tab layout to stack vertically on small screens and horizontally on larger screens.
- `.gitignore` now excludes `diff.txt`.
- Popup layout is now responsive: uses pointer media queries to switch between compact (desktop) and full-width (mobile) presentations.
- Refactored file-upload form structure to separate coarse/fine pointer experiences and improve accessibility and flow.
- Story list in author scraping tab now uses larger spacing and slightly bigger text for readability (scales down on larger screens).
- Scripts for testing and linting in Firefox (desktop and Android) using web-ext.

### Fixed

- Corrected BuyMeACoffee link (`https://www.buymeacoffee.com/jemeni11`).

## [1.0.0] - 2025-07-15

Released FicRadar

[unreleased]: https://github.com/Jemeni11/FicRadar/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/Jemeni11/FicRadar/releases/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Jemeni11/FicRadar/releases/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Jemeni11/FicRadar/releases/tag/v1.0.0
