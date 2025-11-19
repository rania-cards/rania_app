import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "[RANIA] OPENAI_API_KEY is not set. generateMomentMessage will throw if called."
  );
}

const client = new OpenAI({ apiKey });

type GenerateMomentInput = {
  receiverName: string;
  occasion: string;
  relationship: string;
  vibe: string;
  userNotes?: string;
  extraDetails?: string;
};

export async function generateMomentMessage(input: GenerateMomentInput) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const { receiverName, occasion, relationship, vibe, userNotes, extraDetails } =
    input;

  const systemPrompt = `
You are RANIA, an AI that writes short, emotional "moments" for one specific person.
Tone: warm, playful, emotional, not cringe, not too long.
- 3–7 sentences max.
- 1–3 emojis max.
- Simple, natural English.
`;

  const userPrompt = `
Receiver name: ${receiverName}
Occasion: ${occasion}
Relationship: ${relationship}
Vibe: ${vibe}
What I want to say: ${userNotes || "Not specified"}
Extra details: ${extraDetails || "None"}

Write ONE message I can send as a RANIA moment.
Return ONLY the message text, no explanations.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.85,
    max_tokens: 220,
  });

  const text = response.choices[0]?.message?.content ?? "";
  return text.trim();
}