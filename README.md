# Prompt Optimizer

A meta-AI tool that teaches prompt engineering by doing it live. Paste any weak or vague prompt — the app diagnoses what's wrong and generates three improved versions using different engineering strategies.

<!-- **[🚀 Live Demo →](https://prompt-optimizer-delta.vercel.app)** -->

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
│        API Layer — callGroq()   │  ← hybrid endpoint resolver (see API Key section)
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

## API Key — How It Works

The app uses a **hybrid key resolution strategy** in this priority order:

| Priority | Source | Who uses it |
|---|---|---|
| 1 | **BYOK** — key you enter via the ⚙️ API Key button in the app | Anyone cloning/forking this repo |
| 2 | **`.env.local`** — `VITE_GROQ_API_KEY` injected by Vite | Local development |
| 3 | **Vercel Proxy** — `/api/groq` serverless function using server-side `GROQ_API_KEY` | Live public deployment |

If you're using the **live demo**, no key is needed — it's handled server-side.

If you're **self-hosting or running locally**, you need your own [Groq API key](https://console.groq.com/keys).

## Running locally (Vite dev harness)

```bash
npm install
cp .env.example .env.local   # then open .env.local and add your Groq key
npm run dev
```

Then open `http://localhost:5173` in your browser.

Local dev uses a real network call to Groq with your key injected via Vite env vars (`VITE_GROQ_API_KEY`), loaded client-side from `.env.local`. This file is git-ignored and should never be committed.

Alternatively, you can skip `.env.local` and enter your key directly in the app via the **⚙️ API Key** button — it will be stored in your browser's `localStorage`.

To test the API layer and prompts in isolation before touching the UI:

```bash
node src/prompts/test-analysis.js   # validates analysis prompt against 4 bad prompts
node src/prompts/test-improve.js    # validates the full 2-pass pipeline
```

History in local dev falls back to `localStorage` automatically (see **Storage** below), so you can test the history panel without the artifact runtime.

## Self-Hosting on Vercel (with your own key)

1. Fork this repository.
2. Import the fork into [Vercel](https://vercel.com).
3. In the Vercel project settings → **Environment Variables**, add:
   - `GROQ_API_KEY` = your Groq API key
4. Deploy. The `/api/groq` serverless function will proxy all Groq calls using your server-side key — it is never exposed to the browser.

## ⚠️ Security note — read before deploying anywhere

This app calls the **Groq API via a serverless proxy** in production, with the API key stored as a Vercel environment variable (server-side only).

- **Local dev:** safe. The key lives only in your local `.env.local`, never committed, never sent anywhere except directly to Groq from your own machine.
- **BYOK (browser localStorage):** your key is stored only in your own browser and is never sent to this project's servers. It is sent directly to Groq from your browser.
- **Public deployment (Vercel):** the proxy pattern keeps the key server-side. The shipped JS bundle contains no secrets.

## Tech stack

- React + Vite (local dev harness)
- **Groq API** (`llama-3.3-70b-versatile`, OpenAI-compatible chat completions endpoint)
- `window.storage` (Claude.ai artifact runtime) with automatic `localStorage` fallback for local dev
- Tabler Icons (CDN, no install needed)
- Vercel Serverless Functions (proxy for public deployment)

## Module overview

| Module | File | Role |
|---|---|---|
| API layer | `src/api.js` | Hybrid endpoint resolver — BYOK, env, or Vercel proxy |
| Serverless proxy | `api/groq.js` | Vercel function, keeps GROQ_API_KEY server-side |
| Analysis prompt | `src/prompts/analysis.js` | Strict schema prompt for diagnosis pass |
| Improve prompt | `src/prompts/improve.js` | Strict schema prompt for 3-strategy improvement pass |
| ScoreRing | `src/components/ScoreRing.jsx` | SVG animated progress ring, color-coded by score |
| IssueBadge | `src/components/IssueBadge.jsx` | Color-coded, icon-tagged issue display, falls back to vagueness styling for unknown issue types |
| VersionCard | `src/components/VersionCard.jsx` | Full prompt card with copy button + change list |
| HistoryPanel | `src/components/HistoryPanel.jsx` | Collapsible list of past analyses, click to restore instantly (no API call) |
| ApiKeyModal | `src/components/ApiKeyModal.jsx` | Settings modal for BYOK — saves key to localStorage |
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
| `showApiKeyModal` | boolean | Whether the BYOK settings modal is open |

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
- `v1.1` — Hybrid API key strategy (BYOK + Vercel proxy), deployed to Vercel, open-source README