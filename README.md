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
│        API Layer — callGroq()   │  ← single reusable fetch wrapper
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
       │                  │
       └────────┬─────────┘
                ▼
       ┌──────────────────┐
       │  History Module   │  ← window.storage / localStorage, max 10 entries
       └──────────────────┘
```

The two AI calls are **sequential by design**: the improvement call receives the full analysis JSON as context, so improvements are targeted rather than generic rewrites. On a successful run, the result is also persisted to history.

## Running locally (Vite dev harness)

```bash
npm install
cp .env.example .env.local   # then open .env.local and add your Groq key
npm run dev
```

Then open `http://localhost:5173` in your browser.

Local dev uses a real network call to Groq with your key injected via Vite env vars (`VITE_GROQ_API_KEY`), loaded client-side from `.env.local`. This file is git-ignored and should never be committed.

To test the API layer and prompts in isolation before touching the UI:

```bash
node src/prompts/test-analysis.js   # validates analysis prompt against 4 bad prompts
node src/prompts/test-improve.js    # validates the full 2-pass pipeline
```

History in local dev falls back to `localStorage` automatically (see **Storage** below), so you can test the history panel without the artifact runtime.

## Running as a Claude.ai artifact

Paste the final `App.jsx` (and its module files, inlined or bundled as required by the artifact format) into a Claude.ai artifact. In that environment:

- `window.storage` is available and used automatically for history — no setup needed.
- No `.env` file or API key management is required for the *artifact's own* Claude calls — but **this project calls the Groq API**, which is a third-party endpoint outside Anthropic's artifact credential injection. See the security note below before relying on this in the artifact runtime.

## ⚠️ Security note — read before deploying anywhere

This app calls the **Groq API directly from the browser**, with the API key embedded in client-side code (`import.meta.env.VITE_GROQ_API_KEY`).

- **Local dev:** safe. The key lives only in your local `.env.local`, never committed, never sent anywhere except directly to Groq from your own machine.
- **Claude.ai artifact runtime:** the credential-injection safety net that applies to direct Anthropic API calls **does not apply to Groq**. If you paste a Groq key into an artifact, that key is visible in the artifact's source and network requests to anyone who can view or run it. Treat this as equivalent to a public deployment — do not put a real production key in an artifact meant to be shared.
- **Public deployment (Vercel, Netlify, GitHub Pages, etc.):** **do not deploy this pattern as-is.** Any client-side bundled API key is extractable from the shipped JS, regardless of build tooling. Before deploying publicly, add a minimal backend proxy (e.g., a serverless function) that holds the Groq key server-side and forwards requests, so the key never reaches the browser.

In short: this direct-from-browser pattern is only safe for local development with a key you control and are willing to rotate.

## Tech stack

- React + Vite (local dev harness)
- **Groq API** (`llama-3.3-70b-versatile`, OpenAI-compatible chat completions endpoint)
- `window.storage` (Claude.ai artifact runtime) with automatic `localStorage` fallback for local dev
- Tabler Icons (CDN, no install needed)
- No backend, no database, no build-time secrets baked into production bundles

## Module overview

| Module | File | Role |
|---|---|---|
| API layer | `src/api.js` | Single fetch wrapper to Groq, JSON fence stripping, network/HTTP/parse error handling |
| Analysis prompt | `src/prompts/analysis.js` | Strict schema prompt for diagnosis pass |
| Improve prompt | `src/prompts/improve.js` | Strict schema prompt for 3-strategy improvement pass |
| ScoreRing | `src/components/ScoreRing.jsx` | SVG animated progress ring, color-coded by score |
| IssueBadge | `src/components/IssueBadge.jsx` | Color-coded, icon-tagged issue display, falls back to vagueness styling for unknown issue types |
| VersionCard | `src/components/VersionCard.jsx` | Full prompt card with copy button + change list |
| HistoryPanel | `src/components/HistoryPanel.jsx` | Collapsible list of past analyses, click to restore instantly (no API call) |
| Storage | `src/storage.js` | `get/set/list/delete` wrapper — uses `window.storage` in the artifact runtime, `localStorage` otherwise |
| Orchestration | `src/App.jsx` | Two-pass pipeline, phase state machine, history persistence |
| Input module | `src/components/InputModule.jsx` | Textarea, example prompts, action bar |

## State shape

| Variable | Type | Purpose |
|---|---|---|
| `input` | string | Current textarea value |
| `phase` | `"idle" \| "analyzing" \| "improving" \| "done" \| "error"` | Controls what's visible |
| `analysis` | object \| null | Parsed analysis response |
| `versions` | array \| null | Parsed array of 3 improved versions |
| `copied` | number \| null | Index of the currently-copied version card |
| `error` | string | Error message if an API call fails |
| `history` | array | Up to 10 most recent saved analyses, newest first |
| `showHistory` | boolean | Whether the history panel is expanded |

## Error handling

`callGroq()` distinguishes four failure modes and surfaces a specific message for each:

1. **Network failure** — fetch itself throws (offline, DNS, etc.)
2. **Non-2xx HTTP response** — Groq returns a rate limit, auth, or server error; the response body's error message is surfaced where available
3. **Empty model output** — the response parses but contains no text
4. **Malformed JSON** — text survives fence-stripping but still fails `JSON.parse`

All four route to the same `error` phase with a red banner and a clean `Reset` recovery path — no uncaught exceptions, no blank screens.

## History feature

Every successful analysis is saved under a `history:{timestamp}` key with the original input, the analysis object, and the three generated versions. Selecting a history entry restores all three from the saved record — no new API call is made. The list is capped at 10 entries; the oldest is evicted once the cap is exceeded. Storage reads (`get`) throw on missing keys by design, so every storage call in this app is wrapped in try/catch and fails silently rather than breaking the UI.

## Milestones

- `v0.1-core-logic-validated` — API layer + both prompts validated against real responses
- `v0.5-ui-complete` — Full UI wired end-to-end, all 4 examples working
- `v1.0` — Edge cases handled, history feature added, visual polish done, migrated from Anthropic API to Groq API