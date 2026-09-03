# Life OS — Personal Life Analytics

A personal dashboard for tracking and understanding daily life: sleep, mood,
energy, habits, productivity and more — turning them into trends, correlations
and insights.

Frontend prototype: runs entirely on mock data persisted to `localStorage`.
No backend yet.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (dark mode only)
- shadcn/ui compatible setup (`components.json` + `cn()` util)
- recharts (charts) · lucide-react (icons) · dayjs (dates)

## Run locally

Requires Node 18+ and [pnpm](https://pnpm.io/installation).

```bash
pnpm install
pnpm dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

```bash
pnpm build       # production build
pnpm preview     # preview the production build
pnpm typecheck   # run TypeScript type checking
```

## What works

- **Dashboard** — life score, stat cards, habits, weekly chart, calendar, overviews, insights.
- **Today** — daily input (mood, energy, sleep, weight, water, habits, note). "Save today" turns a note into a journal entry.
- **Journal** — write entries with mood + tags; list of past entries.
- **Insights** — sleep-vs-productivity scatter, correlations, month comparison.
- **Health / Productivity / Finance / Growth / History / Goals / Settings** — "Coming soon" placeholders.

Habits and journal use shared state (`usePersistentState`), so changes on one
page appear on the others and survive a page reload.

## Structure

```
src/
├── app/          # App shell: layout, page routing, shared state
├── components/    # shared UI (Sidebar, Header, ui/, charts/)
├── features/      # one folder per domain (dashboard, today, journal, habits, insights)
├── hooks/         # usePersistentState (localStorage)
├── lib/           # utils, date helpers, mood constants
├── types/         # shared types
└── styles/        # Tailwind entry + base styles
```

## Adding shadcn/ui components later

The project is pre-configured (`components.json`). To add a component:

```bash
pnpm dlx shadcn@latest add dialog
```

It will be written to `src/components/ui/` and pick up the app's color tokens.

## Next steps (not built yet)

- Node.js backend + PostgreSQL (Neon)
- axios + @tanstack/react-query to replace the localStorage layer
- Real habit CRUD, richer analytics, goals, data export
