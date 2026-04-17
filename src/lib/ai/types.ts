export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Pluggable LLM backend (OpenAI today; swap implementation later). */
export interface AIProvider {
  readonly name: string;
  complete(messages: ChatMessage[], options?: { temperature?: number }): Promise<string>;
}

export type TailorSuggestion = {
  summary: string;
  alignmentNotes?: string;
};
