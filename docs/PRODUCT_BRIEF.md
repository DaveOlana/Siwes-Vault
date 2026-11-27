# SIWES Vault — Product Brief & V1 Specification

> **Document Provenance (AEOS INIT):** Supplied by project owner Dave Olana in the `AEOS INIT` session prompt on 2026-11-27 and archived verbatim below as the authoritative V1 requirements source in this repository.
>
> **External Reference Note:** The brief references `docs/SIWES_Portal_Proposal.pdf`. During repository initialization on 2026-11-27, that PDF was not present inside `docs/` of this workspace; an external copy was located read-only at `C:\Users\HP\Downloads\SIWES_Portal_Proposal.pdf` and inspected as baseline context.

---

**Status:** APPROVED (V1 Scope) · Ready for `AEOS INIT`
**Owner:** Dave Olana
**Source Proposal:** `docs/SIWES_Portal_Proposal.pdf` (Baseline reference; V1 intentionally pivots to a student-first architecture)

---

## 1. Product Mission

**SIWES Vault** is a mobile-first web application that lets Nigerian tertiary students seamlessly log their 16-week Student Industrial Work Experience Scheme (SIWES) activities, attach or sketch weekly diagrams, search past entries, and export a **print-ready official logbook PDF** and a **Final SIWES Report starter** in one click.

---

## 2. Approved V1 Scope vs. Explicit Non-Goals

### Approved V1 Goals
- **Student-Only Architecture:** Zero supervisor or school admin layers in V1. Students own and manage their own records directly.
- **Live Cloud Persistence (Day 1):** Always-on database so students can log from their phone and export from a laptop without data loss or 7-day inactivity pauses.
- **Dynamic 16-Week Logbook Engine:**
  - Student sets their exact **Start Date** during onboarding.
  - System auto-generates **16 weeks × 6 working days (Monday–Saturday, skipping Sundays) = 96 dated slots** starting directly from the Start Date.
  - **No "Pre-Commencement" dead days.**
  - Every daily slot displays its exact calendar date.
- **Daily Activity Logging:**
  - **Activity Summary** (required for every day, however small or routine).
  - **Tools / Tech Used** (optional tags for later report aggregation).
  - **Key Takeaway** (optional 1-line learning summary).
  - **Lightweight Audit Metadata:** Automatically records both the `activity_date` and the `logged_at` timestamp.
- **Weekly Drawing / Image Attachment:**
  - Dedicated visual block at the end of every week (Weeks 1–16).
  - Supports **Image Upload** (phone photo/screenshot) and a **Built-in HTML5 Sketchpad** (draw directly and save as PNG).
- **Search & Reference Vault:** Filter and search past entries by keyword, week, or tool tag.
- **Print-Ready Official Logbook PDF:**
  - Clean A4 layout via `@media print` CSS following the Master Document Creation standard (pure black text on white background, crisp margins, legible tables and weekly diagrams, physical sign-off lines for Industry & Institution supervisors).
- **One-Click Final Report Builder:**
  - Automatically compiles **Chapter 2** (Organization Profile from setup), **Chapter 3** (Weekly Activities + Weekly Diagrams), and **Chapter 4** (Deduplicated Tools/Tech Inventory + Key Takeaways) into a clean, exportable draft.

### Explicit V1 Non-Goals (Deferred to V2+)
- Industry-based supervisor accounts, magic-link endorsements, or digital signatures.
- Institution-based supervisor (lecturer) review dashboards.
- School SIWES Unit / Admin placement approval workflows.
- Official ITF / YABATECH portal integration or SCAF/Form 8 submission.

---

## 3. Approved Technical Stack (100% Free-Tier)

| Layer | Approved Choice | Rationale |
|---|---|---|
| **Frontend & API** | Next.js (App Router) + Tailwind CSS | Mobile-first, fast iteration, native Vercel deployment. |
| **Database & ORM** | Neon (PostgreSQL) + Prisma | Relational fit (`User → Placement → Weeks → DailyEntries`); no 7-day inactivity pause. |
| **Authentication** | Email + Password via Auth.js (NextAuth) + `bcryptjs` | 100% free (credentials stored directly in Neon; zero third-party auth vendor limits). |
| **Image Storage** | Cloudinary (Free Tier) | Reliable hosting and optimization for weekly uploaded photos and exported canvas PNGs. |
| **Sketchpad** | Lightweight HTML5 `<canvas>` | Fast, zero-bloat drawing for block diagrams and flowcharts. |
| **PDF / Print Export** | Native `@media print` CSS (A4) | Pixel-perfect print-to-PDF from any browser with zero server memory limits. |

---

## 4. UI & UX Direction

- **Product Name:** SIWES Vault
- **Theme:** Light-first, clean academic workspace (high contrast, zero clutter, consistent with print preview).
- **Core Screens (3 Total):**
  1. **Logbook Dashboard (Home):** Horizontal 16-week progress strip (`W1`–`W16`), Mon–Sat day tabs with **Today** auto-selected, distraction-free daily entry card, and the Weekly Diagram card at the bottom.
  2. **Search & Vault:** Quick keyword/tag search across all 96 days.
  3. **Export Studio:** Two tabs—**Official Logbook PDF** (live print preview + print/save button) and **Final Report Builder** (compiled Chapters 2–4 preview + copy/export).

---

## 5. Proposed Milestone Roadmap (Supplied Baseline for `AEOS INIT` Review)

### Milestone M1 — Foundation, Auth & 16-Week Date Engine (PROPOSED)
- **Goal:** A student can register/log in with Email + Password, complete their SIWES Placement Setup (Name, Matric No., Dept, Company, Supervisor Name, Start Date), and see their auto-generated 16-week (Mon–Sat) dated logbook skeleton persisted in Neon PostgreSQL.
- **Included:** Next.js + Tailwind scaffold, Prisma schema (`User`, `Placement`, `Week`, `DailyEntry`), Auth.js Credentials login/register, Placement Setup form, 16-week Mon–Sat date generator utility (with unit tests for mid-week starts and Sunday skipping).
- **Exclusions:** Daily entry CRUD UI, sketchpad/Cloudinary uploads, search, print PDF, and report builder.
- **Acceptance Criteria:**
  1. New user registers with email + password; password is hashed (`bcryptjs`) and session persists across reload.
  2. Submitting Placement Setup with any Start Date generates exactly 16 weeks and 96 dated Mon–Sat slots (zero Sundays, zero pre-commencement days).
  3. Reloading the dashboard fetches the persisted 16-week skeleton from Neon.
  4. Unit tests pass for the date generator; `npm run build` passes cleanly; local dev server verified.

### Milestone M2 — Daily Logging & Weekly Diagram Studio (PROPOSED)
- Daily entry create/edit/autosave (`activity`, `tools`, `takeaway`, `logged_at`), Cloudinary upload + HTML5 sketchpad save for weekly diagrams, and Search & Vault view.

### Milestone M3 — Print-Ready Logbook PDF & One-Click Report Builder (PROPOSED)
- Export Studio with A4 `@media print` Official Logbook (pure black on white, tables, diagrams, sign-off boxes) and the One-Click Final Report Builder (Chapters 2–4 aggregation + export).
