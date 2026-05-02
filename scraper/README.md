# WesternScope course scraper

Scrapes course data from Western University's [academic calendar](https://www.westerncalendar.uwo.ca/) and upserts it into the `courses` table in Supabase.

## Setup (one time)

```bash
cd scraper
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
```

The script reads `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SECRET_KEY` from `../.env.local`.

## Usage

```bash
# Test the parser without writing anything
.venv/Scripts/python.exe scrape_courses.py --dry-run --subjects COMPSCI --limit 5

# Scrape one subject and upsert to Supabase
.venv/Scripts/python.exe scrape_courses.py --subjects COMPSCI MATH

# Full scrape (all ~150 subjects, takes 5-8 min with the polite 1s/subject delay)
.venv/Scripts/python.exe scrape_courses.py
```

## How it works

The calendar is server-rendered HTML at predictable URLs:

- `Courses.cfm?SelectedCalendar=Live&ArchiveID=` lists subject codes
- `Courses.cfm?Subject={CODE}&SelectedCalendar=Live&ArchiveID=` lists courses for that subject

Each course is in a `div.panel` whose heading matches `<Subject> <Number><Suffix> <TITLE>` (e.g., "Computer Science 1020A/B FOUNDATIONS OF COMPUTER SCIENCE"). The body has labeled `<strong>` blocks for prerequisites, antirequisites, course weight, and so on.

Upserts go through Supabase's PostgREST endpoint directly (not the supabase-py client) because the supabase-py client (as of 2.9.1) rejects the new `sb_secret_*` key format with "Invalid API key".

Re-runs are safe — `on_conflict=code` makes it idempotent.

## Data access status

**Western's calendar serves a CAPTCHA challenge after ~8 rapid requests** with a note asking scrapers to email Andrew Pocock (apocock2@uwo.ca) at the registrar's office before automated access. We respect that signal — the scraper is committed and works, but we are NOT running it at scale until we have permission. The Supabase `courses` table currently holds only the COMPSCI subject (~73 rows from a small initial run, well below the threshold), which is enough to develop and demo the UI. Once we hear back about acceptable rate / data feed availability, the scraper can be unblocked or replaced with whatever access path Western provides.

## What's NOT scraped (yet)

- **Professors and course offerings.** The academic calendar lists what courses *exist*, but not who teaches them in which term. That data is in Western's Schedule of Classes, which is term-by-term and a separate effort.
- **Faculty per course.** The calendar page doesn't link a course to its faculty (Science, Engineering, etc.); the field is left NULL for now.
- **Antirequisites / extra info.** Parsed in dry-run output but not currently stored — the schema doesn't have columns for them. Add columns to a future migration if you want them surfaced.
