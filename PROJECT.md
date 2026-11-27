# PROJECT — SIWES Vault (Intent and Durable Decisions)

**Status:** `BUILD M1` authorized (2026-11-27) · M1 Gate (`OQ-01`–`OQ-06`) **APPROVED**
**Owner:** Dave Olana
**Methodology:** AEOS v0.2 (`AGENTS.md`, `aeos/CORE_POLICY.md`, `aeos/BOOTSTRAP.md`)

---

## Product in one paragraph

**SIWES Vault** is a mobile-first web application that enables Nigerian tertiary students to seamlessly log their 16-week Student Industrial Work Experience Scheme (SIWES) daily activities (Monday–Saturday, skipping Sundays, with zero pre-commencement dead days), attach or sketch weekly diagrams, search past entries, and export both a print-ready A4 Official Logbook PDF and a compiled Final SIWES Report starter (Chapters 2–4) in one click. Unlike the multi-role institutional baseline in `SIWES_Portal_Proposal.pdf`, V1 intentionally pivots to a **student-only, cloud-persisted architecture** with zero supervisor or school admin layers.

---

## Project documents and source-of-truth map

| Concern | Authoritative source | Evidence classification |
|---|---|---|
| Product brief & V1 specification | [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md) | **CONFIRMED** (owner-supplied in `AEOS INIT` prompt, 2026-11-27) |
| Baseline institutional proposal (historical reference) | [docs/SIWES_Portal_Proposal.pdf](docs/SIWES_Portal_Proposal.pdf) (copied from `Downloads` with owner approval, 2026-11-27) | **CONFIRMED** (baseline only; superseded by V1 student-first pivot) |
| Development milestones (`M1`–`M3`) | [docs/MILESTONES.md](docs/MILESTONES.md) | **PROPOSED** (expanded from brief roadmap; awaiting owner review) |
| Engineering rules & verification ladder | [AGENTS.md](AGENTS.md), [aeos/CORE_POLICY.md](aeos/CORE_POLICY.md), [aeos/QUALITY_PROFILES.md](aeos/QUALITY_PROFILES.md) | **CONFIRMED** (AEOS v0.2 checksum-verified against `SHA256SUMS.txt`) |
| Current verified execution state | [STATE.md](STATE.md) | **CONFIRMED** (inspected 2026-11-27) |
| Application source code, schema & tests | Not created yet (`package.json`, `src/`, `prisma/` absent) | **NOT YET CREATED** (awaiting `BUILD M1`) |

---

## Approved goals and explicit non-goals

### Approved V1 Goals (Source: `docs/PRODUCT_BRIEF.md` §2)
- **Student-Only Architecture:** Zero supervisor or school admin layers in V1; students own and manage their records directly.
- **Live Cloud Persistence (Day 1):** Always-on database (log on phone, export on laptop without 7-day inactivity pauses).
- **Dynamic 16-Week Logbook Engine:** Exact Start Date during onboarding auto-generates **16 weeks × 6 working days (Mon–Sat, skipping Sundays) = 96 dated slots**, with zero pre-commencement dead days and exact calendar date on each slot.
- **Daily Activity Logging:** Required Activity Summary, optional Tools/Tech Used tags, optional 1-line Key Takeaway, plus automatic `activity_date` and `logged_at` audit metadata.
- **Weekly Drawing / Image Attachment (Weeks 1–16):** Dedicated visual block per week supporting Image Upload (phone photo/screenshot) and a built-in HTML5 `<canvas>` Sketchpad (saved as PNG).
- **Search & Reference Vault:** Filter/search past entries by keyword, week, or tool tag.
- **Print-Ready Official Logbook PDF:** Clean A4 `@media print` CSS layout (pure black text on white background, crisp margins, legible tables/diagrams, physical sign-off lines for Industry & Institution supervisors).
- **One-Click Final Report Builder:** Compiles Chapter 2 (Organization Profile from setup), Chapter 3 (Weekly Activities + Weekly Diagrams), and Chapter 4 (Deduplicated Tools/Tech Inventory + Key Takeaways).
- **3 Core Screens (Light-first academic UI):** (1) Logbook Dashboard (16-week progress strip `W1`–`W16`, Mon–Sat tabs with Today auto-selected, daily entry card, weekly diagram card), (2) Search & Vault, (3) Export Studio (Official Logbook PDF tab + Final Report Builder tab).

### Explicit V1 Non-Goals (Deferred to V2+)
- Industry-based supervisor accounts, magic-link endorsements, or digital signatures.
- Institution-based supervisor (lecturer) review dashboards.
- School SIWES Unit / Admin placement approval workflows.
- Official ITF / YABATECH portal integration or SCAF / Form 8 submission.

---

## Architecture overview and environments

- **Approved Technical Stack (100% Free-Tier, Source: `docs/PRODUCT_BRIEF.md` §3):**
  - **Frontend & API:** Next.js (App Router) + Tailwind CSS (target deployment: Vercel).
  - **Database & ORM:** Neon (PostgreSQL) + Prisma (`User → Placement → Weeks → DailyEntries`).
  - **Authentication:** Email + Password via Auth.js (NextAuth) + `bcryptjs` (credentials stored in Neon; no external auth vendor limits).
  - **Image Storage:** Cloudinary (Free Tier) for uploaded weekly photos and exported sketchpad PNGs.
  - **Sketchpad:** Lightweight HTML5 `<canvas>`.
  - **PDF / Print Export:** Native `@media print` CSS (A4).
- **Verified Local Environment (2026-11-27):**
  - Workspace path: `C:\Users\HP\Documents\SIWES Vault`
  - Local runtime tools verified: `node v24.16.0`, `npm 11.13.0`, `git 2.54.0.windows.1`.
  - Repository state: **No `.git` directory initialized**; no `package.json`, no `prisma/`, no `src/`, no `.env`.
- **Dev / Test / Production Isolation & Prerequisites:**
  - Dedicated Neon **dev** database/branch (`DATABASE_URL`) and `AUTH_SECRET` must be provisioned locally in `.env` (gitignored) before M1 runtime/migration verification.
  - Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are not needed until M2, and must remain strictly server-side for signed uploads.
  - Never test migrations or synthetic users against a production database.

---

## Decisions and open questions

### Approved Decisions (from `docs/PRODUCT_BRIEF.md` & M1 Gate Review 2026-11-27)
- **AD-01 (Scope Pivot):** V1 is student-only; multi-role supervisor/admin workflows from `SIWES_Portal_Proposal.pdf` are explicitly deferred to V2+.
- **AD-02 (Stack):** Next.js App Router + Tailwind CSS, Neon PostgreSQL + Prisma, Auth.js Credentials + `bcryptjs`, Cloudinary free tier, HTML5 `<canvas>`, and `@media print` A4 CSS.
- **AD-03 (Calendar Scope & Rolling Blocks — `OQ-01` APPROVED):** 16 weeks × 6 working days (Mon–Sat, skipping Sundays) = 96 dated slots starting directly from the student's Start Date, using **rolling 6-working-day blocks** (`W1` = working days 1–6, ..., `W16` = working days 91–96) with zero pre-commencement days.
- **AD-04 (UI Direction):** Light-first high-contrast academic workspace across 3 core screens, following modern crystalline & sleek design practices.
- **AD-05 (Sunday Start Date — `OQ-02` APPROVED):** Disallow Sundays in the Start Date picker and server validation with a clear validation message (SIWES working days are Mon–Sat).
- **AD-06 (Placement Schema & Date Storage — `OQ-03` APPROVED):** Include `companyAddress`, `companySector`, `assignedUnit`, `institutionSupervisorName`, and `levelOrProgramme` as optional fields in the M1 Prisma schema; enforce calendar-date-only storage (`@db.Date` / `YYYY-MM-DD`) to prevent `WAT`/`UTC` timezone drift.
- **AD-07 (Start Date Mutability & Cardinality — `OQ-04` APPROVED):** `User 1:N Placement` in DB for future-proofing, `1:1` active placement in V1 UI. Lock Start Date once the first daily entry is logged (editable only while 0 entries exist).
- **AD-08 (Auth.js Session & Recovery — `OQ-05` APPROVED):** Auth.js Credentials provider with `strategy: "jwt"` and `bcryptjs`; self-service forgot-password email flows deferred to V2.
- **AD-09 (Repo & Env — `OQ-06` APPROVED):** `git init` authorized (no automatic commits); `SIWES_Portal_Proposal.pdf` copied into `docs/`; Neon dev `DATABASE_URL` and `AUTH_SECRET` to be provided by owner in local `.env` before DB runtime verification.

### Open Decisions & Prerequisites (Remaining for M2 / M3)
- **OQ-07 — "Today" auto-selection & backfill/future-logging rules (M2):**
  - *`PROPOSED`:* Default timezone assumption `Africa/Lagos` (`WAT`, `UTC+1`) or user browser local calendar date; if Today is a Sunday, select the most recent Saturday slot; if Today < Start Date, select `W1 Day 1`; if Today > Week 16 end, select `W16 Day 6`. Allow backfilling any past slot anytime (recording both `activity_date` and `logged_at`). Confirm whether future dates can be logged ahead or locked until their calendar date.
- **OQ-08 — Weekly Diagram replacement & Cloudinary asset limits (M2):**
  - *`PROPOSED`:* Client-side image compression/resize (e.g., max 2 MB / 1600px) + server-signed upload endpoint; store `diagramPublicId` alongside `diagramUrl` so replacing/deleting a diagram cleans up the old Cloudinary asset and preserves free-tier quota.
- **OQ-09 — Official Logbook layout & Report Builder export format (M3):**
  - Confirm whether the `@media print` A4 logbook should follow standard YABATECH/ITF weekly sheet conventions (e.g., 1 week per page or 2 weeks per page, weekly Industry Supervisor comment/stamp box + Institution Supervisor sign-off).
  - Confirm Final Report Builder export format(s): Copyable rich text / Markdown / Print-to-PDF / `.docx` download?

---

## Release and acceptance definition

Per `aeos/QUALITY_PROFILES.md`, every milestone requires:
- **Web/front-end profile:** Mobile-first (`~375px`) and desktop (`~1280px`) rendered inspection, keyboard/focus accessibility, loading/empty/error states, zero console/hydration errors, and (for M3) actual Chrome/Edge A4 print preview verification.
- **Backend/API/database profile:** Server-side input validation, strict session ownership checks (`userId === session.user.id`), atomic transactions for 16-week/96-slot creation, clean error handling, and real Neon dev DB verification (mocked unit tests never replace DB runtime proof).
- **Evidence ledger:** Every acceptance criterion backed by exact commands/observations, environment, and `PASS / FAIL / BLOCKED / NOT RUN` status in `STATE.md` and `docs/MILESTONES.md`.

---

## Change protocol

If implementation reveals an approved requirement cannot safely be met, flag a decision using `aeos/templates/DECISION.md` (or update `PROJECT.md` after owner approval). Never silently rewrite scope, architecture, safety rules, or approved product outcomes.
