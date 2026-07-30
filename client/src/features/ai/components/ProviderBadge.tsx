import React from 'react';
import { Cpu, Zap, Server } from 'lucide-react';
import { AIMetrics } from '../../../types/ai';

interface ProviderBadgeProps {
  providerName?: string;
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ providerName = 'groq' }) => {
  const normalized = providerName.toLowerCase();

  if (normalized.includes('groq')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
        <Zap size={11} />
        Groq Llama 3.3
      </span>
    );
  }

  if (normalized.includes('gemini')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
        <Cpu size={11} />
        Gemini 1.5 Flash
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
      <Server size={11} />
      Ollama Local
    </span>
  );
};

interface TokenUsageIndicatorProps {
  metrics?: AIMetrics;
}

export const TokenUsageIndicator: React.FC<TokenUsageIndicatorProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
      <span>{metrics.executionTimeMs}ms</span>
      <span>•</span>
      <span>{metrics.tokens?.total || 0} tokens</span>
      {metrics.fallbackCount ? (
        <>
          <span>•</span>
          <span className="text-amber-400/80">Fallback #{metrics.fallbackCount}</span>
        </>
      ) : null}
    </div>
  );
};
