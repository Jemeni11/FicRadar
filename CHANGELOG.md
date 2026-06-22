# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[//]: # 'Types of changes'
[//]: # '- **Added** for new features.'
[//]: # '- **Changed** for changes in existing functionality.'
[//]: # '- **Deprecated** for soon-to-be removed features.'
[//]: # '- **Removed** for now removed features.'
[//]: # '- **Fixed** for any bug fixes.'
[//]: # '- **Security** in case of vulnerabilities.'

## [2.0.0] — 2026-06-22

### Added

- Authored story detection: each scrape now runs two parallel requests —
  one for threads started by the author, one for all interactions. Results
  are annotated with an `isAuthor` flag.
- `getUserStoriesOnly` parameter on `getXenForoData` and all three site
  adapters; when true, matches `[href$="&content=thread"]` instead of the
  general member search selector.
- `isAuthor: boolean` field on `StoryResult` type; initialised to `false`
  in `collectPaginatedResults`.
- Dual progress display during scraping: separate "Authored Works" and
  "Forum Search" progress bars.
- Filter toolbar in story results: All / Discovered / Authored tabs and a
  title search input.
- `AuthoredBadge` (pen icon) shown on authored stories in list and grid views.
- Authored story count in the results summary line.
- Empty state when no stories match the active filters.
- `motion-safe:` guard on Radar sweep animation.
- `role="alert"` / `role="status"` on popup error and success banners.
- `role="tablist"`, `role="tab"`, `role="tabpanel"` on popup input switcher.
- `role="radiogroup"` / `role="radio"` on story filter tabs.
- `sr-only` label, `aria-invalid`, `aria-describedby` on URL input.
- `aria-label` on sidebar mobile toggle button.
- `aria-hidden` on decorative SVGs.
- `pnpm-workspace.yaml` with `allowBuilds` and `trustPolicy` settings.
- `oxlint`, `oxfmt`, `oxlint-tsgolint` for linting and formatting.
- `husky` + `lint-staged` pre-commit hook running oxlint and oxfmt.
- Config files: `.oxfmtrc.json`, `.oxlintrc.json`, `.lintstagedrc.json`,
  `.husky/pre-commit`.
- `babel-plugin-react-compiler` for React Compiler support.
- `@base-ui/react` replacing all Radix UI dependencies.
- `@tailwindcss/vite` plugin.
- `wxt.config.ts` replacing the `manifest` block in `package.json`.
- `src/utils/helpers.ts`, `src/utils/url.ts`, `src/utils/cn.ts`,
  `src/utils/export.ts`, `src/utils/clipboard.ts` consolidating ~10
  scattered utility files.
- `src/adapters/xenforo/{index,getDocument,collectPaginatedResults}.ts`
  splitting the monolithic xenforo adapter.
- `docs/` directory; `POLICY.md` and `webstores-info.txt` moved here.
- Custom `Geist` font, new surface/accent/muted theme tokens, global `focus-visible` styling, and reduced-motion handling in `tailwind.css`.
- Profile search-link discovery for XenForo so authored-story URLs can be detected more reliably.
- New popup accessibility and UI polish: tab semantics, alert/status icons, improved input labels, and clearer file-upload copy.
- Refreshed author-scrape sidebar/footer styling and behavior for the new theme.
- Added helper text to the popup URL input form reminding users to log into the forum before scanning to ensure accurate results.
- Version badge in the popup header showing the current extension version.
- Feedback link with separator in the author-scrape and file-upload page
  footers.

### Changed

- **BREAKING**: Framework migrated from Plasmo to WXT. Storage keys,
  entry point paths, and build output structure have changed.
- **BREAKING**: `@plasmohq/storage` replaced by WXT storage (`#imports`).
- **BREAKING**: `chrome.*` APIs replaced by `browser.*` (WXT cross-browser
  shim).
- Entry points restructured from `src/popup.tsx` + `src/tabs/*` to
  `src/entrypoints/{popup,author-scrape,file-upload}/` with
  `index.html` + `main.tsx` per entrypoint.
- React 18.2 → 19.2. TypeScript 5.3 → 5.9.
- Tailwind CSS 3.4 → 4.3. `tailwind.config.js` and `postcss.config.js`
  removed; config now lives in `src/assets/tailwind.css` via `@import`.
- `@radix-ui/react-popover`, `@radix-ui/react-toggle`,
  `@radix-ui/react-toggle-group` replaced by `@base-ui/react`.
  `popover.tsx`, `toggle.tsx`, `toggle-group.tsx` updated accordingly.
- Prettier replaced by `oxfmt`; `@ianvs/prettier-plugin-sort-imports`
  replaced by oxfmt's built-in `sortImports`. `.prettierrc.mjs` removed.
- `tsconfig.json` updated to extend `.wxt/tsconfig.json`.
- `assets/icon.png` moved to `public/icon.png`.
- `src/components/Radar.tsx` and `ExportButton.tsx` moved to
  `src/components/shared/`.
- `src/lib/utils.ts` (cn helper) moved to `src/utils/cn.ts`.
- Popup header: aspect-video gradient hero replaced with a compact flex
  strip containing the Radar icon and title.
- Popup tab switcher: `ToggleGroup`/`ToggleGroupItem` (Radix) replaced with
  a native `tablist` and CSS sliding pill indicator.
- File upload caution `Popover` (Radix) replaced with inline hint text and
  a plain button link.
- `Radar` component now fills its container (`size-full`) instead of
  `min-h-40 w-40`.
- Grid cards for authored stories use `border-purple-200 bg-purple-50/30`.
- `logsEndRef` scroll logic moved into `ScrapeProgress`.
- `viewMode` state moved into `StoryResults`.
- `handleGlobalExport` import moved from the parent entrypoint into
  `AuthorSidebar`.
- XenForo scraping now resolves profile search links through `discoverProfileSearchLinks` instead of a fixed selector.
- Popup and upload controls were restyled for the new dark theme and improved keyboard/focus behavior.
- Author-scrape layout spacing and footer styling were updated to match the refreshed visual system.
- `BuyMeACoffeeIcon` and `GitHubSponsorsIcon` now rely on external sizing/color classes instead of fixed inline styling.
- README now separates current v2 behavior from future work, renames multi-author scanning to batch author scraping, and updates Firefox support notes.
- XenForo scraping logs are now dev-only, scrape errors surface through progress events, and the scraper no longer sends a custom User-Agent header.
- Author scrape error handling now reports a simpler failure message, and the Firefox build targets were updated to newer minimum versions.
- `wxt.config.ts` now sets Gecko/Android minimum versions to 140.0 and 142.0, with Gecko data collection permissions explicitly set to `none`.
- `id="root"` changed to `id="popup-root"` in the popup entrypoint (`index.html` and `main.tsx`).
- `PopupHeader` layout and text sizing now dynamically adapt to device pointer types (`pointer-coarse` vs `pointer-fine`) because I think it looks cool.
- Added a `pointer-coarse:min-w-fit` constraint to the main popup container to prevent content compression on mobile devices.
- Updated the README to explicitly warn users about XenForo scraping failures when logged out and added a detailed technical explanation of why authentication is required.
- Harmonized the file upload layout structure to perfectly match the author scrape tab's responsive `min-h-svh` design.
- Adjusted sidebar mobile breakpoints across all tabs from `min-[450px]` to `min-[600px]` for better tablet/phablet support (are phablets still a thing?).
- Heart icon in the popup footer now gently pulses (`motion-safe:animate-pulse`).

### Removed

- Plasmo (`0.90.5`) and all `@plasmohq/*` packages.
- `@radix-ui/react-popover`, `@radix-ui/react-toggle`,
  `@radix-ui/react-toggle-group`.
- Prettier, `@ianvs/prettier-plugin-sort-imports`, `postcss`,
  `@types/chrome`.
- `tailwind.config.js`, `postcss.config.js`, `src/style.css`.
- `.prettierrc.mjs`.
- `src/adapters/xenforo.ts` (replaced by the split module).
- `src/utils/index.ts` and all individual utility files it re-exported.
- `src/lib/utils.ts`.
- `src/popup.tsx`, `src/popup.html`, `src/tabs/author-scrape.tsx`,
  `src/tabs/file-upload.tsx` (replaced by entrypoints structure).
- Manifest `host_permissions` and gecko settings from `package.json`
  (moved to `wxt.config.ts`).

### Refactored

- `Popup.tsx` split into `PopupHeader`, `PopupFooter`, `UrlInputForm`,
  `FileUploadForm`.
- `author-scrape.tsx` split into `AuthorSidebar`, `ScrapeProgress`,
  `StoryResults`.
- `src/adapters/xenforo.ts` split into `index.ts`, `getDocument.ts`,
  `collectPaginatedResults.ts`.
- `toggleVariants` extracted to `src/components/ui/toggleVariants.ts`.

### Fixed

- Fixed `removePostNumber` logic to robustly handle trailing slashes, `#post-` hashes, and `/unread` endpoints, preventing identical threads from failing to aggregate (especially common when browsing XenForo logged out).

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
