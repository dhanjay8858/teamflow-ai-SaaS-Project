import client from 'prom-client';

const aiRequestsTotal = new client.Counter({
  name: 'teamflow_ai_requests_total',
  help: 'Total AI requests processed',
  labelNames: ['planner', 'provider', 'status'],
});

const aiLatencyHistogram = new client.Histogram({
  name: 'teamflow_ai_request_duration_seconds',
  help: 'AI execution duration in seconds',
  labelNames: ['planner', 'provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 15],
});

const aiTokensCounter = new client.Counter({
  name: 'teamflow_ai_tokens_total',
  help: 'Total tokens processed by AI platform',
  labelNames: ['type', 'provider'],
});

const aiFallbacksTotal = new client.Counter({
  name: 'teamflow_ai_fallbacks_total',
  help: 'Total provider fallbacks triggered',
  labelNames: ['fromProvider', 'toProvider'],
});

export class AIMetricsService {
  private static instance: AIMetricsService;

  private constructor() {}

  public static getInstance(): AIMetricsService {
    if (!AIMetricsService.instance) {
      AIMetricsService.instance = new AIMetricsService();
    }
    return AIMetricsService.instance;
  }

  public recordRequest(planner: string, provider: string, status = 'success'): void {
    aiRequestsTotal.inc({ planner, provider, status });
  }

  public recordLatency(planner: string, provider: string, durationMs: number): void {
    aiLatencyHistogram.observe({ planner, provider }, durationMs / 1000);
  }

  public recordTokens(provider: string, promptTokens: number, completionTokens: number): void {
    aiTokensCounter.inc({ type: 'prompt', provider }, promptTokens);
    aiTokensCounter.inc({ type: 'completion', provider }, completionTokens);
  }

  public recordFallback(fromProvider: string, toProvider: string): void {
    aiFallbacksTotal.inc({ fromProvider, toProvider });
  }
}

export const aiMetricsService = AIMetricsService.getInstance();
