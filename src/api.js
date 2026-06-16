/**
 * callGemini — the only function in the app that makes network requests.
 *
 * Takes a system prompt and user content, calls Gemini 2.0 Flash,
 * strips any ```json fences the model occasionally wraps responses in,
 * and returns a parsed JS object.
 *
 * Throws on network failure or JSON parse failure — callers must catch.
 */
export async function callGemini(systemPrompt, userContent) {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userContent }],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `API error ${res.status}: ${err?.error?.message || res.statusText}`
    );
  }

  const data = await res.json();

  // Extract text from Gemini's response shape
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
    "";

  // Strip markdown code fences the model occasionally adds
  const clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

  // Throws SyntaxError if model returns non-JSON — caught by handleAnalyze()
  return JSON.parse(clean);
}