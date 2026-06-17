/**
 * callGemini — the only function in the app that makes network requests.
 *
 * Takes a system prompt and user content, calls Gemini 2.0 Flash,
 * strips any ```json fences the model occasionally wraps responses in,
 * and returns a parsed JS object.
 *
 * Throws on network failure or JSON parse failure — callers must catch.
 */
export async function callGroq(systemPrompt, userContent) {
  const endpoint = `https://api.groq.com/openai/v1/chat/completions`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }, // forces valid JSON output
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userContent  },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `API error ${res.status}: ${err?.error?.message || res.statusText}`
    );
  }

  const data = await res.json();

  // Extract text from OpenAI-compatible response shape
  const text = data?.choices?.[0]?.message?.content || "";

  // Strip markdown code fences the model occasionally adds
  const clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

  // Throws SyntaxError if model returns non-JSON — caught by handleAnalyze()
  return JSON.parse(clean);
}