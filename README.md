# Karen

Your government exam co-pilot. Karen shows which recruitments you can apply for right now, what closes this week, and where each of your applications stands. Built with Next.js 16 and MongoDB.

## What's inside

- **Today**: what to apply for next, sorted by last date, with one-tap "Mark applied". Also shows exams opening soon and your pipeline at a glance.
- **Explore**: every researched notification with search, status tabs (Open / Upcoming / Exam pending / All), sector chips, an eligible-only filter and sorting. Filters live in the URL, so back/forward and shared links work.
- **Exam page**: key facts, a timeline, an eligibility check against your profile, pay and selection steps, sources, and your application record (stage, application no., centre, fee, notes).
- **Tracker**: a board of everything you follow, grouped by stage. Change a stage right from the card.
- **Profile**: date of birth, category and education, used for every age-limit check.
- **Light, dark or system theme**, from the switch in the sidebar or header.

Everything, including the theme, is stored in MongoDB and read on every request. Nothing is kept in browser storage, so your phone and laptop always show the same data.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000, and http://<this-PC's-IP>:3000 from other devices on your Wi-Fi/Tailscale
```

`.env.local` needs:

```
MONGODB_URI=mongodb+srv://...     # MongoDB Atlas (or mongodb://127.0.0.1:27017 with `npm run db`)
MONGODB_DB=my-prep                # database name; kept as-is so existing data stays
```

With Atlas, allow your network's IP under Network Access, or the app shows "Can't reach the database".

On first run with an empty database, Karen loads the bundled research (`src/data/exams.json`) into the `exams` collection. After editing that file, run `npm run seed`. Your applications and profile are never touched by a seed.

For production: `npm run build && npm start`, or deploy to Vercel with `MONGODB_URI` and `MONGODB_DB` set.

## Data accuracy

Dates and vacancy counts come from official sites where those could be reached, otherwise from coaching and news portals. Each exam shows its confidence level and source links. Confirm on the official site before paying any fee.
