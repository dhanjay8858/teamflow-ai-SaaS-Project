export interface LLMGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

export interface LLMGenerateInput {
  prompt: string;
  options?: LLMGenerateOptions;
}

export interface LLMGenerateOutput {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  provider: string;
  finishReason?: string;
}

export interface LLMStreamChunk {
  text: string;
  isComplete: boolean;
  model?: string;
}

export interface ProviderHealthStatus {
  provider: string;
  status: 'healthy' | 'unhealthy' | 'unconfigured';
  message?: string;
  latencyMs?: number;
}

export interface LLMProvider {
  name: string;
  generate(input: LLMGenerateInput): Promise<LLMGenerateOutput>;
  stream(
    input: LLMGenerateInput,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<LLMGenerateOutput>;
  embed(text: string): Promise<number[]>;
  countTokens(text: string): Promise<number>;
  health(): Promise<ProviderHealthStatus>;
}
