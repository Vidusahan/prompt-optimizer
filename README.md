# Prompt Optimizer

A meta-AI tool that teaches prompt engineering by doing it live. Paste any weak or vague prompt — the app diagnoses what's wrong and generates three improved versions using different engineering strategies.

## Architecture

User Input

│

▼

┌─────────────────────────────────┐

│        Input + Example Module   │

└────────────────┬────────────────┘

│ user prompt text

▼

┌─────────────────────────────────┐

│       API Layer — callClaude()  │

└────────────────┬────────────────┘

┌────────┴────────┐

▼                 ▼

┌──────────────┐   ┌──────────────┐

│  Analysis    │   │  Improvement │

│  Call        │   │  Call        │

│  (Pass 1)    │   │  (Pass 2)    │

└──────┬───────┘   └──────┬───────┘

│                  │

▼                  ▼

┌──────────────┐   ┌──────────────┐

│ Analysis     │   │ Version      │

│ Panel Module │   │ Card Module  │

└──────────────┘   └──────────────┘

The two AI calls are **sequential by design**: the improvement call receives the full analysis JSON so improvements are targeted, not generic.

## Running locally

```bash
npm install
cp .env.example .env.local   # add your Anthropic key
npm run dev
```

## Deployment

This app calls the Anthropic API directly from the browser. This is safe inside the Claude.ai artifact runtime (which injects credentials). **Do not deploy to a public host without adding a backend proxy** — you'd expose your API key.

## Tech stack

- React + Vite (local dev harness)
- Anthropic Claude API (`claude-sonnet-4-6`)
- Tabler Icons (CDN)
- No backend, no database

## Milestones

- `v0.1-core-logic-validated` — API layer + prompts validated
- `v0.5-ui-complete` — Full UI wired end-to-end
- `v1.0` — Edge cases handled, history feature, polished