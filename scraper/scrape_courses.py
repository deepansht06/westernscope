"""Scrape Western University's academic calendar and upsert courses to Supabase.

Usage:
    .venv/Scripts/python.exe scrape_courses.py --dry-run          # parse + print, no DB write
    .venv/Scripts/python.exe scrape_courses.py --subjects COMPSCI MATH
    .venv/Scripts/python.exe scrape_courses.py                    # full scrape, all subjects

Reads SUPABASE_URL and SUPABASE_SECRET_KEY from ../.env.local (or env vars).
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, urlparse

import requests
from bs4 import BeautifulSoup, Tag
from dotenv import load_dotenv

BASE = "https://www.westerncalendar.uwo.ca"
SUBJECTS_URL = f"{BASE}/Courses.cfm?SelectedCalendar=Live&ArchiveID="
SUBJECT_URL = f"{BASE}/Courses.cfm?Subject={{code}}&SelectedCalendar=Live&ArchiveID="
USER_AGENT = "WesternScope-scraper/0.1 (+github.com/deepansht06/westernscope)"
REQUEST_DELAY_SEC = 1.0  # be polite

# Course code in the heading: digits + optional letter + optional /letter.
# Examples: "1020A/B", "1027A", "9999", "1228Y"
COURSE_NUM_RE = re.compile(r"(\d{3,4}[A-Z]?(?:/[A-Z])?)")


@dataclass
class Course:
    code: str            # canonical, e.g., "COMPSCI 1020A/B"
    title: str
    description: str | None
    prereqs: str | None
    faculty: str | None
    credit_weight: float | None


def fetch(url: str, session: requests.Session) -> str:
    resp = session.get(url, timeout=30)
    resp.raise_for_status()
    return resp.text


def fetch_subject_codes(session: requests.Session) -> list[str]:
    """Pull the list of all subject codes from the master Courses.cfm page."""
    html = fetch(SUBJECTS_URL, session)
    soup = BeautifulSoup(html, "html.parser")
    codes: set[str] = set()
    for a in soup.select("a[href*='Courses.cfm?Subject=']"):
        href = a.get("href", "")
        qs = parse_qs(urlparse(href).query)
        if subj := qs.get("Subject"):
            codes.add(subj[0])
    return sorted(codes)


def _labeled_text(course_body: Tag, label: str) -> str | None:
    """Pull the text after a `<strong>Label:</strong>` block within div.course."""
    for strong in course_body.find_all("strong"):
        if strong.get_text(strip=True).rstrip(":").lower() == label.lower():
            parent = strong.parent
            text = parent.get_text(" ", strip=True)
            prefix = strong.get_text(strip=True)
            if text.startswith(prefix):
                text = text[len(prefix):].lstrip(": ").strip()
            return text or None
    return None


def _parse_credit_weight(course_body: Tag) -> float | None:
    """Course Weight is rendered as `<h5><strong>Course Weight:</strong> 0.50</h5>`."""
    for h5 in course_body.find_all("h5"):
        text = h5.get_text(" ", strip=True)
        if "Course Weight" in text:
            m = re.search(r"(\d+(?:\.\d+)?)", text.split("Course Weight", 1)[1])
            if m:
                return float(m.group(1))
    return None


def _parse_heading(panel: Tag) -> tuple[str, str] | None:
    """Heading h4 text looks like: 'Computer Science 1020A/B FOUNDATIONS OF COMPUTER SCIENCE'.

    Returns (course_number, title) or None if it can't be parsed.
    """
    heading = panel.select_one(".panel-heading h4")
    if not heading:
        return None
    text = heading.get_text(" ", strip=True)
    m = COURSE_NUM_RE.search(text)
    if not m:
        return None
    course_number = m.group(1)
    title = text[m.end():].strip()
    return course_number, title


def parse_courses(html: str, subject_code: str) -> list[Course]:
    """Pull every course out of a single subject page."""
    soup = BeautifulSoup(html, "html.parser")
    courses: list[Course] = []
    seen_codes: set[str] = set()

    for panel in soup.select("div.panel"):
        body = panel.select_one("div.course")
        if not body:
            continue
        parsed = _parse_heading(panel)
        if not parsed:
            continue
        number, title = parsed
        canonical_code = f"{subject_code} {number}"
        if canonical_code in seen_codes:
            continue
        seen_codes.add(canonical_code)

        # Description is the first .col-xs-12 inside the body that has no <strong>.
        description: str | None = None
        for col in body.select("div.col-xs-12"):
            inner = col.find("div")
            if inner and not inner.find("strong"):
                description = inner.get_text(" ", strip=True) or None
                break

        courses.append(Course(
            code=canonical_code,
            title=title,
            description=description,
            prereqs=_labeled_text(body, "Prerequisite(s)"),
            faculty=None,  # not on the calendar page; skip for v1
            credit_weight=_parse_credit_weight(body),
        ))

    return courses


def scrape(subjects: Iterable[str] | None) -> list[Course]:
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    if subjects:
        subject_codes = list(subjects)
    else:
        print("Fetching subject index ...", file=sys.stderr)
        subject_codes = fetch_subject_codes(session)
        print(f"Found {len(subject_codes)} subjects.", file=sys.stderr)

    all_courses: list[Course] = []
    for i, code in enumerate(subject_codes, 1):
        url = SUBJECT_URL.format(code=code)
        try:
            html = fetch(url, session)
        except requests.HTTPError as e:
            print(f"  [{i}/{len(subject_codes)}] {code}: HTTP {e.response.status_code}, skipping",
                  file=sys.stderr)
            continue
        courses = parse_courses(html, code)
        print(f"  [{i}/{len(subject_codes)}] {code}: {len(courses)} courses", file=sys.stderr)
        all_courses.extend(courses)
        time.sleep(REQUEST_DELAY_SEC)

    return all_courses


def upsert_to_supabase(courses: list[Course]) -> None:
    """Batch-upsert courses by `code` via Supabase's PostgREST endpoint.

    Uses raw HTTP instead of supabase-py because that client (as of 2.9.1)
    rejects the new sb_secret_* key format with "Invalid API key".
    """
    url = os.environ["SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_SECRET_KEY"]
    endpoint = f"{url}/rest/v1/courses?on_conflict=code"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    rows = [asdict(c) for c in courses]
    BATCH = 500
    for start in range(0, len(rows), BATCH):
        chunk = rows[start:start + BATCH]
        resp = requests.post(endpoint, headers=headers, json=chunk, timeout=60)
        if not resp.ok:
            raise RuntimeError(f"Upsert failed ({resp.status_code}): {resp.text}")
        print(f"  upserted {start + len(chunk)}/{len(rows)}", file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--subjects", nargs="+", help="Limit to specific subject codes (e.g., COMPSCI MATH)")
    parser.add_argument("--dry-run", action="store_true", help="Parse and print but don't write to Supabase")
    parser.add_argument("--limit", type=int, help="Print only the first N courses in dry-run mode")
    args = parser.parse_args()

    # Load env from project-root .env.local. Map NEXT_PUBLIC_SUPABASE_URL → SUPABASE_URL.
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    load_dotenv(env_path)
    if "SUPABASE_URL" not in os.environ and (v := os.environ.get("NEXT_PUBLIC_SUPABASE_URL")):
        os.environ["SUPABASE_URL"] = v

    courses = scrape(args.subjects)
    print(f"\nScraped {len(courses)} courses total.", file=sys.stderr)

    if args.dry_run:
        for c in courses[:args.limit] if args.limit else courses:
            print(f"  {c.code} | {c.title} | weight={c.credit_weight} | "
                  f"desc={(c.description or '')[:60]!r}")
        return

    if not courses:
        print("No courses to upsert.", file=sys.stderr)
        return

    if "SUPABASE_URL" not in os.environ or "SUPABASE_SECRET_KEY" not in os.environ:
        print("ERROR: SUPABASE_URL and SUPABASE_SECRET_KEY must be set "
              "(via .env.local or environment).", file=sys.stderr)
        sys.exit(1)

    upsert_to_supabase(courses)
    print("Done.", file=sys.stderr)


if __name__ == "__main__":
    main()
