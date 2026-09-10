# MyPath API Reference

Base URL — `http://localhost:5000` (host), `http://backend:5000` (inside Compose).

The machine-readable contract is [`openapi.yaml`](../openapi.yaml); it is kept in
sync with the router by [`src/tests/openapi.test.ts`](../src/tests/openapi.test.ts),
which fails if a route is added without documentation — or documented without
existing.

> This reference describes the API **as it behaves today**, and every statement
> in it is covered by a test in `src/tests/`.

---

## Authentication

Session cookies, not tokens. `POST /auth/register` and `POST /auth/login` return a
`connect.sid` cookie; send it on every subsequent request.

From the browser this means `credentials: "include"` — the API allows credentials
but restricts CORS to the `FRONTEND_URL` origin, so a request without it is
rejected and one from another origin gets no CORS headers.

```js
await fetch("http://localhost:5000/auth/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` when `NODE_ENV=production`.
It expires after 24 hours. `GET /auth/logout` destroys the session; the old cookie
is rejected afterwards.

### Roles

| Role | Who | Can |
|---|---|---|
| `student` | Everyone who registers | Browse, save items, submit and read their own verification requests |
| `admin` | Created by `npm run seed` only | Everything above, plus the verification review queue |

Registration **always** creates a `student` — a `role` in the request body is
ignored — so nobody can grant themselves admin over HTTP. See
[Seeding](#seeding) for the admin account.

🔒 marks endpoints that need a session, 🛡️ those that need an admin.

## Conventions

| | |
|---|---|
| Format | JSON everywhere. Errors are `{ "error": "..." }`. |
| Ids | Integer primary keys. |
| Empty lists | `[]` with `200`, never `404`. |
| Absent values | `null` — meaning *the source spreadsheet did not supply it*, not zero. |
| Arrays | Postgres `TEXT[]` columns serialise as JSON arrays. |
| Auth errors | `401` when there is no session; `403` when signed in but not allowed. Both JSON — never a redirect. |
| Security headers | Set by helmet on every response. `X-Powered-By` is not sent. |
| Errors | Always JSON, never HTML — including `404`s and unexpected `500`s. |

### Rate limits

All send standard `RateLimit-*` headers and answer `429` with a JSON `error`.

| Scope | Limit | Keyed by |
|---|---|---|
| `POST /auth/login`, `POST /auth/register` | 10 / 15 min | IP |
| `POST /verification-requests` | 10 accepted / hour | Account |
| Everything else | 300 / 15 min | IP |

The verification limit counts only accepted submissions — a `400` for an empty
form doesn't use up a slot — because what it protects is the team's Telegram
group, which only accepted submissions reach.

---

## Endpoints

### Pages

#### `GET /`
Counts for the landing page. No auth.

```json
{ "title": "MyPath — Home", "scholarshipCount": 26, "universityCount": 12 }
```

---

### Auth

#### `POST /auth/register`
```json
{ "name": "Sokha Chan", "email": "sokha@example.com", "password": "password123" }
```
`201` → `{ message, user }`, session cookie set.

| Code | Meaning |
|---|---|
| `400` | Missing `name`/`email`/`password`, or email already registered |
| `403` | Already logged in |
| `429` | More than 10 attempts in 15 minutes |

#### `POST /auth/login`
```json
{ "email": "sokha@example.com", "password": "password123" }
```
`200` → `{ message, user }`. `401` on bad credentials — the same message for an
unknown email and a wrong password, so accounts can't be enumerated. `429` after
10 attempts in 15 minutes.

The `user` object is the safe projection: the bcrypt hash is never returned by
this or any other endpoint.

#### `GET /auth/me`
`200` → `{ user }`, or `401` when there is no session. The frontend calls this on
every page load to restore state. `user.role` is what the frontend uses to show
admin links — cosmetic only; the API enforces the role on every admin endpoint.

Not rate limited — the brute-force limiter covers only login and register, so
normal browsing never trips it.

#### `GET /auth/logout`
`200` always, session or not.

#### `GET /auth/google`
Redirects (`302`) to Google's consent screen, or `503` when
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are unset.

#### `GET /auth/google/callback`
Redirects to `FRONTEND_URL` on success, `/auth/signin?error=...` on failure.

---

### Scholarships

#### `GET /scholarships`
Every scholarship, ordered by `deadline` ascending with undated entries last, then
by title. Each item carries an [`infoCheck`](#the-dmil-information-check).

#### `GET /scholarships/{id}`
```json
{ "title": "…", "scholarship": { … }, "infoCheck": { … } }
```
`404` when the id doesn't exist, `400` when it isn't a positive integer.

To save a scholarship, use [`POST /saved/scholarship/{id}`](#saved-items).

---

### Catalog

| Endpoint | Order |
|---|---|
| `GET /careers` | category, then title |
| `GET /majors` | field, then name |
| `GET /universities` | name |

All are public and return arrays — `[]` rather than `404` when empty.

Each also has a detail endpoint returning the single record directly (not
wrapped): `GET /careers/{id}`, `GET /majors/{id}`, and
`GET /universities/{idOrSlug}`. Universities accept either the numeric id or the
slug (`/universities/cadt`), so the frontend's existing URLs keep working. Detail
endpoints answer `400` for a malformed id and `404` when it doesn't exist.

Careers and majors refer to each other — and majors to universities and
scholarships — **by name** (`related_majors: ["Computer Science"]`), because
that's how the spreadsheets are written. The frontend resolves those names to
records.

---

### Compare

#### `GET /compare?type={type}&ids={ids}`
2–4 items of one type, side by side. Public. `type` is `scholarship`,
`university`, `major` or `career`; `ids` is comma-separated (`?ids=3,7,12`).
Items come back in the order given, so the columns stay where the student put
them.

```json
{
  "type": "scholarship",
  "items": [
    { "id": 1, "title": "Techo Digital Talent Scholarship 2026", "subtitle": "AUPP / MPTC", "infoCheck": { … } },
    { "id": 26, "title": "60% Media & Communications Scholarship", "subtitle": "College of Media & Communications, …", "infoCheck": { … } }
  ],
  "rows": [
    {
      "key": "deadline", "label": "Deadline", "group": "Applying", "kind": "deadline",
      "values": [{ "date": "2026-09-18T10:00:00.000Z", "note": null }, { "date": "2026-09-07T…", "note": null }],
      "differs": true,
      "missing": []
    },
    …
  ],
  "notes": [
    { "itemId": 26, "level": "warning", "text": "60% Media & Communications Scholarship closed on 7 Sep 2026." },
    { "itemId": 26, "level": "warning", "text": "60% Media & Communications Scholarship: Link points to a social media post rather than an official application page." }
  ]
}
```

Each row is one field, with a value per item. The table can be drawn without
knowing the type:

| Row field | Meaning |
|---|---|
| `group` | Section heading — e.g. Overview, Award, Applying, Trust for scholarships |
| `kind` | How to render `values`: `text` and `url` → string or `null`; `number`; `list` → string array; `date` → ISO string or `null`; `deadline` → `{ date, note }` |
| `differs` | At least two items say different things (ignoring case, spacing and list order). Highlight these rows. |
| `missing` | Ids of the items that leave this blank. Show "Not stated", not an empty cell — an option that doesn't say is information. An empty `safety_warnings` list isn't counted. |
| `common` | List rows only: values every item shares, e.g. the skills two careers have in common |

`notes` are the prompts to show above the table — warnings first:

| Note | When |
|---|---|
| ⚠️ closed on … | A scholarship's deadline has passed |
| ⚠️ *reason* | A scholarship's Information Check is risky (flagged, social-media source, …) |
| ℹ️ gives its deadline as "…" | The deadline is prose, like "Not announced" |
| ℹ️ doesn't list … | One item leaves out something that matters (deadline, eligibility, documents, tuition, salary, skills, …) |
| ℹ️ Neither of these lists … | None of them do — `itemId` is `null` |

| Code | Meaning |
|---|---|
| `400` | Unknown `type`; fewer than 2 or more than 4 distinct ids; an id that isn't a positive integer |
| `404` | Some ids don't exist — `missing` lists them |

Which items a student has picked is up to the frontend (the "compare tray");
nothing is stored server-side. The typed client is `fetchComparison(type, ids)`
in `frontend/app/lib/api.ts`.

---

### Saved items

A student's saved list, across all four content types. Signed-out visitors keep
theirs in `localStorage`; the frontend merges it into the account on sign-in.

`{type}` is one of `scholarship`, `major`, `career`, `university`.

#### `GET /saved` 🔒
Newest first. Each entry carries enough to render a card without a second request:

```json
[
  {
    "user_id": 7,
    "item_type": "major",
    "item_id": 3,
    "saved_at": "2026-09-10T08:12:00.000Z",
    "title": "Cybersecurity",
    "subtitle": "Technology",
    "image": null
  }
]
```

#### `POST /saved/{type}/{id}` 🔒
`201`. Idempotent — saving twice stores one row and still returns `201`.

| Code | Meaning |
|---|---|
| `400` | Unknown `type`, or `id` is not a positive integer |
| `401` | No session |
| `404` | No such item |

#### `DELETE /saved/{type}/{id}` 🔒
`204`, whether or not the item was saved.

---

### Verification requests — the DMIL loop

A student asks *"is this scholarship real?"* about a link they saw — usually on
Facebook or Telegram, usually **not** in our catalogue. The loop:

1. **Student submits** a link, a name, or a listing we already hold.
2. **An automated check runs instantly** and comes back in the response, so the
   student has something useful straight away.
3. **The review team is alerted** in their Telegram group (when configured —
   see [Telegram alerts](#telegram-alerts)). The request also sits in the admin
   queue at `/admin/requests`.
4. **An admin records a verdict** and a reply.
5. **The student sees the answer** in their inbox on `/verify`, with an unread
   badge until they open it.

Answers go to the in-app inbox rather than back over Telegram because a
Telegram bot can't message someone who hasn't messaged it first.

#### `POST /verification-requests` 🔒
```json
{
  "url": "https://www.facebook.com/share/p/abc/",
  "title": "Guaranteed Scholarship to Japan",
  "note": "They're asking for a $50 processing fee"
}
```
All four fields (`url`, `title`, `note`, `scholarshipId`) are optional, but at
least one of `url`, `title` or `scholarshipId` is required. `scholarshipId` alone
is a complete request — *"is the deadline on this listing still right?"*

`201` →
```json
{
  "request": { "id": 41, "status": "pending", "auto_check": { … }, … },
  "autoCheck": {
    "score": 65,
    "level": "high",
    "findings": [
      "This is a social media post, not an official application page. Anyone can post one.",
      "Mentions a fee to apply — legitimate scholarships do not charge one.",
      "Promises a guaranteed award — no real scholarship can."
    ],
    "passed": ["Uses an encrypted HTTPS connection."],
    "hostname": "www.facebook.com",
    "sourceType": "social_media"
  }
}
```

| `autoCheck` field | Meaning |
|---|---|
| `level` | `high` (score ≥ 50), `caution` (≥ 20) or `low` — what the UI colours by |
| `score` | 0–100, higher is riskier. Each warning sign adds 15–25. |
| `findings` | Warning signs, in plain language. Safe to render directly. |
| `passed` | Checks that came out clean |
| `hostname`, `sourceType` | Same classification the scholarship catalogue uses |

The check is **offline heuristics only** — the link's structure (HTTPS, throwaway
TLDs, shorteners, social hosts, official patterns) and scam phrasing in the title
and note (fees, "guaranteed", pressure tactics). It never fetches the link. A
`low` result means no warning signs, not that a person has confirmed it.

| Code | Meaning |
|---|---|
| `400` | Nothing to check, `scholarshipId` not a positive integer, or `title` > 300 / `note` > 2000 characters |
| `401` | No session |
| `404` | `scholarshipId` doesn't exist |
| `429` | 10 accepted submissions from this account in the last hour |

#### `GET /verification-requests` 🔒
The caller's own requests, newest first, and how many answers they haven't opened:

```json
{ "requests": [ … ], "unread": 1 }
```

#### `GET /verification-requests/{id}` 🔒
One request. Readable by the student who submitted it (`403` for anyone else) or
by any admin. When the owner opens their own **resolved** request, it is marked
read and drops out of the `unread` count.

#### `GET /verification-requests/all` 🛡️
The review queue: pending first, then reviewing, then resolved; oldest first
within each. Each row adds `submitted_by_name`, `submitted_by_email` and
`reviewed_by_name`. Optional `?status=pending|reviewing|resolved` filter (`400`
for anything else).

#### `PATCH /verification-requests/{id}` 🛡️
```json
{ "status": "resolved", "verdict": "scam", "response": "It asks for a fee. Real scholarships never do." }
```

| `status` | Effect |
|---|---|
| `reviewing` | Claims the request so teammates know someone's on it. No verdict needed. |
| `resolved` | **Requires** a `verdict`. Stamps `reviewed_by` and `reviewed_at`, and marks the answer unread so it surfaces in the student's inbox. |
| `pending` | Puts it back in the queue. |

`verdict` is one of `legitimate`, `scam`, `outdated`, `unverifiable`. Every
PATCH sets `verdict` and `admin_response` to exactly what it sends, so omitting
one clears it — send the reply text again when changing only the status. `200` →
the updated request. `400` for an unknown status or verdict, or `resolved`
without a verdict; `404` for an unknown id.

#### The request object

| Field | Meaning |
|---|---|
| `id` | |
| `user_id` | The submitter. `null` if their account was deleted — the request is kept. |
| `scholarship_id` | Set when asking about a listing we hold. `null` if that listing is later removed. |
| `submitted_url`, `submitted_title`, `note` | What the student sent. `submitted_title` falls back to the listing's title, then the URL. |
| `auto_check` | The automated result, as above |
| `status` | `pending` → `reviewing` → `resolved` |
| `verdict`, `admin_response` | The answer. `null` until resolved. |
| `reviewed_by`, `reviewed_at` | Who answered, and when |
| `read_by_user` | Whether the student has opened the answer |
| `created_at` | |

### Telegram alerts

Each accepted submission posts a message to the team's Telegram group: the risk
level (🔴 / 🟠 / 🟢), what was submitted, who sent it, and the top findings.

Configure with two environment variables — see [`.env.example`](../../.env.example)
for how to get them:

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `TELEGRAM_CHAT_ID` | The group's id (negative, e.g. `-1001234567890`) |

Unset, the feature is simply off and the admin queue is the only place requests
appear. The alert is **best-effort**: it never blocks or fails the student's
submission, times out after 5 seconds, and is skipped entirely under
`NODE_ENV=test`.

Under Docker, recreate the backend after editing `.env`
(`docker compose -f docker-compose.dev.yml up -d`) — a restart alone doesn't
reload the environment.

---

## The DMIL Information Check

The platform's core idea is that students should see *where information came from
and how far to trust it*. Every scholarship row carries provenance:

| Field | Meaning |
|---|---|
| `source` | Hostname of the official page (`cadt.edu.kh`) |
| `source_url` | The original source — "View Original Source" in the UI |
| `source_type` | `official` (`.edu.kh`, `.gov`, `.ac.uk`, `europa.eu`), `organisation` (a body's own `.org`), `news`, `social_media`, `unknown` |
| `verified_status` | `verified` \| `flagged` \| `unverified` |
| `last_verified` | When a human last confirmed it |
| `safety_warnings` | Human-readable concerns |

`verified_status` is computed at seed time by **offline** checks only — seeding
never makes network calls. It means "passed the automated checks", *not* "a person
reviewed this". `flagged` means at least one warning fired, e.g.:

```
Link points to a social media post rather than an official application page.
No official link listed in the source sheet — verify before applying.
```

### The `infoCheck` object

Both scholarship endpoints attach an `infoCheck` built from that provenance. It
is what the UI's Information Check panel renders:

```json
{
  "isRisky": true,
  "reasons": ["Link points to a social media post rather than an official application page."],
  "source": "facebook.com",
  "sourceUrl": "https://www.facebook.com/share/p/…",
  "sourceType": "social_media",
  "verifiedStatus": "flagged",
  "lastVerified": null,
  "summary": "This information comes from a social media post rather than an official application page."
}
```

| Field | Use in the UI |
|---|---|
| `isRisky` | Whether to show the warning treatment. True when flagged or any reason fired. |
| `reasons` | The bullet list of concerns. Safe to render directly. |
| `source` / `sourceUrl` | "🌐 Source" and the "View Original Source" link. |
| `sourceType` | The badge next to the source. |
| `verifiedStatus` | The 🟢 / 🔴 status dot. |
| `lastVerified` | "📅 Last verified". |
| `summary` | One line for "Why should I trust this information?". |

The check re-runs the cheap invariants (missing link, non-HTTPS) rather than
trusting the stored warnings alone, so a row inserted by any other path — a
manual `INSERT`, a future admin form — is still assessed.

> `last_verified` is `NULL` for all 26 seeded rows: the `Last verified` column is
> blank in the source spreadsheet. Fill it in and re-seed to light up that line
> of the panel.

---

## Data model notes

**Deadlines carry a real time.** Source spreadsheets are written in Cambodian
local time (UTC+7, no DST). Excel stores a timezone-less wall-clock value and the
reader returns it as if it were UTC, so the importer applies the offset. A 5:00 PM
deadline is stored as `2026-09-18T10:00:00Z` and renders as `18 Sep 2026, 17:00`
in Phnom Penh. Format deadlines in `Asia/Phnom_Penh`, not the viewer's timezone.

When the sheet says something like `Not announced` instead of a date, `deadline`
is `null` and the text is preserved verbatim in `deadline_note`.

**`amount` never overstates an award.** It is summarised from the benefits text
only when the summary starts at the beginning of that text, because awards put the
qualifier first (`5–35% tuition`, `Up to $5,000`, `Partial to full tuition`).
Anything that doesn't summarise cleanly keeps the benefits text verbatim. Use
`coverage` when you need the full description.

**`null` means "not in the source"** — `careers.average_salary`, `majors.duration`
and `majors.degree_type` are always null today because the spreadsheets have no
such column. They were made nullable rather than filled with placeholder text.

---

## Seeding

```bash
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

| Content | Source |
|---|---|
| Scholarships, careers, majors | The `.xlsx` workbooks in [`src/seeds/data/`](../src/seeds/data/) — see the README there for the column mapping |
| Universities | [`src/seeds/data/universities.json`](../src/seeds/data/universities.json), extracted from the frontend's curated dataset |

**Re-seeding is safe.** Content is upserted on its natural key — scholarship
`title`, career `title`, major `name`, university `name` — so an edited row is
updated in place and keeps its id. User accounts, saved items and verification
requests are never touched, and a student's saved scholarship keeps pointing at
the same scholarship. A row removed from a sheet is removed from the database.

Two consequences worth knowing:

- **Renaming a row in a sheet** is treated as deleting the old one and adding a
  new one, so it gets a new id and anyone who had saved it loses that save.
- **`npm run seed -- --replace`** wipes *everything*, accounts included, then
  loads fresh. Use it for a clean slate, never on a database with real users.

The seed also creates two accounts if their emails aren't registered yet:

| Account | Email | Password |
|---|---|---|
| Demo student | `student@test.com` | `password123` |
| Admin | `SEED_ADMIN_EMAIL` (default `admin@domner.edu.kh`) | `SEED_ADMIN_PASSWORD` (default `admin123`) |

The seed never changes an existing account, so setting `SEED_ADMIN_PASSWORD`
after the admin already exists has no effect — change it through the database
instead. **Never deploy with the default admin password.**

Seeding also applies schema migrations. One of them retires the old
`saved_opportunities` table: any rows in it are copied into `saved_items`, then
the table is dropped.

---

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | — (Compose builds it) | Postgres connection |
| `SESSION_SECRET` | In production | `mypath-secret` | Signs the session cookie. **Set it** anywhere but localhost. |
| `FRONTEND_URL` | | `http://localhost:3000` | The only allowed CORS origin; OAuth redirect target |
| `NODE_ENV` | | — | `production` makes the cookie `Secure`; `test` disables rate limits and Telegram |
| `PORT` | | `5000` | |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | | `admin@domner.edu.kh` / `admin123` | The seeded admin |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | | — | Review-team alerts; off when unset |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | | — | Google sign-in; `/auth/google` answers `503` when unset |
| `SAFE_BROWSING_API_KEY` | | — | Not read yet — reserved for live link checks |

Templates: [`.env.example`](../../.env.example) for Docker,
[`backend/.env.example`](../.env.example) for running natively.

---

## Running the tests

Tests use their own `mypath_test` database and refuse to run against anything
whose name doesn't end in `_test`, so development data is never touched.

```bash
docker compose -f docker-compose.dev.yml exec backend npm test
```

They run serially (`--test-concurrency=1`) because they share one database. The
rate limiters skip themselves under `NODE_ENV=test`; the auth and general limiters
are exercised directly in `security.test.ts`, the verification limiter in
`verificationRequests.test.ts`.

The suite covers the auth journey, the catalog, saved items, the DMIL information
check, the verification loop and its permissions, session and rate-limit
behaviour, error shapes, schema migrations, and the OpenAPI contract. The
contract tests walk the Express router, so **adding a route without documenting
it fails the build**.

---

## Changelog

**10 Sep 2026 — security fixes.** Each has a regression test.

| # | Was | Now |
|---|---|---|
| 1 | Password hash returned on login | Safe projection only |
| 2 | Client could register as `admin` | `role` ignored; always `student` |
| 3 | `/auth/me` rate limited, signing users out | Limiter scoped to login/register |
| 4 | DB errors leaked stack traces as HTML | JSON error handler; `404` for unknown ids |
| 5 | Non-numeric id returned `500` | `400` from a shared id parser |
| 6 | Information Check was a stub | Reads the stored provenance |
| 7 | No security headers; `X-Powered-By` exposed | helmet applied in `src/app.ts` |
| 8 | No detail endpoints for the catalog | `GET /{careers,majors,universities}/{id}` |

**10 Sep 2026 — features.** Saved items across all four types (`/saved`),
verification requests with Telegram alerts and an admin queue, non-destructive
re-seeding, a seeded admin account, and universities from real data.

**Retired:** `POST /scholarships/{id}/save` and `GET /dashboard`. They wrote to
and read a scholarship-only `saved_opportunities` table the frontend never used,
so the two save lists had drifted apart. Use `POST /saved/scholarship/{id}` and
`GET /saved`; the user comes from `GET /auth/me`.

## Not built yet

- **Report Outdated Information** — a `reports` table exists with no endpoint.
  Likely to become a verification request with `scholarshipId` instead, since
  `outdated` is already a verdict.
- **Admin content editing** — no write endpoints for scholarships, universities,
  careers or majors. Content changes go through the spreadsheets and a re-seed.
- **Live link checks** — reachability and Google Safe Browsing for submitted links.
- **Persistent sessions** — sessions use express-session's in-memory store, so a
  backend restart signs everyone out. Needs a Postgres session store before
  production.
