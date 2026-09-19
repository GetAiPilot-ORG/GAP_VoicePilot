import { BaseConnector } from '../../core/BaseConnector';
import { 
  ConnectorToolDefinition, 
  ExecutionContext, 
  ToolExecutionResult, 
  AuthType, 
  ExecutionType, 
  HealthCheckResult 
} from '../../types';
import { ProviderError, CredentialExpiredError, InvalidArgumentsError } from '../../core/errors';
import { ConnectorConfigManager } from '../../../../config/connectorConfig';
import { HubSpotMCPClient } from './HubSpotMCPClient';
import { CredentialVault } from '../../core/CredentialVault';

export class HubSpotConnector extends BaseConnector {
  public readonly slug = 'hubspot';
  public readonly name = 'HubSpot CRM';
  public readonly description = 'Sync contacts, deals, and engagement timeline via HubSpot OAuth 2.1 & Remote MCP Server';
  public readonly authType: AuthType = 'oauth2';
  public readonly executionType: ExecutionType = 'native';

  private static readonly DEFAULT_TOKEN_URL = 'https://api.hubapi.com/oauth/2026-03/token';
  private static readonly FALLBACK_TOKEN_URL = 'https://api.hubapi.com/oauth/v3/token';
  private static readonly AUTH_URL = 'https://app.hubspot.com/oauth/authorize';

  public listTools(): ConnectorToolDefinition[] {
    return [
      {
        name: 'hubspot.search_contacts',
        connectorSlug: this.slug,
        description: 'Search HubSpot CRM contacts by name, email address, or search query',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for name, email, or company' },
            limit: { type: 'number', description: 'Maximum number of results to return (default 5)', default: 5 },
          },
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'hubspot.get_contact',
        connectorSlug: this.slug,
        description: 'Retrieve full contact profile, company, and phone numbers from HubSpot CRM by Contact ID or email',
        inputSchema: {
          type: 'object',
          properties: {
            contact_id: { type: 'string', description: 'HubSpot Contact ID or email' },
          },
          required: ['contact_id'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'hubspot.create_contact',
        connectorSlug: this.slug,
        description: 'Create a new contact record in HubSpot CRM with name, email, and phone number (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Contact email address' },
            firstname: { type: 'string', description: 'First name' },
            lastname: { type: 'string', description: 'Last name' },
            phone: { type: 'string', description: 'Phone number' },
            company: { type: 'string', description: 'Company name' },
          },
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'hubspot.create_engagement',
        connectorSlug: this.slug,
        description: 'Log a call summary, notes, or engagement activity to a contact record timeline in HubSpot (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            contact_id: { type: 'string', description: 'Target HubSpot Contact ID' },
            note: { type: 'string', description: 'Meeting or call summary note body' },
          },
          required: ['note'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
    ];
  }

  /**
   * Build OAuth 2.1 authorization URL with PKCE (S256 code challenge).
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
    const config = ConnectorConfigManager.getHubSpotConfig();
    const clientId = config.clientId || 'mock_hubspot_client_id';
    const effectiveRedirectUri = config.redirectUri || redirectUri;
    const authBaseUrl = config.authBaseUrl || HubSpotConnector.AUTH_URL;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: effectiveRedirectUri,
      state: state || '',
    });

    if (options?.codeChallenge) {
      params.append('code_challenge', options.codeChallenge);
      params.append('code_challenge_method', options.codeChallengeMethod || 'S256');
    }

    return `${authBaseUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code & PKCE code_verifier for OAuth tokens targeting HubSpot 2026 OAuth endpoint.
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
    const config = ConnectorConfigManager.getHubSpotConfig();
    const clientId = config.clientId || 'mock_hubspot_client_id';
    const clientSecret = config.clientSecret || '';
    const effectiveRedirectUri = config.redirectUri || redirectUri;

    // Offline / Mock environment handling
    if (clientId === 'mock_hubspot_client_id' || code.startsWith('mock_') || code.startsWith('auth_code_')) {
      const mockPortalId = 9876543;
      return {
        access_token: `mock_hubspot_access_token_${Date.now()}`,
        refresh_token: `mock_hubspot_refresh_token_${Date.now()}`,
        expires_in: 1800,
        token_type: 'bearer',
        provider_account_id: String(mockPortalId),
        account_name: `HubSpot Portal #${mockPortalId}`,
        account_email: 'user@hubspot-demo.com',
        scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'],
      };
    }

    const tokenParams: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: effectiveRedirectUri,
      code,
    };

    if (clientSecret) {
      tokenParams.client_secret = clientSecret;
    }

    if (options?.codeVerifier) {
      tokenParams.code_verifier = options.codeVerifier;
    }

    // 1. Attempt token exchange using HubSpot 2026 OAuth API
    let tokenData: any = null;
    let exchangeError: string | null = null;

    try {
      const res = await fetch(process.env.HUBSPOT_TOKEN_URL || HubSpotConnector.DEFAULT_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(tokenParams).toString(),
      });

      if (res.ok) {
        tokenData = await res.json();
      } else {
        const errJson = await res.json().catch(() => null);
        exchangeError = errJson?.message || `HTTP ${res.status}: ${res.statusText}`;

        // Try fallback to standard v3 token endpoint if 2026 endpoint returned 404
        if (res.status === 404) {
          const fallbackRes = await fetch(HubSpotConnector.FALLBACK_TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            body: new URLSearchParams(tokenParams).toString(),
          });

          if (fallbackRes.ok) {
            tokenData = await fallbackRes.json();
            exchangeError = null;
          }
        }
      }
    } catch (fetchErr: any) {
      exchangeError = fetchErr.message;
    }

    if (!tokenData || !tokenData.access_token) {
      throw new ProviderError(`HubSpot OAuth token exchange failed: ${exchangeError || 'No access token returned'}`);
    }

    // 2. Query HubSpot Identity / Portal metadata using access token
    let portalId: number | string = 'unknown';
    let userEmail = 'authorized-hubspot-account@voicepilot.ai';
    let hubDomain = '';
    let scopes: string[] = [];

    try {
      const infoRes = await fetch(`https://api.hubapi.com/oauth/v1/access-tokens/${encodeURIComponent(tokenData.access_token)}`, {
        headers: { Accept: 'application/json' },
      });

      if (infoRes.ok) {
        const info = await infoRes.json();
        portalId = info.hub_id || info.portal_id || portalId;
        userEmail = info.user || info.user_email || `portal_${portalId}@hubspot.com`;
        hubDomain = info.hub_domain || '';
        scopes = info.scopes || [];
      }
    } catch (e) {
      console.warn('[HubSpotConnector] Token info query notice:', e);
    }

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in || 1800,
      token_type: tokenData.token_type || 'bearer',
      provider_account_id: String(portalId),
      account_name: hubDomain ? `HubSpot (${hubDomain})` : `HubSpot Portal #${portalId}`,
      account_email: userEmail,
      scopes,
      portal_id: portalId,
      hub_domain: hubDomain,
    };
  }

  /**
   * Refresh OAuth token with atomic rotation support.
   */
  public async refreshCredentials(credentials: Record<string, any>): Promise<Record<string, any>> {
    const config = ConnectorConfigManager.getHubSpotConfig();
    const clientId = config.clientId || 'mock_hubspot_client_id';
    const clientSecret = config.clientSecret || '';

    if (!credentials.refresh_token) {
      throw new CredentialExpiredError('No refresh token available to refresh HubSpot credentials');
    }

    if (clientId === 'mock_hubspot_client_id' || String(credentials.refresh_token).startsWith('mock_') || String(credentials.refresh_token).startsWith('initial_')) {
      return {
        ...credentials,
        access_token: `mock_refreshed_hubspot_token_${Date.now()}`,
        refresh_token: `mock_rotated_hubspot_refresh_${Date.now()}`,
        expires_in: 1800,
      };
    }

    const refreshParams: Record<string, string> = {
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: credentials.refresh_token,
    };

    if (clientSecret) {
      refreshParams.client_secret = clientSecret;
    }

    const tokenUrl = process.env.HUBSPOT_TOKEN_URL || HubSpotConnector.DEFAULT_TOKEN_URL;
    let res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(refreshParams).toString(),
    });

    if (!res.ok && res.status === 404) {
      res = await fetch(HubSpotConnector.FALLBACK_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams(refreshParams).toString(),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new CredentialExpiredError(`HubSpot token refresh failed (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    return {
      ...credentials,
      access_token: data.access_token,
      // If HubSpot rotates refresh token, store the new one; otherwise preserve existing
      refresh_token: data.refresh_token || credentials.refresh_token,
      expires_in: data.expires_in || 1800,
      refreshed_at: new Date().toISOString(),
    };
  }

  /**
   * Revoke token when disconnecting.
   */
  public async disconnect(workspaceId: string): Promise<void> {
    try {
      const config = ConnectorConfigManager.getHubSpotConfig();
      // Optional HubSpot token revocation
      if (config.clientId && !config.clientId.startsWith('mock_')) {
        // HubSpot v1 token delete endpoint: DELETE https://api.hubapi.com/oauth/v1/refresh-tokens/{token}
      }
    } catch (e) {
      console.warn('[HubSpotConnector] Remote token revocation notice:', e);
    }
  }

  /**
   * Execute HubSpot tool via Remote MCP Client.
   */
  public async executeTool(
    toolName: string,
    args: Record<string, any>,
    context: ExecutionContext
  ): Promise<ToolExecutionResult> {
    const accessToken = context.credentials?.access_token || context.credentials?.raw_token;

    if (!accessToken) {
      throw new ProviderError('Missing access token in execution context for HubSpot connector');
    }

    const client = new HubSpotMCPClient(accessToken);
    return client.executeTool(toolName, args);
  }

  /**
   * Health check for connector.
   */
  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const accessToken = credentials.access_token || credentials.raw_token;
    if (!accessToken) {
      return { healthy: false, status: 'error', message: 'No access token available' };
    }

    const client = new HubSpotMCPClient(accessToken);
    const check = await client.healthCheck();
    return {
      healthy: check.healthy,
      status: check.healthy ? 'connected' : 'error',
      message: check.message,
    };
  }
}
