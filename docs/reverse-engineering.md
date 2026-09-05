# Reverse Engineering — riki.edu.vn (Riki Nihongo)

> **Target:** https://riki.edu.vn/ — "Hệ thống nhật ngữ Riki"
>
> **Status labels:** `OBSERVED` (seen on the live site), `INFERRED` (deduced from UI/behavior), `IMPLEMENTED` (what we built), `ASSUMED` (no way to verify — logged in the assumption log).

---

## 1. What is the target?

`OBSERVED` — Riki Nihongo is a **Japanese-language (Nhật ngữ) education company** headquartered in Vietnam (11 campuses in Hanoi & HCMC). Its web presence is split across several sub-domains:

| Area | URL | Purpose |
| --- | --- | --- |
| Main marketing site | `riki.edu.vn/` | Landing, courses, blog, testimonials, contact, signup |
| Blog ("góc chia sẻ") | `riki.edu.vn/goc-chia-se/` | WordPress-backed article archive (grammar/vocab/kanji/JLPT tips) |
| Online learning platform | `riki.edu.vn/online/*` | The actual **e-learning app** (courses, classes, flashcards, tests, payments) |
| Mobile app | Riki on App Store | Companion app (out of scope) |

The site is a **Nuxt.js (Vue) SPA** (`OBSERVED` — `<div id="__nuxt">` + `Loading...` placeholder). The blog is WordPress (visible `/wp-content/uploads/...` image paths). The online platform appears to be a separate authenticated SPA.

**Our reconstruction focuses on the `online` e-learning platform + the public course catalog + blog**, which together represent the observable "application".

---

## 2. Page inventory

### Public / marketing routes

| Route | Purpose | Key components | Data | Actions |
| --- | --- | --- | --- | --- |
| `/` | Landing/home | Hero, stats, featured courses, testimonials, blog preview, CTA | Featured courses, stats, posts | Navigate, register CTA |
| `/gioi-thieu-cong-ty` | About | Static content | — | — |
| `/tuyen-dung` | Recruitment | Job list | Jobs | Apply |
| `/khoa-hoc-tieng-nhat-online-n5..n1` | Online course landing (per level) | Course overview, benefits, syllabus, CTA | Course by level | Enroll |
| `/khoa-hoc-tieng-nhat-n5..n2` | Offline course landing | Same as above | Course by level | Enroll |
| `/kaiwa` | Communication course | Course detail | Kaiwa course | Enroll |
| `/hoc-tieng-nhat-online/khoa-hoc-business` | Business Japanese | Course detail | Business course | Enroll |
| `/hoc-tieng-nhat-online/khoa-hoc-tokutei` | Specified-skills (Tokutei) | Course detail | Tokutei course | Enroll |
| `/hoc-tieng-nhat-online` / `offline` | Online/offline hub | List of courses | Courses | Navigate |
| `/cam-nhan-hoc-vien` | Student testimonials | Cards | Testimonials | — |
| `/tinh-diem-jlpt` | **JLPT score calculator** | Form + result | — | Calculate pass/fail |
| `/dang-ky-hoc-tieng-nhat` | Registration | Form | — | Submit lead |
| `/du-hoc` | Study-abroad | Static | — | — |
| `/teacher/anhsensei` | Teacher profile | Profile | Teacher | — |
| `/b2b/*` | Corporate training | Landing | — | — |

### Auth

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/login/register` | Sign up |
| `/login/forgot-password` | Password reset |
| `/login/callback` | SSO callback (`INFERRED` — social login) |

### Online learning platform (`/online/*`)

| Route | Purpose | Data | Actions |
| --- | --- | --- | --- |
| `/online/my-course` | Enrolled courses | Enrollments + courses | Open course, continue |
| `/online/my-class` | Live classes | Classes | Join |
| `/online/flashcard/*` | Flashcards: create, my folders/topics, favorites, recently, my-error, share, search | Folders/topics/cards | CRUD cards, study |
| `/online/practice-test` | Practice exams | Tests + questions | Take, submit, score |
| `/online/ability-test` | Placement test | Questions | Submit → level |
| `/online/homework-history` | Homework | Homework + grades | — |
| `/online/my-note` | Notes | Notes | CRUD |
| `/online/payment-history` | Payments/orders | Orders | View, refund? |
| `/online/rank-coin` | Coin leaderboard | Users + coins | — |
| `/online/coin-conversion` | Convert coins | Vouchers | Redeem |
| `/online/voucher` | Vouchers | Vouchers | Redeem |
| `/online/notifications` | Inbox | Notifications | Mark read |
| `/online/user` | Profile/settings | User | Edit |
| `/online/video-favorite` | Saved videos | Videos | — |
| `/online/game/room` | Gamified quiz | Questions | Play |
| `/online/riki-flix` | Video library | Videos | Watch |

### Blog (`/goc-chia-se/`)

| Route | Purpose |
| --- | --- |
| `/goc-chia-se/` | Article listing (category, date, author) |
| `/goc-chia-se/{slug}` | Article detail with comments |

---

## 3. User flows (major journeys)

1. **Discovery → Enroll**
   Landing → browse courses (`/courses`) → filter by level (N5–N1/Kaiwa/Business) → course detail → "Đăng ký" → login/register → create order → pay (simulated) → enrollment active → appears in "My courses".

2. **Study with flashcards**
   Login → dashboard → flashcards → create folder → add cards (front/back/reading/example) → study (flip) → mark known/unknown → review.

3. **Take a practice test**
   Tests → select test → answer questions (timer) → submit → scored against correct answers → attempt saved to history.

4. **Read blog & comment**
   Blog → article → read → comment (logged in or guest name) → comment persisted.

5. **Admin manage catalog**
   Admin login → admin dashboard → create/edit/deactivate course → publish blog post → view users/orders.

6. **JLPT score calculation**
   `/tinh-diem-jlpt` → enter 3 section scores → business rule determines pass/fail per level.

---

## 4. API behavior (inferred contract)

The live SPA calls an internal API that is not publicly documented. We **inferred** a REST contract consistent with the UI. Key conventions:

- JSON request/response bodies; `application/json`.
- Auth via **Bearer/cookie session token** (we use a signed JWT in an httpOnly cookie).
- Standard HTTP semantics: `201` created, `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `422` business-rule violation.
- List endpoints support `page`, `pageSize`, `sort`, `order`, `search`, and domain filters; return `{ data, meta: { page, pageSize, total, totalPages } }`.

Full API table is in `docs/api.md`.

---

## 5. Inferred data model (ERD)

```
User ──< Enrollment >── Course ──< Lesson
  │            │            │
  │            └── Order (payment) ── Course
  ├──< FlashcardFolder >──< Flashcard
  ├──< TestAttempt >── Test ──< Question
  ├──< Comment >── Post ── PostCategory
  ├──< Notification
  └──< Order (coin/voucher redemption)

PostCategory ──< Post (author = User)
```

Core entities: **User, Category, Course, Lesson, Enrollment, Order, FlashcardFolder, Flashcard, Test, Question, TestAttempt, Post, PostCategory, Comment, Notification, Voucher.**

See `docs/database.md` for full field tables.

---

## 6. Business rules (implemented)

- **Enrollment**: can only enroll in an *active* course; one active enrollment per user+course; enrolling creates a pending `Order`, which flips `Enrollment.status → active` when paid.
- **Order/payment**: `pending → paid` on success, `failed` on rejection, `refunded` (admin). Payment is **simulated** (no real gateway) — `ASSUMED`.
- **Voucher**: optional discount %, checked for validity (active, not expired, min amount); applied at order time.
- **Flashcards**: private vs public folders; only owner edits; public folders viewable (read-only) by others.
- **Practice test**: scoring = sum of correct answers; attempt is immutable once submitted; score stored with answers for review.
- **JLPT calculator**: pass requires **each** section ≥ threshold (varies by level) **and** total ≥ threshold (`OBSERVED` from JLPT rules).
- **Comments**: guests use a name; logged-in users attach account.

---

## 7. Architecture proposal

Follow the system environment: **Next.js (App Router) + TypeScript + Tailwind + PostgreSQL + Drizzle ORM**. The backend is implemented as **Next.js Route Handlers** under `app/api/*` acting as a REST API, with a clean **service/repository** separation in `src/lib` and `src/db`. This is the documented deviation from the default Java/Spring Boot recommendation (see `docs/architecture.md`).

---

## 8. Assumption log

| # | ASSUMPTION | WHY | IMPLEMENTATION |
| --- | --- | --- | --- |
| A1 | REST API shape (paths, params, status codes) | Internal API not reachable | Inferred contract in `docs/api.md` |
| A2 | Auth is session/JWT, not OAuth | `/login/callback` exists but social creds unavailable | Email/password + JWT cookie |
| A3 | Payment is a simulated gateway | No PSP creds | `Order.status` transitions without real charge |
| A4 | Coin economy is gamification | `rank-coin`/`coin-conversion` observed | `users.coins` + voucher redemption |
| A5 | Blog is content (WordPress) | `/wp-content/uploads` observed | Re-implemented as `posts` table |
| A6 | Course pricing/duration specifics | Not fully visible per course | Realistic seed values |
| A7 | Ability test = practice test with level label | No API | Reuse tests with `level` filter |

---

## 9. Technology deviation note

The brief's default backend (Java 21 / Spring Boot / Flyway) was **not** used because the sandbox runtime is a **Next.js + PostgreSQL + Drizzle** fullstack environment. The same architectural goals — modular services, validation, REST API, DB migrations via `drizzle-kit push`, seed data, tests — are all met with the available stack. See `docs/architecture.md` for the rationale.
