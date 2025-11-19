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
You are RANIA — an assistant that crafts short, heartfelt messages for a specific recipient.
Your writing style should be warm, sincere, and natural. Avoid clichés, exaggerated emotion, or unnecessary complexity.
Guidelines:
- Length: 3–7 sentences.
- Tone: genuine, uplifting, and human.
- Emojis: optional, but no more than 2.
- Language: simple, clear, and emotionally grounded.
- Format: return only the final message, without any meta-comments or explanations.

`;

  const userPrompt = `
Recipient: ${receiverName}
Occasion: ${occasion}
Relationship: ${relationship}
Tone/Vibe: ${vibe}
Notes from the sender: ${userNotes || "None provided"}
Additional context: ${extraDetails || "None"}

Write one message suitable for this moment. Output only the message text.
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