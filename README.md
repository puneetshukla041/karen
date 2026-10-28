# My Prep

Track government job exams you are eligible for, plus the ones you have applied to. Dark theme. Built with Next.js 16 (App Router, TypeScript) and MongoDB.

**Module 1: My Exams**

- Researched notifications in five tabs: open now, upcoming, closed with the exam still pending, and more. Each one shows vacancies, apply window, exam date, age limit, qualification, pay, fee, selection process, difficulty and sources.
- Eligibility is calculated from your profile. Your date of birth is checked against each exam's age limit and its "age as on" date.
- Per-exam application tracker: status, application number, date applied, fee paid, exam centre, notes. Saved in MongoDB.

## Run it

```bash
npm install
npm run db      # terminal 1: local MongoDB on 127.0.0.1:27017, data kept in .mongo-data/
npm run seed    # once, and again after src/data/exams.json changes
npm run dev     # terminal 2: http://localhost:3000
```

To use MongoDB Atlas instead, put your `mongodb+srv://...` URI in `.env.local` as `MONGODB_URI` and skip `npm run db`.

For production: `npm run build && npm start`, or deploy to Vercel with `MONGODB_URI` and `MONGODB_DB` set.

## How it stays fast

- Exam data is read with `"use cache"` (1 hour, tag `exams`) and prerendered into the static shell.
- Only your personal data (applications, profile) is read per request, streamed in behind `<Suspense>` skeletons.
- Search, tabs and filters run in the browser over data already loaded, so they need no network round-trip.

## Updating the research

All notification data lives in `src/data/exams.json`. Edit it, run `npm run seed`, then restart `npm run dev`. Your applications and profile are never touched by a seed.

Dates and vacancy counts come from official sites where those could be reached, otherwise from coaching and news portals. Each exam shows its confidence level and source links. Confirm on the official site before paying any fee.
