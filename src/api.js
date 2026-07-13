/**
 * callGroq — hybrid endpoint resolver
 *
 * Priority order:
 *   1. BYOK: key stored in localStorage by the user via the Settings UI
 *   2. Local dev: VITE_GROQ_API_KEY from .env.local (injected by Vite at build time)
 *   3. Vercel Proxy: /api/groq serverless function (uses server-side GROQ_API_KEY)
 */
export async function callGroq(systemPrompt, userContent) {
  const localKey = typeof localStorage !== 'undefined'
    ? localStorage.getItem('groq_api_key') || ''
    : '';
  const envKey = import.meta.env?.VITE_GROQ_API_KEY ?? '';

  // Build the request body (same shape for both direct + proxy calls)
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userContent  },
    ],
  });

  let res;
  try {
    if (localKey || envKey) {
      // Direct call — BYOK or local dev
      const key = localKey || envKey;
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body,
      });
    } else {
      // Fallback — Vercel serverless proxy (key lives server-side)
      res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    }
  } catch (networkErr) {
    throw new Error('Network error — check your connection and try again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `API error ${res.status}: ${err?.error?.message || res.statusText}`
    );
  }

  const data = await res.json();

  // Extract text from OpenAI-compatible response shape
  const text = data?.choices?.[0]?.message?.content || '';

  if (!text.trim()) {
    throw new Error('Model returned an empty response. Please try again.');
  }

  // Strip markdown code fences the model occasionally adds
  const clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

  // Throws SyntaxError if model returns non-JSON — caught by handleAnalyze()
  try {
    return JSON.parse(clean);
  } catch {
    throw new Error("Model response wasn't valid JSON. Try again or simplify your prompt.");
  }
}