export interface ToolMetadata {
  name: string;
  category: 'TASK' | 'PROJECT' | 'COMMENT' | 'FILE' | 'SEARCH' | 'WORKSPACE';
  description: string;
  permissions: string[];
  executionTimeoutMs: number;
  fn: (...args: any[]) => Promise<any>;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools = new Map<string, ToolMetadata>();

  private constructor() {
    this.seedDefaultTools();
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  public register(tool: ToolMetadata): void {
    this.tools.set(tool.name, tool);
  }

  public get(name: string): ToolMetadata | undefined {
    return this.tools.get(name);
  }

  public list(): ToolMetadata[] {
    return Array.from(this.tools.values());
  }

  private seedDefaultTools(): void {
    this.register({
      name: 'searchTasks',
      category: 'TASK',
      description: 'Search workspace tasks by query and status',
      permissions: ['workspace:read'],
      executionTimeoutMs: 5000,
      fn: async () => [],
    });

    this.register({
      name: 'searchProjects',
      category: 'PROJECT',
      description: 'Search workspace projects by name or slug',
      permissions: ['workspace:read'],
      executionTimeoutMs: 5000,
      fn: async () => [],
    });

    this.register({
      name: 'searchFiles',
      category: 'FILE',
      description: 'Search files and attachment metadata',
      permissions: ['workspace:read'],
      executionTimeoutMs: 5000,
      fn: async () => [],
    });

    this.register({
      name: 'searchComments',
      category: 'COMMENT',
      description: 'Search task comments and discussions',
      permissions: ['workspace:read'],
      executionTimeoutMs: 5000,
      fn: async () => [],
    });
  }
}

export const toolRegistry = ToolRegistry.getInstance();
