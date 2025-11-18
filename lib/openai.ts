import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "[RANIA] OPENAI_API_KEY is not set. generateMomentMessage will throw if called."
  );
}

const client = new OpenAI({
  apiKey,
});

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

  const {
    receiverName,
    occasion,
    relationship,
    vibe,
    userNotes = "",
    extraDetails = "",
  } = input;

  const systemPrompt = `
You are RANIA, an AI that writes short, emotional "moments" for one specific person.
A "moment" is a heartfelt message that can be read aloud or turned into voice/video.
Tone: warm, playful, emotional, never cringe, never too long.

Rules:
- Address the receiver by name or relationship (e.g. "Amina", "Dad", "My love").
- 3–7 sentences max.
- Use simple, natural English (no complicated words).
- You may use 1-3 emojis, but never more than that.
- Avoid generic cliches; make it feel specific to the occasion and relationship.
`;

  const userPrompt = `
Receiver name: ${receiverName || "my person"}
Occasion: ${occasion}
Relationship: ${relationship}
Vibe: ${vibe}
What I want to say in my own words: ${userNotes || "Not specified"}
Extra personal details or memories: ${extraDetails || "None"}

Write ONE single message I can send them as a RANIA moment.
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