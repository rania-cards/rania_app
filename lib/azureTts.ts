import axios from "axios";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const region = process.env.AZURE_TTS_REGION!;
const key = process.env.AZURE_TTS_KEY!;
const defaultVoice = process.env.AZURE_TTS_DEFAULT_VOICE!;

export async function synthesizeToFile(text: string, voiceId?: string): Promise<string> {
  const voice = voiceId || defaultVoice;

  const ssml = `
  <speak version="1.0" xml:lang="en-US">
    <voice name="${voice}">
      ${text}
    </voice>
  </speak>`.trim();

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const response = await axios.post(endpoint, ssml, {
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    responseType: "arraybuffer",
  });

  const fileName = `${randomUUID()}.mp3`;
  const filePath = path.join("/tmp", fileName);

  await fs.writeFile(filePath, Buffer.from(response.data));

  return filePath;
}