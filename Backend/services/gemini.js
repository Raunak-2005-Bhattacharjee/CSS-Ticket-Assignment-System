import fetch from "node-fetch";

/**
 * Analyze a ticket using the Gemini REST API and extract skills + notes.
 * Returns { requiredSkills: string[], notes: string }
 */
export async function getRequiredSkillsFromGemini({ title, description }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // Local naive fallback when API key is not configured
  if (!apiKey) {
    const words = `${title} ${description}`.toLowerCase();
    const skills = ["react", "node", "express", "mongodb", "css", "html", "typescript"];
    const required = skills.filter((s) => words.includes(s));
    return { requiredSkills: required, notes: "Fallback skill extraction (no GEMINI_API_KEY)." };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;

  const prompt = `You are an assistant that extracts technical skills from a ticket.\n\n` +
    `Return ONLY valid JSON with the exact keys: requiredSkills (array of strings) and notes (string).\n` +
    `Title: ${title}\nDescription: ${description}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      // Soft-fallback instead of throwing hard
      const words = `${title} ${description}`.toLowerCase();
      const skills = ["react", "node", "express", "mongodb", "css", "html", "typescript"];
      const required = skills.filter((s) => words.includes(s));
      return { requiredSkills: required, notes: `Fallback (HTTP ${res.status}): ${text.slice(0, 120)}...` };
    }

    const data = await res.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse JSON from the text output
    let jsonText = textOutput.trim();
    // Remove code fences if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```(?:json)?/gi, "").trim();
    }
    // Extract first JSON object if extra text is present
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (match) {
      jsonText = match[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = null;
    }

    if (!parsed || !Array.isArray(parsed.requiredSkills)) {
      // Soft-fallback when the model didn't return strict JSON
      const words = `${title} ${description}`.toLowerCase();
      const skills = ["react", "node", "express", "mongodb", "css", "html", "typescript"];
      const required = skills.filter((s) => words.includes(s));
      return { requiredSkills: required, notes: "Fallback (unparsable model output)." };
    }

    return {
      requiredSkills: parsed.requiredSkills || [],
      notes: parsed.notes || "",
    };
  } catch (error) {
    const words = `${title} ${description}`.toLowerCase();
    const skills = ["react", "node", "express", "mongodb", "css", "html", "typescript"];
    const required = skills.filter((s) => words.includes(s));
    return { requiredSkills: required, notes: `Fallback (exception): ${String(error).slice(0, 120)}...` };
  }
}


