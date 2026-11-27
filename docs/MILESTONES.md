# SIWES Vault — Initial Development Milestones

> Structured from `aeos/templates/MILESTONE.md` and `docs/PRODUCT_BRIEF.md` during `AEOS INIT`.
> **Status:** All milestones below are **PROPOSED** until human review and explicit `BUILD <ID>` authorization.

---

## Milestone M1 — Foundation, Auth & 16-Week Date Engine

- **Status:** IN PROGRESS
- **Human approval of project gate:** APPROVED (Dave Olana, 2026-11-27 — `OQ-01`–`OQ-06`)
- **Human BUILD authorization:** `BUILD M1` (Dave Olana, 2026-11-27)
- **Goal (observable outcome):** A student can register and log in with Email + Password, complete their SIWES Placement Setup (including Start Date), and view their auto-generated 16-week (96 working-day, Mon–Sat, Sunday-skipping) dated logbook skeleton persisted in Neon PostgreSQL.
- **Source requirement / decision links:**
  - `docs/PRODUCT_BRIEF.md` §2 (Student-Only Architecture, Live Cloud Persistence, Dynamic 16-Week Logbook Engine)
  - `docs/PRODUCT_BRIEF.md` §3 (Approved Technical Stack)
  - `docs/PRODUCT_BRIEF.md` §5 (Proposed Milestone M1)
  - `PROJECT.md` (Open Decisions `OQ-01`–`OQ-06` and Environment Prerequisites)
- **Included tasks:**
  1. Initialize Next.js (App Router, TypeScript) + Tailwind CSS project scaffold configured with light-first academic styling tokens.
  2. Configure Prisma schema (`User`, `Placement`, `Week`, `DailyEntry`) and initial migration against Neon PostgreSQL (using calendar-date safe storage for `startDate` / `activityDate`).
  3. Implement Email + Password registration and sign-in via Auth.js Credentials provider + `bcryptjs` hashing, with route protection for authenticated pages/APIs.
  4. Build pure TypeScript 16-week Mon–Sat date generator utility (handling Monday starts, mid-week starts, Sunday skipping, month/year rollovers, and leap-year boundaries) with comprehensive unit tests.
  5. Implement Placement Setup onboarding form and server action/API route inside a database transaction that saves the placement and generates 16 `Week` rows + 96 `DailyEntry` slots.
  6. Implement minimal authenticated Dashboard skeleton displaying the 16-week strip (`W1`–`W16`), Mon–Sat day slots with exact calendar dates, and persisted placement summary.
- **Explicit exclusions:**
  - Daily entry create/edit/autosave form (`M2`)
  - HTML5 `<canvas>` sketchpad and Cloudinary image uploads (`M2`)
  - Search & Vault filtering view (`M2`)
  - Export Studio, `@media print` A4 Official Logbook PDF, and Final Report Builder (`M3`)
  - Supervisor/admin accounts, magic links, SCAF/Form 8 workflows (V2+ non-goals)
  - Password-reset email service (unless separately added after reviewing `OQ-05`)
- **Affected areas / environments:**
  - New Next.js codebase (`package.json`, `src/`, `prisma/`, test configuration)
  - Local Node.js (`v24.16.0`) / npm (`11.13.0`) environment
  - Neon PostgreSQL development database/branch (external cloud dependency; requires `.env` supplied locally before DB migration/runtime verification)
- **Architecture, data & security risks:**
  - **Mid-week grouping ambiguity (`OQ-01`):** A mid-week Start Date cannot produce both 16 calendar Mon–Sat weeks and 96 slots without either rolling 6-working-day blocks or a 17th partial week. Must confirm rolling 6-working-day block behavior before coding.
  - **Timezone off-by-one shift (`WAT = UTC+1` vs UTC):** Storing calendar dates as timezone-naive JS `Date` timestamps risks shifting dates by 1 day on UTC servers. Mitigate with date-only (`YYYY-MM-DD` / `@db.Date` / UTC-noon or pure ISO date string) arithmetic.
  - **Placement fields gap (`OQ-03`):** Brief lists one `Supervisor Name` in M1 setup, while M3 requires both Industry and Institution supervisor sign-offs and Chapter 2 organization profile. Resolve schema fields upfront so M1 migration supports M3 cleanly.
  - **Credentials auth & ownership isolation:** Never expose `passwordHash` in queries/responses; enforce server-side session checks (`userId === session.user.id`) on all placement/logbook queries; protect against weak password inputs and duplicate email enumeration leaks where appropriate.
  - **Database transaction atomicity:** Placement + 16 weeks + 96 daily slots must be created atomically inside `prisma.$transaction(...)` so partial setups cannot occur.
- **Proposed implementation sequence:**
  1. Resolve M1 gate questions (`OQ-01`–`OQ-06`) and confirm local Neon dev `.env` availability.
  2. Scaffold Next.js + Tailwind + test runner (e.g., Vitest) + `.gitignore`.
  3. Define Prisma schema & run initial migration; verify schema constraints and unique indexes (`(placementId, weekNumber)`, `(placementId, slotIndex)` or `(placementId, activityDate)`).
  4. Implement & unit-test the 16-week date engine first (TDD / standalone pure functions).
  5. Implement Auth.js + `bcryptjs` registration/login + protected session helpers.
  6. Implement Placement Setup flow + atomic 16-week/96-slot persistence + Dashboard skeleton UI.
  7. Run full verification ladder (L1–L4) and inspect rendered UI on mobile + desktop viewports.
- **Acceptance criteria (numbered, testable):**
  1. **Registration & persistent auth:** A new user can register with email and password; the password is stored as a `bcryptjs` hash in Neon (never plaintext), invalid/duplicate registration returns structured validation errors, and login persists an authenticated session across browser reloads.
  2. **Protected routes:** Unauthenticated requests to dashboard or placement APIs are rejected or redirected to sign-in; an authenticated user cannot read or overwrite another user's placement or logbook slots.
  3. **16-week / 96-slot generation:** Submitting Placement Setup with any valid Start Date (Monday, mid-week e.g. Wednesday/Saturday, month-end, year-end, leap-year Feb) atomically persists exactly **16 `Week` records** and **96 `DailyEntry` slots**, with **0 Sundays**, **0 pre-commencement days**, and exact calendar dates in sequential order.
  4. **Persistence across reload:** Reloading the Dashboard fetches the user's persisted placement and 16-week / 96-slot skeleton from Neon PostgreSQL and renders `W1`–`W16` and day slots on both mobile (`~375px`) and desktop (`~1280px`) viewports without console/hydration errors.
  5. **Automated & build checks:** Unit tests pass for the 16-week date generator (including Monday start, mid-week start, Sunday skipping, and configured Sunday start-date rule); type-check, lint, and `npm run build` pass cleanly; local dev server runtime verified against real Neon dev DB.
- **Verification plan (mapped to `aeos/QUALITY_PROFILES.md`):**
  - **L1 Static:** TypeScript type-check (`tsc --noEmit`), ESLint/lint, `npm run build`, secret/env hygiene check (`.env` ignored, no hardcoded secrets).
  - **L2 Behavioral:** Unit tests for date generator (Monday start, Tue–Sat mid-week starts, Sunday input handling, month/year/leap-year rollovers, invariant check: `weeks === 16`, `slots === 96`, `sundays === 0`); negative auth/validation tests (wrong password, duplicate email, malformed Start Date, unauthorized cross-user access).
  - **L3 Runtime:** Real browser + local dev server against Neon dev DB: register -> login -> reload -> submit Placement Setup -> inspect persisted DB row counts (`1 Placement`, `16 Weeks`, `96 DailyEntries`) -> reload dashboard -> logout/login check.
  - **L4 Experience:** Browser verification at mobile (`375×812`) and desktop (`1280×800`) sizes, checking console/network for errors, empty/loading/error states, and keyboard focus navigation.
- **Rollback / recovery where applicable:**
  - Pre-production greenfield milestone; rollback is reverting uncommitted workspace files or dropping/resetting the dedicated **dev** Neon database branch. Never target a shared/production database.

---

## Milestone M2 — Daily Logging, Weekly Diagram Studio & Search Vault

- **Status:** PROPOSED (depends on M1 completion & review)
- **Human BUILD authorization:** NONE
- **Goal (observable outcome):** Students can write, edit, and autosave daily activity summaries, optional tools/tech tags, and 1-line key takeaways across all 96 slots (with `logged_at` audit timestamps and "Today" auto-selected), attach or sketch weekly diagrams saved to Cloudinary, and filter/search past entries in Search & Vault.
- **Included tasks:**
  - Daily Entry editor card (`activitySummary` required, `toolsUsed` tags, `keyTakeaway`, automatic `loggedAt` timestamp, explicit save + debounced autosave states).
  - Dashboard UX for `W1`–`W16` progress strip, Mon–Sat tabs, and smart "Today" slot auto-selection (including Sunday / pre-start / post-end fallback rules per `OQ-07`).
  - Weekly Diagram block (`W1`–`W16`): signed Cloudinary upload for phone photos/screenshots (with client compression/size validation) + lightweight HTML5 `<canvas>` sketchpad exporting PNG to Cloudinary.
  - Search & Vault view: filter/search across all 96 slots by keyword, week (`W1`–`W16`), and tool tag.
- **Explicit exclusions:** Print-ready A4 PDF styling and Final Report Builder compilation (`M3`).
- **Key risks to resolve before M2 BUILD:**
  - Cloudinary upload security (server-signed uploads scoped by user/week; cleanup of orphaned assets on replace) and free-tier bandwidth/size limits.
  - Sketchpad touch/pointer input accuracy on mobile viewports (`touch-action: none`, undo/clear, DPI scaling).
  - Autosave race conditions / offline mobile network drops (clear unsaved/saving/saved/error status indicator).
- **Preliminary acceptance criteria:**
  1. Saving/autosaving a daily entry persists `activitySummary`, `toolsUsed`, `keyTakeaway`, and `loggedAt` without altering `activityDate`.
  2. Dashboard opens to the matching slot when Today is a working day, and handles Sunday/out-of-range dates cleanly.
  3. Uploading an image or saving a `<canvas>` sketch persists a Cloudinary URL on that `Week` and renders across reloads and devices.
  4. Search & Vault accurately filters entries by keyword, week, and tool tag with zero cross-user leakage.

---

## Milestone M3 — Print-Ready Official Logbook PDF & One-Click Report Builder

- **Status:** PROPOSED (depends on M2 completion & review)
- **Human BUILD authorization:** NONE
- **Goal (observable outcome):** Students can preview and print/save an A4 Official Logbook PDF via `@media print` CSS and generate/copy/export a compiled Final SIWES Report starter (Chapters 2, 3, and 4) from their logged data.
- **Included tasks:**
  - Export Studio shell with two tabs: **Official Logbook PDF** and **Final Report Builder**.
  - A4 `@media print` CSS print stylesheet following pure black-on-white typography, crisp margins, structured weekly tables, embedded weekly diagrams, and physical sign-off lines for Industry & Institution supervisors.
  - One-click Final Report Builder aggregating Chapter 2 (Organization Profile from Placement Setup), Chapter 3 (Weekly Activities + Weekly Diagrams), and Chapter 4 (Deduplicated Tools/Tech Inventory + Key Takeaways) with clean preview and copy/download export (e.g., Markdown/DOCX/HTML-print—format to confirm in `OQ-09`).
- **Explicit exclusions:** Official ITF/YABATECH portal API submission, SCAF/Form 8 workflows, digital supervisor signatures (V2+).
- **Key risks to resolve before M3 BUILD:**
  - Cross-browser `@media print` page-break behavior (`break-inside: avoid` on weekly blocks/diagrams/sign-off boxes, table header repeat, image scaling).
  - Official YABATECH/ITF logbook layout expectations (columns, weekly summary, sign-off placement—see `OQ-04`).
- **Preliminary acceptance criteria:**
  1. Print preview renders pure black text on white background on A4 pages with zero clipped tables, overlapping text, or split sign-off blocks across Chrome/Edge print-to-PDF.
  2. Chapter 2 reflects Placement Setup data; Chapter 3 includes every logged week and attached diagram in chronological order; Chapter 4 deduplicates tool/tech tags (case-insensitively) and lists key takeaways accurately.
  3. Empty/partially logged weeks degrade gracefully without crashes or broken headings.
