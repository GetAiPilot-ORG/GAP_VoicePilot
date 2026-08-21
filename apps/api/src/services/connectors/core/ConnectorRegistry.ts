import { BaseConnector } from './BaseConnector';
import { ConnectorToolDefinition } from '../types';

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, BaseConnector> = new Map();
  private toolsMap: Map<string, { connector: BaseConnector; tool: ConnectorToolDefinition }> = new Map();

  private constructor() {}

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  /**
   * Register a new connector implementation.
   */
  public registerConnector(connector: BaseConnector): void {
    this.connectors.set(connector.slug, connector);

    // Register all tools provided by this connector
    const tools = connector.listTools();
    for (const tool of tools) {
      this.toolsMap.set(tool.name, { connector, tool });
    }
  }

  /**
   * Unregister a connector by slug.
   */
  public unregisterConnector(slug: string): void {
    const connector = this.connectors.get(slug);
    if (connector) {
      const tools = connector.listTools();
      for (const tool of tools) {
        this.toolsMap.delete(tool.name);
      }
      this.connectors.delete(slug);
    }
  }

  /**
   * Get registered connector instance by slug.
   */
  public getConnector(slug: string): BaseConnector | undefined {
    const resolvedSlug = (slug === 'google_workspace' || slug === 'google') ? 'gmail' : slug;
    return this.connectors.get(resolvedSlug) || this.connectors.get(slug);
  }

  /**
   * List all registered connectors.
   */
  public listConnectors(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * List all registered tools across all connectors.
   */
  public listAllTools(): ConnectorToolDefinition[] {
    const allTools: ConnectorToolDefinition[] = [];
    for (const { tool } of this.toolsMap.values()) {
      allTools.push(tool);
    }
    return allTools;
  }

  /**
   * Resolve a tool by name (e.g. "gmail.send_email" or "mock.echo").
   */
  public getTool(toolName: string): { connector: BaseConnector; tool: ConnectorToolDefinition } | undefined {
    const staticMatch = this.toolsMap.get(toolName);
    if (staticMatch) return staticMatch;

    // Resolve dynamic custom MCP tools (e.g. mcp.query_inventory)
    if (toolName.startsWith('mcp.')) {
      const mcpConnector = this.connectors.get('mcp');
      if (mcpConnector) {
        return {
          connector: mcpConnector,
          tool: {
            name: toolName,
            connectorSlug: 'mcp',
            description: `Dynamic Custom MCP Tool '${toolName}'`,
            inputSchema: { type: 'object', properties: {} },
            executionType: 'mcp',
            realtimeSuitability: true,
            timeoutMs: 10000,
            permissionCategory: toolName.includes('create') || toolName.includes('update') ? 'write' : 'read',
          },
        };
      }
    }

    return undefined;
  }

  /**
   * Clear registry (useful for clean testing).
   */
  public clear(): void {
    this.connectors.clear();
    this.toolsMap.clear();
  }
}
