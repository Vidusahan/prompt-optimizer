# Prompt Optimizer

A meta-AI tool that teaches prompt engineering by doing it live. Paste any weak or vague prompt — the app diagnoses what's wrong and generates three improved versions using different engineering strategies.

**[🚀 Try it live →](https://prompt-optimizer-delta.vercel.app)**

---

## What it does

1. **Diagnose** — gives your prompt a quality score and breaks down exactly what's wrong (vague intent, missing context, no output format, etc.)
2. **Improve** — generates 3 rewritten versions of your prompt, each using a different prompt engineering strategy
3. **Learn** — by seeing your prompt fixed in real time, you naturally absorb what makes a prompt effective

---

## How it works

```
User Input
    │
    ▼
┌──────────────────────┐
│    Analysis Pass 1   │  ← diagnose issues, score 1–10
└──────────┬───────────┘
           │ full analysis JSON
           ▼
┌──────────────────────┐
│  Improvement Pass 2  │  ← 3 targeted rewrites using the analysis as context
└──────────┬───────────┘
           │
           ▼
     Results + History
```

The two AI calls are **sequential by design**: the improvement call receives the full analysis JSON as context, so rewrites are targeted rather than generic. Every successful result is saved to local history (up to 10 entries) so you can revisit past analyses without making a new API call.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| UI icons | Tabler Icons |
| AI model | Llama 3.3 70B via Groq API |
| API proxy | Vercel Serverless Function |
| Hosting | Vercel |

The app calls a Vercel serverless function (`/api/groq`) which proxies requests to Groq. The API key lives server-side only — it is never shipped in the browser bundle.

---

## Error handling

The API layer distinguishes four failure modes, each surfaced with a clear message and a one-click Reset path:

1. **Network failure** — fetch throws (offline, DNS, etc.)
2. **Non-2xx HTTP** — rate limit, auth, or server error from Groq
3. **Empty output** — model returns no content
4. **Malformed JSON** — model output fails to parse