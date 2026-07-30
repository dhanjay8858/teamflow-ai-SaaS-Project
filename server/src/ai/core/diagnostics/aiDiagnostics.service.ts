import { providerRegistry } from '../registries/provider.registry.js';
import { aiHealthService } from '../health/aiHealth.service.js';

export class AIDiagnosticsService {
  public async runDiagnostics() {
    const health = await aiHealthService.getHealth();
    const providers = providerRegistry.list();

    const diagnostics: string[] = [];

    providers.forEach((p) => {
      if (p.status === 'unhealthy') {
        diagnostics.push(`Provider [${p.name}] has ${p.failureCount} recorded failures`);
      }
    });

    if (health.embeddings.status === 'unhealthy') {
      diagnostics.push('Nomic Embedding provider unavailable, using fallback generator');
    }

    if (health.vectorStore.status === 'unhealthy') {
      diagnostics.push('MongoDB Vector Store disconnected, falling back to in-memory vector store');
    }

    return {
      timestamp: new Date(),
      status: health.status,
      issuesCount: diagnostics.length,
      diagnostics: diagnostics.length === 0 ? ['All AI platform systems operating within parameters'] : diagnostics,
      providers,
    };
  }
}

export const aiDiagnosticsService = new AIDiagnosticsService();
