# WesternScope

A course review and information site for Western University, inspired by [uwflow.com](https://uwflow.com).

## What it does (v1 goals)

- Browse Western courses by code or name
- View course descriptions and prerequisites
- Sign in with a Western (`@uwo.ca`) email
- Leave a rating and review on courses you've taken
- See a professor's page with the courses they teach

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI components:** shadcn/ui (planned)
- **Database:** Postgres (via Supabase)
- **Auth:** Supabase Auth (Google OAuth, restricted to `@uwo.ca`)
- **Hosting:** Vercel
- **Course data:** Python scraper of Western's academic calendar

## Status

Early development. See [issues](../../issues) and [milestones](../../milestones) for the roadmap.

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
