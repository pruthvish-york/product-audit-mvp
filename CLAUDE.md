# Product Audit MVP — York.ie

## What this project is
A React web app that replaces a manual Excel-based product audit process used by York.ie's R&D product team. Auditors run through 40 structured questions across 8 categories, scores are calculated automatically, and a PDF report is generated.

## Tech Stack
- React 18 + TypeScript (strict mode)
- Vite for bundling
- Tailwind CSS v3 for styling (no arbitrary values — use Tailwind scale only)
- Zustand for state management with localStorage persistence (`york-product-audit` key)
- Recharts for the category bar chart in the summary
- jsPDF + jspdf-autotable for PDF export

## Commands
```bash
npm install        # install dependencies
npm run dev        # start dev server at localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
npm run lint       # ESLint check
```

## Project Structure
```
src/
├── data/questions.ts       # ALL 40 questions — the single source of truth
├── types/audit.ts          # All TypeScript types/interfaces
├── store/useAuditStore.ts  # Zustand store (localStorage persisted)
├── utils/scoring.ts        # Score normalization, category scores, report building
├── utils/export.ts         # PDF export via jsPDF
├── components/
│   ├── LandingScreen.tsx   # Project setup form + session history
│   ├── AuditRunner.tsx     # Main audit container (sidebar + question area)
│   ├── CategoryNav.tsx     # Left sidebar with category navigation
│   ├── QuestionCard.tsx    # Individual question card with notes
│   ├── ScoreSelector.tsx   # Score buttons (scale5/4/3, yesno, multi4)
│   └── SummaryScreen.tsx   # Results dashboard + action items + export
└── App.tsx                 # Root router: landing → audit → summary
```

## Key Design Decisions

### Question Schema (src/data/questions.ts)
Each question has:
- `answerType`: `scale5` (1–5), `scale4` (1–4), `scale3` (1–3), `yesno` (1–2), `multi4` (1–4 mapped to No/Poorly/Partially/Fully)
- `isReverse: true` — for questions where lower answer = better outcome (e.g. Q21 bug frequency: 1=Rarely=Good)
- `automatable: true` — marks questions that will be auto-populated from Jira API in Phase 2
- `dataSource`: `jira | confluence | qa | calendar | ops`

### Score Normalization (src/utils/scoring.ts)
All answers normalized to 0–100 for fair comparison across different answer scales:
```
normalizedScore = ((adjusted - 1) / (max - 1)) * 100
```
Where `adjusted = isReverse ? (max - value + 1) : value`

Score thresholds:
- ≥ 70 → Good (green)
- 40–69 → Acceptable (amber)
- < 40 → Critical (red)

### State Flow
`landing` → `audit` → `summary`
State persists across page refreshes via Zustand persist middleware.
Session has `currentCategory` to track position within the audit.

### Adding Questions
To add or modify questions, edit `src/data/questions.ts` only.
The scoring engine, summary, and export all read from `QUESTIONS` automatically.

### Phase 2 Prep (Jira Integration)
Questions with `automatable: true` and `dataSource: 'jira'` are the Phase 2 targets.
The plan: add a Jira OAuth flow → fetch epic/story/sprint data → pre-populate `session.answers`
before the auditor opens the audit form. The auditor then validates/overrides.

## Coding Standards
- TypeScript strict mode — no `any` types
- All components are functional with explicit prop types via `interface Props`
- No class components
- Tailwind only for styling — no inline style objects except for dynamic values (chart colors, progress bar widths)
- All question data lives in `src/data/questions.ts` — never hardcode question content in components
- State mutations only through Zustand store actions

## Current Phase: Phase 1 — Digital Audit Form
Everything is client-side. No backend. No auth. Data lives in localStorage.

Next phase will add:
- Jira OAuth integration
- API routes for storing audit history server-side
- Multi-user support
