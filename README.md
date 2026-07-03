# Product Audit MVP — York.ie

A React web app to replace the manual Excel product audit process. 40 questions, 8 categories, auto-scored with PDF export.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# → opens at http://localhost:5173

# 3. Build for production
npm run build
```

## What's in Phase 1

- ✅ All 40 audit questions across 8 categories
- ✅ Auto-scoring engine (normalizes all answer types to 0–100)
- ✅ Auto-generated action items per score level
- ✅ Category navigation with progress tracking
- ✅ Save/resume audit state (localStorage)
- ✅ Summary dashboard with bar chart
- ✅ Critical/warning action item grouping
- ✅ PDF export

## Roadmap

- **Phase 2**: Jira API integration — auto-pull answers for 10+ questions
- **Phase 3**: Audit history, cross-team benchmarking, Slack alerts

## Using with Claude Code

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Navigate to this project
cd product-audit-mvp

# Start Claude Code — it will read CLAUDE.md automatically
claude
```

Claude Code will understand the full project structure, coding conventions,
and Phase 2 roadmap from the CLAUDE.md file.

## Categories

| # | Category | Questions | Auto-pullable (Phase 2) |
|---|----------|-----------|------------------------|
| 1 | PMT Practices | Q1–Q7 | ✅ Jira |
| 2 | Sprint Ceremonies | Q8–Q12 | Partial |
| 3 | Client Engagement | Q13–Q16 | Manual Q&A |
| 4 | Documentation | Q17–Q19 | Confluence |
| 5 | Product Performance | Q20–Q26 | Partial Jira |
| 6 | Team Satisfaction | Q27–Q35 | Manual Q&A |
| 7 | Security & Risk | Q36–Q38 | Manual |
| 8 | Product Operations | Q39–Q40 | Manual |
