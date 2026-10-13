# Autonomous Research Agent

A premium, dark-mode AI research platform UI — dashboard, research workspace with an animated agent pipeline, papers library, research chat, knowledge graph, citation manager, reports center, analytics, and settings.

Built with **React 18 + Vite + Tailwind CSS + Framer Motion + Recharts + React Router + Lucide Icons**.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    layout/        Sidebar, mobile drawer, topbar, dashboard shell
    ui/             Reusable primitives: Card, Button, Badge, StatCard, AnimatedCounter
    dashboard/      Dashboard-only widgets (activity chart, agent health, projects table)
    workspace/      Research input, agent workflow visualization, loading stages
  pages/            One file per route (Dashboard, ResearchWorkspace, ResearchResults,
                    ResearchChat, PapersLibrary, KnowledgeGraph, CitationManager,
                    Reports, Analytics, Settings, NotFound)
  data/
    mockData.js     All sample/demo data in one place — swap for real API calls here
  index.css         Design tokens, glass-panel + skeleton utility classes
```

## Wiring up real data

Every page currently reads from `src/data/mockData.js`. To connect a real backend:

1. Replace the static arrays in `mockData.js` with `fetch`/`axios` calls (e.g. inside a `useEffect` + `useState`, or React Query if you add it).
2. The **Research Workspace** page (`src/pages/ResearchWorkspace.jsx`) simulates the 9-step agent pipeline with a `setInterval`. Swap `startRun` for a call to your orchestration API, and drive `activeIndex` from real step-completion events (SSE/WebSocket recommended for live progress).
3. **Settings → LLM Provider** is laid out for Ollama (local), OpenAI, and Anthropic — point the form's `onSubmit` at wherever you persist provider config (e.g. your backend's `/config` endpoint).

## Notes

- Routing uses `HashRouter` so the build can be opened from a static file server without extra server config; switch to `BrowserRouter` if you're deploying behind a proper web server.
- Charts (Recharts) and motion (Framer Motion) are already theme-matched to the token system in `tailwind.config.js` — adjust the `primary` / `secondary` / `accent` colors there to re-theme the whole app.
- Reduced-motion preference is respected globally via `index.css`.
