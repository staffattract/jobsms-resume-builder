import { resolveOpenAIModel } from "@/lib/ai/config";
import type { AIProvider, ChatMessage } from "@/lib/ai/types";

const RESPONSES_URL = "https://api.openai.com/v1/responses";

type ResponsesApiError = {
  error?: { message?: string };
};

type OutputTextPart = {
  type?: string;
  text?: string;
};

type OutputMessage = {
  type?: string;
  content?: OutputTextPart[];
};

type ResponsesCreateBody = {
  id?: string;
  object?: string;
  status?: string;
  output?: OutputMessage[];
  output_text?: string;
  error?: { message?: string } | null;
} & ResponsesApiError;

function buildInputString(messages: ChatMessage[]): string {
  return messages.map((m) => `${m.role}: ${m.content}`).join("\n");
}

function extractOutputText(data: ResponsesCreateBody): string {
  if (typeof data.output_text === "string" && data.output_text.trim() !== "") {
    return data.output_text.trim();
  }
  const output = data.output;
  if (!Array.isArray(output)) {
    throw new Error("OpenAI response missing output");
  }
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || item.type !== "message" || !Array.isArray(item.content)) {
      continue;
    }
    for (const part of item.content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }
  const text = chunks.join("\n").trim();
  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }
  return text;
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  constructor(  
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async complete(
    messages: ChatMessage[],
    options?: { temperature?: number },
  ): Promise<string> {
    const res = await fetch(RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: buildInputString(messages),
        temperature: options?.temperature ?? 0.35,
      }),
    });

    const data = (await res.json()) as ResponsesCreateBody;

    if (!res.ok) {
      const msg = data.error?.message ?? res.statusText;
      throw new Error(`OpenAI error: ${msg}`);
    }

    if (data.error) {
      const msg =
        typeof data.error === "object" && data.error && "message" in data.error
          ? String((data.error as { message?: string }).message)
          : "Unknown error";
      throw new Error(`OpenAI error: ${msg}`);
    }

    if (data.status === "failed" || data.status === "cancelled") {
      throw new Error(`OpenAI response status: ${data.status ?? "unknown"}`);
    }

    return extractOutputText(data);
  }
}

export function createOpenAIProviderFromEnv(): OpenAIProvider {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAIProvider(apiKey, resolveOpenAIModel());
}
