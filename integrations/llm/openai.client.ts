export interface OpenAiClientConfig {
  apiKey: string;
  model?: string;
}

export class OpenAiClient {
  constructor(private readonly config: OpenAiClientConfig) {}

  async summarize(input: string): Promise<string> {
    return `Stub summary from ${this.config.model ?? 'gpt-4.1'}: ${input}`;
  }
}
