# Seed source spreadsheets

Put the source workbooks (`.xlsx`) in this directory. `npm run seed` reads every
workbook here, so adding or editing a sheet changes the seeded data with no code
change.

Current sources:

| File | Entity | Rows |
| --- | --- | --- |
| `MyPath_carrer.xlsx` | careers | 20 |
| `My Path _ major.xlsx` | majors | 20 |
| `MyPath_Scholarship.xlsx` | scholarships | 26 |
| `universities.json` | universities | 12 |

`universities.json` is not a spreadsheet: it was extracted from the frontend's
curated dataset (`frontend/app/data/universities.ts`). Edit the JSON and re-seed.

Re-seeding updates rows in place, matched on title (scholarships, careers) or
name (majors, universities), so ids stay stable and user data is never touched.
Renaming a row therefore counts as removing it and adding a new one. See
[`docs/API.md`](../../../docs/API.md#seeding) for details and `--replace`.

## How a sheet is read

**Finding the header.** Sheets are discovered, not hard-coded. For each sheet the
importer scans the first 12 rows for a header row — one with at least three
filled cells and at least two recognized column names. This is why the majors
workbook works even though its header is on row 3 (row 1 is blank, row 2 says
"Done"), and why intro tabs with no table are skipped harmlessly.

**Choosing the entity.** All three workbooks name their tab `Sheet1`, so the
entity is decided by *which title column the sheet has*, tested in this order:

1. `Scholarship name` / `Program` → **scholarships**
2. `Career` → **careers**
3. `Major` → **majors**

Order matters: the scholarship sheet also has a `Major` column, so it must be
tested first. (`Careers`, plural, is a majors column and does not collide with
the singular `Career`.)

**Matching columns.** Header names are matched case- and
punctuation-insensitively, so emoji prefixes like `🛠️ Key Skills` match
`Key Skills`. Aliases live in [`../sources.ts`](../sources.ts) — to support a new
heading, add it there and nothing else needs to change. Rows with no title are
treated as spacers and skipped.

**List cells** split on semicolons when present, otherwise commas — so an entry
containing a comma can be written using semicolons.

## Field notes

- **Columns the sheets don't provide are `NULL`, not invented.** That means
  `careers.average_salary`, `careers.source`/`source_url`, `majors.duration`,
  `majors.degree_type` and `majors.source`/`source_url`. The seed relaxes the
  `NOT NULL` constraint on those columns rather than storing placeholder text.
- **`amount`** is summarised from the Benefits text only when the summary starts
  at the beginning of that text. Awards put the qualifier first (`5–35% tuition`,
  `Up to $5,000`, `Partial to full tuition`), so a match further in would drop the
  qualifier and *overstate* the award. Anything that doesn't summarise cleanly
  keeps the Benefits text verbatim.
- **`deadline`** is read as Cambodian local time (UTC+7, no DST). Excel stores a
  date cell as a timezone-less wall-clock value and ExcelJS returns it as though
  it were UTC, so `18 Sep 2026, 5:00 PM` arrives as `17:00Z`. The importer
  applies the offset; storing the instant unchanged would put every deadline 7
  hours late. If your sheets ever move to another timezone, change
  `SHEET_UTC_OFFSET_MINUTES` in [`../mapping.ts`](../mapping.ts). When the cell
  is prose instead (`Not announced`), `deadline` is `NULL` and the text is kept
  in **`deadline_note`**.
- **`country`** defaults to `Cambodia` — the scholarship sheet has no country
  column and its listings are Cambodian.
- **`source_type`** is `official` only for structurally government/academic hosts
  (`.edu.kh`, `.ac.uk`, `.go.jp`, `europa.eu`, …). A body's own `.org` site is
  `organisation`; known news and social domains are `news` and `social_media`.
- **`verified_status`** is `verified` when the row passed the offline checks,
  `flagged` when it produced a warning, `unverified` when there is no usable
  link. It does **not** mean a human vetted the listing. The sheet's own
  `Verification status` column wins when filled — it is currently blank in all
  26 rows.
- **`safety_warnings`** are offline checks only (missing link, non-HTTPS,
  throwaway TLD, deeply nested host, news or social-media link). Live
  reachability and Safe Browsing checks stay in the request path — seeding never
  hits the network.

## Commands

```bash
npm run seed:preview          # dry run: print what would be inserted
npm run seed:preview -- --json
npm run seed                  # create/migrate tables and load the DB
```

`SEED_DATA_DIR=/path/to/sheets` overrides this directory. If no readable
workbook is found the seed stops **before** deleting anything.

Excel lock files (`~$*.xlsx`) are ignored.
