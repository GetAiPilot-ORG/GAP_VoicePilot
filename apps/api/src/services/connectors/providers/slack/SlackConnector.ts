import { BaseConnector } from '../../core/BaseConnector';
import { 
  ConnectorToolDefinition, 
  ExecutionContext, 
  ToolExecutionResult, 
  AuthType, 
  ExecutionType, 
  HealthCheckResult 
} from '../../types';
import { ProviderError, CredentialExpiredError } from '../../core/errors';

import { ConnectorConfigManager } from '../../../../config/connectorConfig';

export class SlackConnector extends BaseConnector {
  public readonly slug = 'slack';
  public readonly name = 'Slack';
  public readonly description = 'Post messages to channels, search messages, and list workspace channels via Slack OAuth2';
  public readonly authType: AuthType = 'oauth2';
  public readonly executionType: ExecutionType = 'native';

  private static readonly SCOPES = [
    'channels:history',
    'channels:read',
    'chat:write',
    'chat:write.public',
    'groups:history',
    'groups:read',
    'users:read',
  ];

  public listTools(): ConnectorToolDefinition[] {
    return [
      {
        name: 'slack.list_channels',
        connectorSlug: this.slug,
        description: 'List accessible public and private Slack channels in the workspace',
        inputSchema: {
          type: 'object',
          properties: {
            types: { type: 'string', description: 'Comma-separated channel types (default: public_channel,private_channel)', default: 'public_channel,private_channel' },
            limit: { type: 'number', description: 'Maximum number of channels to return (default 20)', default: 20 },
          },
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'slack.search_messages',
        connectorSlug: this.slug,
        description: 'Search workspace message history using query syntax',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Slack message search query string' },
            limit: { type: 'number', description: 'Maximum number of results to return (default 5)', default: 5 },
          },
          required: ['query'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'slack.send_message',
        connectorSlug: this.slug,
        description: 'Post a message to a Slack channel or user (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Slack channel name (e.g. #general) or channel ID' },
            text: { type: 'string', description: 'Message body text' },
          },
          required: ['channel', 'text'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
    ];
  }

  public async getAuthorizationUrl(workspaceId: string, redirectUri: string, state?: string): Promise<string> {
    const config = ConnectorConfigManager.getSlackConfig();
    const clientId = config.clientId || 'mock_slack_client_id';
    const effectiveRedirectUri = config.redirectUri || redirectUri;

    const botScopes = [
      'channels:history',
      'channels:read',
      'chat:write',
      'chat:write.public',
      'groups:history',
      'groups:read',
      'users:read',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      scope: botScopes.join(','),
      redirect_uri: effectiveRedirectUri,
      state: state || '',
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  public async handleCallback(workspaceId: string, code: string, redirectUri: string): Promise<Record<string, any>> {
    const config = ConnectorConfigManager.getSlackConfig();
    const clientId = config.clientId || 'mock_slack_client_id';
    const clientSecret = config.clientSecret || 'mock_slack_client_secret';
    const effectiveRedirectUri = config.redirectUri || redirectUri;

    if (clientId === 'mock_slack_client_id') {
      return {
        access_token: `xoxb-mock-slack-bot-token-${Date.now()}`,
        refresh_token: `mock_slack_refresh_token_${Date.now()}`,
        expires_in: 86400,
        token_type: 'bot',
        team_id: 'T_MOCK_SLACK_TEAM_123',
        team_name: 'VoicePilot Acme Slack Workspace',
        account_email: 'admin@acme-slack.com',
        account_name: 'VoicePilot Acme Slack Workspace',
        bot_user_id: 'U_BOT_MOCK_99',

        scopes: SlackConnector.SCOPES,
      };
    }

    try {
      const res = await fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: effectiveRedirectUri,
        }),
      });

      if (!res.ok) {
        throw new ProviderError(`Slack OAuth access exchange HTTP error: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.ok) {
        throw new ProviderError(`Slack OAuth error: ${data.error || 'Unknown OAuth error'}`);
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        expires_in: data.expires_in || 86400,
        token_type: data.token_type || 'bot',
        team_id: data.team?.id || 'unknown_team',
        team_name: data.team?.name || 'Slack Workspace',
        account_email: data.authed_user?.email || `${data.team?.name || 'slack'}@workspace.com`,
        account_name: data.team?.name || 'Slack Workspace',
        bot_user_id: data.bot_user_id || null,
        scopes: data.scope ? data.scope.split(',') : SlackConnector.SCOPES,
      };
    } catch (err: any) {
      throw new ProviderError(`Slack handleCallback failure: ${err.message}`);
    }
  }

  public async refreshCredentials(credentials: Record<string, any>): Promise<Record<string, any>> {
    const refreshToken = credentials.refresh_token || credentials.raw_token;
    if (!refreshToken) {
      throw new CredentialExpiredError('Missing refresh_token for Slack credential refresh');
    }

    const config = ConnectorConfigManager.getSlackConfig();
    const clientId = config.clientId || 'mock_slack_client_id';
    const clientSecret = config.clientSecret || 'mock_slack_client_secret';

    if (clientId === 'mock_slack_client_id') {
      return {
        access_token: `xoxb-mock-slack-refreshed-token-${Date.now()}`,
        refresh_token: refreshToken,
        expires_in: 86400,
      };
    }

    try {
      const res = await fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new CredentialExpiredError(`Slack token refresh revoked or invalid: ${data.error}`);
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_in: data.expires_in || 86400,
      };
    } catch (err: any) {
      throw new CredentialExpiredError(`Slack credential refresh failed: ${err.message}`);
    }
  }

  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const accessToken = credentials.access_token || credentials.raw_token;
    if (!accessToken) {
      return { healthy: false, status: 'error', message: 'No Slack token present' };
    }

    if (accessToken.startsWith('xoxb-mock-')) {
      return { healthy: true, status: 'connected', message: 'Mock Slack connector operational' };
    }

    try {
      const res = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!data.ok) {
        return { healthy: false, status: 'expired', message: `Slack auth check failed: ${data.error}` };
      }

      return { healthy: true, status: 'connected', message: 'Slack API health check passed' };
    } catch (e: any) {
      return { healthy: false, status: 'error', message: e.message };
    }
  }

  public async executeTool(
    toolName: string,
    args: Record<string, any>,
    context: ExecutionContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const accessToken = context.credentials.access_token || context.credentials.raw_token;

    if (toolName === 'slack.list_channels') {
      const types = args.types || 'public_channel,private_channel';
      const limit = Number(args.limit || 20);

      if (accessToken?.startsWith('xoxb-mock-')) {
        return {
          success: true,
          data: {
            ok: true,
            channels: [
              { id: 'C01111111', name: 'general', is_channel: true, is_private: false, num_members: 14 },
              { id: 'C02222222', name: 'voicepilot-leads', is_channel: true, is_private: false, num_members: 6 },
              { id: 'C03333333', name: 'exec-alerts', is_channel: true, is_private: true, num_members: 3 },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const url = `https://slack.com/api/conversations.list?types=${encodeURIComponent(types)}&limit=${limit}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!data.ok) {
        throw new ProviderError(`Slack list_channels error: ${data.error}`);
      }

      const channels = (data.channels || []).map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        is_private: Boolean(ch.is_private),
        num_members: ch.num_members || 0,
        topic: ch.topic?.value || '',
      }));

      return {
        success: true,
        data: { ok: true, channels_count: channels.length, channels },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'slack.search_messages') {
      this.validateRequiredArgs(args, ['query']);
      const query = String(args.query).trim();
      const limit = Number(args.limit || 5);

      if (accessToken?.startsWith('xoxb-mock-')) {
        return {
          success: true,
          data: {
            query,
            count: 2,
            messages: [
              {
                id: 'm_mock_01',
                channel: '#general',
                user: 'Alex Founder',
                text: `Discussing VoicePilot call results for query: ${query}`,
                timestamp: new Date().toISOString(),
              },
              {
                id: 'm_mock_02',
                channel: '#voicepilot-leads',
                user: 'Sales Agent AI',
                text: `Lead call completed successfully for query: ${query}`,
                timestamp: new Date().toISOString(),
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const url = `https://slack.com/api/search.messages?query=${encodeURIComponent(query)}&count=${limit}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!data.ok) {
        throw new ProviderError(`Slack search_messages error: ${data.error}`);
      }

      const matches = data.messages?.matches || [];
      const messages = matches.map((m: any) => ({
        id: m.iid || m.ts,
        channel: m.channel?.name || m.channel?.id,
        user: m.username || m.user,
        text: m.text,
        timestamp: m.ts,
      }));

      return {
        success: true,
        data: { query, count: messages.length, messages },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'slack.send_message') {
      this.validateRequiredArgs(args, ['channel', 'text']);
      const channel = String(args.channel).trim();
      const text = String(args.text).trim();

      if (accessToken?.startsWith('xoxb-mock-')) {
        return {
          success: true,
          data: {
            ok: true,
            channel,
            ts: `1786100.${Math.floor(Math.random() * 1000)}`,
            text,
            status: 'sent',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ channel, text }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new ProviderError(`Slack send_message error: ${data.error}`);
      }

      return {
        success: true,
        data: {
          ok: true,
          channel: data.channel,
          ts: data.ts,
          text,
          status: 'sent',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    throw new ProviderError(`Unknown tool '${toolName}' for Slack connector`);
  }
}
