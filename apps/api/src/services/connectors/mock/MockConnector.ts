import { BaseConnector } from '../core/BaseConnector';
import { 
  ConnectorToolDefinition, 
  ExecutionContext, 
  ToolExecutionResult, 
  AuthType, 
  ExecutionType, 
  HealthCheckResult 
} from '../types';
import { ProviderError } from '../core/errors';

export class MockConnector extends BaseConnector {
  public readonly slug = 'mock';
  public readonly name = 'Mock Testing Connector';
  public readonly description = 'Mock connector for unit testing, integration tests, and architecture validation';
  public readonly authType: AuthType = 'oauth2';
  public readonly executionType: ExecutionType = 'native';

  public listTools(): ConnectorToolDefinition[] {
    return [
      {
        name: 'mock.echo',
        connectorSlug: this.slug,
        description: 'Echo back input arguments for testing execution',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 5000,
        permissionCategory: 'read',
      },
      {
        name: 'mock.disabled_tool',
        connectorSlug: this.slug,
        description: 'Simulate a tool disabled via workspace permission rules',
        inputSchema: {
          type: 'object',
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 5000,
        permissionCategory: 'read',
      },
      {
        name: 'mock.fail',
        connectorSlug: this.slug,
        description: 'Simulate a provider error for testing error handling',
        inputSchema: {
          type: 'object',
          properties: {
            reason: { type: 'string' },
          },
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 3000,
        permissionCategory: 'write',
      },
      {
        name: 'mock.confirm_action',
        connectorSlug: this.slug,
        description: 'Action requiring user confirmation before execution',
        inputSchema: {
          type: 'object',
          properties: {
            action_name: { type: 'string' },
          },
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 5000,
        permissionCategory: 'write',
      },
    ];
  }

  public async executeTool(
    toolName: string,
    args: Record<string, any>,
    context: ExecutionContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    if (toolName === 'mock.echo') {
      this.validateRequiredArgs(args, ['message']);
      return {
        success: true,
        data: {
          echoed_message: args.message,
          workspace_id: context.workspaceId,
          executed_at: new Date().toISOString(),
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'mock.disabled_tool') {
      return {
        success: true,
        data: { status: 'executed_disabled_tool' },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'mock.fail') {
      const reason = args.reason || 'Simulated provider error';
      throw new ProviderError(reason);
    }

    if (toolName === 'mock.confirm_action') {
      return {
        success: true,
        data: {
          confirmed_action: args.action_name || 'default_action',
          status: 'executed',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    throw new ProviderError(`Unknown mock tool '${toolName}'`);
  }

  public async getAuthorizationUrl(workspaceId: string, redirectUri: string, state?: string): Promise<string> {
    const separator = redirectUri.includes('?') ? '&' : '?';
    return `${redirectUri}${separator}code=mock_authorization_code_${Date.now()}&state=${encodeURIComponent(state || '')}`;
  }

  public async handleCallback(workspaceId: string, code: string, redirectUri: string): Promise<Record<string, any>> {
    return {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer',
      account_email: 'testuser@mockprovider.com',
      account_name: 'Test Mock User',
    };
  }

  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    if (credentials.simulate_error) {
      return {
        healthy: false,
        status: 'error',
        message: 'Mock connector simulated auth error',
      };
    }
    return {
      healthy: true,
      status: 'connected',
      message: 'Mock connector healthy',
    };
  }
}
