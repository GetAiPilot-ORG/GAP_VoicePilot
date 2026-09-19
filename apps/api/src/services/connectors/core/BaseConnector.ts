import { 
  ConnectorToolDefinition, 
  ExecutionContext, 
  ToolExecutionResult, 
  HealthCheckResult, 
  AuthType, 
  ExecutionType 
} from '../types';
import { InvalidArgumentsError } from './errors';

export abstract class BaseConnector {
  public abstract readonly slug: string;
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly authType: AuthType;
  public abstract readonly executionType: ExecutionType;

  /**
   * Return array of standard tool definitions provided by this connector.
   */
  public abstract listTools(): ConnectorToolDefinition[];

  /**
   * Execute a specific tool by toolName.
   */
  public abstract executeTool(
    toolName: string,
    args: Record<string, any>,
    context: ExecutionContext
  ): Promise<ToolExecutionResult>;

  /**
   * Generate OAuth Authorization URL if supported.
   */
  public async getAuthorizationUrl(
    workspaceId: string,
    redirectUri: string,
    state?: string,
    options?: {
      codeChallenge?: string;
      codeChallengeMethod?: 'S256' | string;
      [key: string]: any;
    }
  ): Promise<string> {
    throw new Error(`OAuth authorization is not supported by connector '${this.slug}'`);
  }

  /**
   * Exchange OAuth auth code for credentials if supported.
   */
  public async handleCallback(
    workspaceId: string,
    code: string,
    redirectUri: string,
    options?: {
      codeVerifier?: string | null;
      [key: string]: any;
    }
  ): Promise<Record<string, any>> {
    throw new Error(`OAuth callback is not supported by connector '${this.slug}'`);
  }

  /**
   * Refresh expired OAuth access token if supported.
   */
  public async refreshCredentials(
    credentials: Record<string, any>
  ): Promise<Record<string, any>> {
    return credentials;
  }

  /**
   * Perform health check against upstream provider.
   */
  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    return {
      healthy: true,
      status: 'connected',
      message: 'Health check passed',
    };
  }

  /**
   * Perform cleanup/revocation when workspace disconnects integration.
   */
  public async disconnect(workspaceId: string): Promise<void> {
    // Default no-op
  }

  /**
   * Validate required arguments against simple key requirements.
   */
  protected validateRequiredArgs(args: Record<string, any>, requiredKeys: string[]): void {
    const missing = requiredKeys.filter((key) => args[key] === undefined || args[key] === null);
    if (missing.length > 0) {
      throw new InvalidArgumentsError(`Missing required parameters: ${missing.join(', ')}`);
    }
  }
}
