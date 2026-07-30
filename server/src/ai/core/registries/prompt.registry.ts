import { PromptNotFoundError } from '../error/aiError.js';

export interface PromptDefinition {
  name: string;
  version: string;
  category: 'WORKSPACE' | 'TASK' | 'PROJECT' | 'RETRIEVAL';
  description: string;
  author: string;
  template: (...args: any[]) => string;
  enabled: boolean;
  createdAt: Date;
}

export class PromptRegistry {
  private static instance: PromptRegistry;
  private prompts = new Map<string, PromptDefinition[]>();

  private constructor() {
    this.seedDefaultPrompts();
  }

  public static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  public register(def: PromptDefinition): void {
    const list = this.prompts.get(def.name) || [];
    list.push(def);
    this.prompts.set(def.name, list);
  }

  public get(name: string, version?: string): PromptDefinition {
    const list = this.prompts.get(name);
    if (!list || list.length === 0) {
      throw new PromptNotFoundError(name, version);
    }

    if (version) {
      const found = list.find((p) => p.version === version && p.enabled);
      if (!found) throw new PromptNotFoundError(name, version);
      return found;
    }

    // Return latest version by default
    return list[list.length - 1];
  }

  public getLatest(name: string): PromptDefinition {
    return this.get(name);
  }

  public exists(name: string): boolean {
    return this.prompts.has(name);
  }

  public list(): PromptDefinition[] {
    const all: PromptDefinition[] = [];
    for (const list of this.prompts.values()) {
      all.push(...list);
    }
    return all;
  }

  private seedDefaultPrompts(): void {
    this.register({
      name: 'SYSTEM_PROMPT',
      version: '1.0.0',
      category: 'WORKSPACE',
      description: 'System instruction prompt for TeamFlow AI Assistant',
      author: 'Core Engineering',
      template: () => 'You are TeamFlow AI, an enterprise collaborative intelligence assistant.',
      enabled: true,
      createdAt: new Date(),
    });

    this.register({
      name: 'IMPROVE_DESCRIPTION',
      version: '1.0.0',
      category: 'TASK',
      description: 'Task description improvement prompt',
      author: 'Core Engineering',
      template: (title, desc) => `Improve task "${title}": ${desc}`,
      enabled: true,
      createdAt: new Date(),
    });
  }
}

export const promptRegistry = PromptRegistry.getInstance();
