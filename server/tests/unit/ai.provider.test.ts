import { describe, it, expect, vi } from 'vitest';
import { providerManager } from '../../src/ai/providers/provider.manager.js';

describe('AI Provider Manager & Fallback Chain', () => {
  it('should expose health method returning ProviderHealthStatus', async () => {
    const health = await providerManager.health();
    expect(health).toBeDefined();
    expect(health.provider).toContain('provider-manager');
    expect(health.status).toBeDefined();
  });

  it('should calculate approximate token count for text', async () => {
    const tokens = await providerManager.countTokens('Hello world! TeamFlow AI testing suite');
    expect(tokens).toBeGreaterThan(0);
  });

  it('should generate embeddings with 768 dimensions', async () => {
    const embedding = await providerManager.embed('test prompt');
    expect(embedding).toHaveLength(768);
  });
});
