import { groqProvider } from '../../providers/groq.provider.js';
import { geminiProvider } from '../../providers/gemini.provider.js';
import { ollamaProvider } from '../../providers/ollama.provider.js';

export interface ProviderDiagnosticStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unconfigured';
  priority: number;
  failureCount: number;
  lastSuccessTimestamp?: Date;
  avgResponseTimeMs: number;
}

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private diagnostics = new Map<string, ProviderDiagnosticStatus>();

  private constructor() {
    this.seedDefaultProviders();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public recordSuccess(name: string, responseTimeMs: number): void {
    const status = this.diagnostics.get(name);
    if (status) {
      status.status = 'healthy';
      status.failureCount = 0;
      status.lastSuccessTimestamp = new Date();
      status.avgResponseTimeMs = Math.round((status.avgResponseTimeMs + responseTimeMs) / 2);
    }
  }

  public recordFailure(name: string): void {
    const status = this.diagnostics.get(name);
    if (status) {
      status.failureCount += 1;
      if (status.failureCount >= 3) {
        status.status = 'unhealthy';
      }
    }
  }

  public list(): ProviderDiagnosticStatus[] {
    return Array.from(this.diagnostics.values());
  }

  private seedDefaultProviders(): void {
    this.diagnostics.set('groq', {
      name: 'groq',
      status: 'healthy',
      priority: 1,
      failureCount: 0,
      avgResponseTimeMs: 120,
    });

    this.diagnostics.set('gemini', {
      name: 'gemini',
      status: 'healthy',
      priority: 2,
      failureCount: 0,
      avgResponseTimeMs: 250,
    });

    this.diagnostics.set('ollama', {
      name: 'ollama',
      status: 'healthy',
      priority: 3,
      failureCount: 0,
      avgResponseTimeMs: 400,
    });
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
