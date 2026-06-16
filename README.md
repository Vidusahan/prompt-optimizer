# Prompt Optimizer

A meta-AI tool that teaches prompt engineering by doing it live. Paste any weak or vague prompt — the app diagnoses what's wrong and generates three improved versions using different engineering strategies.

## Architecture

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│        Input + Example Module   │  ← textarea, example buttons, action bar
└────────────────┬────────────────┘
                 │ user prompt text
                 ▼
┌─────────────────────────────────┐
│       API Layer — callClaude()  │  ← single reusable fetch wrapper
└────────────────┬────────────────┘
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  Analysis    │   │  Improvement │
│  Call        │   │  Call        │  ← sequential, not parallel
│  (Pass 1)    │   │  (Pass 2)    │
└──────┬───────┘   └──────┬───────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ Analysis     │   │ Version      │
│ Panel Module │   │ Card Module  │
└──────────────┘   └──────────────┘
```

The two AI calls are **sequential by design**: the improvement call receives the full analysis JSON as context, so improvements are targeted rather than generic rewrites.

## Running locally

```bash
npm install
cp .env.example .env.local   # then open .env.local and add your Anthropic key
npm run dev
```

Then open `http://localhost:5173` in your browser.

To test the API layer and prompts in isolation before the UI is built, run:

```bash
node src/prompts/test-analysis.js   # validates analysis prompt against 4 bad prompts
node src/prompts/test-improve.js    # validates the full 2-pass pipeline
```

## Deployment note

This app calls the Anthropic API directly from the browser. That is safe inside the Claude.ai artifact runtime, which injects credentials server-side. **Do not deploy to a public host without adding a backend proxy** — doing so would expose your API key in network requests.

## Tech stack

- React + Vite (local dev harness)
- Anthropic Claude API (`claude-sonnet-4-6`)
- Tabler Icons (CDN, no install needed)
- No backend, no database, no build-time secrets in production

## Module overview

| Module | File | Role |
|---|---|---|
| API layer | `src/api.js` | Single fetch wrapper, JSON fence stripping, error throwing |
| Analysis prompt | `src/prompts/analysis.js` | Strict schema prompt for diagnosis pass |
| Improve prompt | `src/prompts/improve.js` | Strict schema prompt for 3-strategy improvement pass |
| ScoreRing | `src/components/ScoreRing.jsx` | SVG animated progress ring, color-coded by score |
| IssueBadge | `src/components/IssueBadge.jsx` | Color-coded, icon-tagged issue display |
| VersionCard | `src/components/VersionCard.jsx` | Full prompt card with copy button + change list |
| Orchestration | `src/App.jsx` | Two-pass pipeline + phase state machine |
| Input module | `src/App.jsx` | Textarea, example prompts, action bar |

## State shape

| Variable | Type | Purpose |
|---|---|---|
| `input` | string | Current textarea value |
| `phase` | `"idle" \| "analyzing" \| "improving" \| "done" \| "error"` | Controls what's visible |
| `analysis` | object \| null | Parsed analysis response |
| `versions` | array \| null | Parsed array of 3 improved versions |
| `copied` | number \| null | Index of the currently-copied version card |
| `error` | string | Error message if an API call fails |

## Milestones

- `v0.1-core-logic-validated` — API layer + both prompts validated against real responses
- `v0.5-ui-complete` — Full UI wired end-to-end, all 4 examples working
- `v1.0` — Edge cases handled, history feature added, visual polish done
