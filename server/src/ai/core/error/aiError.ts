export class BaseAIError extends Error {
  public readonly code: string;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
  public readonly httpStatus: number;

  constructor(message: string, code: string, recoverable = true, retryable = true, httpStatus = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.recoverable = recoverable;
    this.retryable = retryable;
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProviderUnavailableError extends BaseAIError {
  constructor(providerName: string, reason?: string) {
    super(
      `AI Provider [${providerName}] unavailable: ${reason || 'Service error or circuit open'}`,
      'PROVIDER_UNAVAILABLE',
      true,
      true,
      503
    );
  }
}

export class PlannerNotFoundError extends BaseAIError {
  constructor(plannerName: string) {
    super(`AI Planner [${plannerName}] not registered`, 'PLANNER_NOT_FOUND', false, false, 404);
  }
}

export class PromptNotFoundError extends BaseAIError {
  constructor(promptName: string, version?: string) {
    super(`Prompt [${promptName}] (v${version || 'latest'}) not found in registry`, 'PROMPT_NOT_FOUND', false, false, 404);
  }
}

export class EmbeddingFailureError extends BaseAIError {
  constructor(reason?: string) {
    super(`Embedding generation failed: ${reason || 'Unknown error'}`, 'EMBEDDING_FAILURE', true, true, 500);
  }
}

export class RetrieverFailureError extends BaseAIError {
  constructor(reason?: string) {
    super(`Hybrid RAG Retrieval failed: ${reason || 'Unknown error'}`, 'RETRIEVER_FAILURE', true, true, 500);
  }
}

export class ValidationFailureError extends BaseAIError {
  constructor(reason?: string) {
    super(`AI Output validation failed: ${reason || 'Output contract error'}`, 'VALIDATION_FAILURE', true, false, 422);
  }
}

export class StreamingFailureError extends BaseAIError {
  constructor(reason?: string) {
    super(`SSE Streaming error: ${reason || 'Connection broke'}`, 'STREAMING_FAILURE', true, true, 500);
  }
}
