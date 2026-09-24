/**
 * callGroq — routes all requests through the Vercel serverless proxy.
 * The GROQ_API_KEY is held server-side; it never reaches the browser.
 */
export async function callGroq(systemPrompt, userContent) {
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
    res = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
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

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error("Model response wasn't valid JSON. Try again or simplify your prompt.");
  }
}