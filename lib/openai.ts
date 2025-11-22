import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * The shape of the payload we expect from the client for generating a moment.
 */
export type GenerateMomentInput = {
  receiverName: string;
  occasion: string;
  relationship: string;
  tone: string;
  userMessage: string;
  extraDetails?: string;
};

/**
 * Build the chat messages and call OpenAI to generate a warm, concise message.
 */
export async function generateMomentMessage(
  input: GenerateMomentInput
): Promise<string> {
  const {
    receiverName,
    occasion,
    relationship,
    tone,
    userMessage,
    extraDetails,
  } = input;

  const systemPrompt =
    "You are RANIA, an assistant that helps people turn their feelings into short, emotionally warm messages called 'moments'. " +
    "Your job is to take the user’s rough thoughts and rewrite them as a single, natural-sounding message they can send to someone they care about. " +
    "Write in the first person as if you are the sender. " +
    "Stay human, gentle, and authentic. Avoid saying that you are an AI or that this is generated. " +
    "Keep it concise (around 2–5 sentences).";

  const userPrompt = [
    `I want to create a message for someone special.`,
    `Recipient name: ${receiverName || "..."}`,
    `Occasion: ${occasion || "Not specified"}`,
    `Relationship: ${relationship || "Not specified"}`,
    `Vibe: ${tone || "Warm"}.`,
    `What I want to say (raw notes): ${userMessage || "N/A"}.`,
    extraDetails
      ? `Extra context or memories to include: ${extraDetails}.`
      : `No extra context.`,
    "",
    "Please write one short, heartfelt message in my voice that I can send them.",
  ]
    .join("\n")
    .trim();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // or 'gpt-4o-mini' if you prefer
    messages,
    temperature: 0.8,
    max_tokens: 200,
  });

  const message = response.choices?.[0]?.message?.content;
  if (!message || typeof message !== "string") {
    throw new Error("No message was returned from OpenAI");
  }

  return message.trim();
}