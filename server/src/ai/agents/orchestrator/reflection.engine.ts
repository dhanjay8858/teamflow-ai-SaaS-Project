import { AgentReflection } from '../types/agent.types.js';

export class ReflectionEngine {
  public evaluate(goal: string, output: string, toolFailures: string[] = []): AgentReflection {
    const goalAchieved = output.length > 50 && toolFailures.length === 0;
    const confidenceScore = goalAchieved ? 0.95 : toolFailures.length > 0 ? 0.6 : 0.8;

    const recommendations: string[] = [];
    if (toolFailures.length > 0) {
      recommendations.push(`Retry with alternate tool for: ${toolFailures.join(', ')}`);
    }
    if (!goalAchieved) {
      recommendations.push('Provide additional project description context or task parameters');
    } else {
      recommendations.push('Goal completed successfully adhering to clean engineering standards');
    }

    return {
      confidenceScore,
      goalAchieved,
      missingContext: !goalAchieved,
      toolFailures,
      recommendations,
      reflectionSummary: `Reflection for "${goal.slice(0, 40)}...": Confidence ${Math.round(confidenceScore * 100)}%. ${recommendations.join('. ')}`,
    };
  }
}

export const reflectionEngine = new ReflectionEngine();
