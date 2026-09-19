import { optionalEnv } from './env';

export interface ProviderAppCredentials {
  slug: string;
  name: string;
  authType: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  authBaseUrl?: string;
  tokenUrl?: string;
  apiUrl?: string;
  isConfigured: boolean;
  configurationStatus: 'configured' | 'missing_app_credentials' | 'not_applicable';
}

export class ConnectorConfigManager {
  private static getApiBaseUrl(): string {
    return optionalEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000')!.replace(/\/$/, '');
  }

  public static getGmailConfig(): ProviderAppCredentials {
    const clientId = optionalEnv('GMAIL_CLIENT_ID') || optionalEnv('GOOGLE_WORKSPACE_CLIENT_ID');
    const clientSecret = optionalEnv('GMAIL_CLIENT_SECRET') || optionalEnv('GOOGLE_WORKSPACE_CLIENT_SECRET');
    const redirectUri = optionalEnv('GMAIL_REDIRECT_URI') || optionalEnv('GOOGLE_WORKSPACE_REDIRECT_URI', `${this.getApiBaseUrl()}/api/v1/connectors/gmail/callback`);

    const isConfigured = Boolean(clientId && clientSecret && !clientId.startsWith('mock_'));
    return {
      slug: 'gmail',
      name: 'Google Workspace',
      authType: 'oauth2',
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      redirectUri,
      isConfigured,
      configurationStatus: isConfigured ? 'configured' : 'missing_app_credentials',
    };
  }

  public static getSlackConfig(): ProviderAppCredentials {
    const clientId = optionalEnv('SLACK_CLIENT_ID');
    const clientSecret = optionalEnv('SLACK_CLIENT_SECRET');
    const redirectUri = optionalEnv('SLACK_REDIRECT_URI', `${this.getApiBaseUrl()}/api/v1/connectors/slack/callback`);

    const isConfigured = Boolean(clientId && clientSecret && !clientId.startsWith('mock_'));
    return {
      slug: 'slack',
      name: 'Slack',
      authType: 'oauth2',
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      redirectUri,
      isConfigured,
      configurationStatus: isConfigured ? 'configured' : 'missing_app_credentials',
    };
  }

  public static getSalesforceConfig(): ProviderAppCredentials {
    const clientId = optionalEnv('SALESFORCE_CLIENT_ID');
    const clientSecret = optionalEnv('SALESFORCE_CLIENT_SECRET');
    const redirectUri = optionalEnv('SALESFORCE_REDIRECT_URI', `${this.getApiBaseUrl()}/api/v1/connectors/salesforce/callback`);
    const rawAuthUrl = optionalEnv('SALESFORCE_AUTH_URL', 'https://login.salesforce.com/services/oauth2/authorize');
    const authBaseUrl = rawAuthUrl ? rawAuthUrl.split('?')[0].trim() : 'https://login.salesforce.com/services/oauth2/authorize';

    const isConfigured = Boolean(clientId && clientSecret && !clientId.startsWith('mock_'));
    return {
      slug: 'salesforce',
      name: 'Salesforce CRM',
      authType: 'oauth2',
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      redirectUri,
      authBaseUrl,
      isConfigured,
      configurationStatus: isConfigured ? 'configured' : 'missing_app_credentials',
    };
  }

  public static getNotionConfig(): ProviderAppCredentials {
    const clientId = optionalEnv('NOTION_CLIENT_ID');
    const clientSecret = optionalEnv('NOTION_CLIENT_SECRET');
    const redirectUri = optionalEnv('NOTION_REDIRECT_URI', `${this.getApiBaseUrl()}/api/v1/connectors/notion/callback`);
    const rawAuthUrl = optionalEnv('NOTION_AUTH_URL', 'https://api.notion.com/v1/oauth/authorize');
    const authBaseUrl = rawAuthUrl ? rawAuthUrl.split('?')[0].trim() : 'https://api.notion.com/v1/oauth/authorize';

    const isConfigured = Boolean(clientId && clientSecret && !clientId.startsWith('mock_'));
    return {
      slug: 'notion',
      name: 'Notion Workspace',
      authType: 'oauth2',
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      redirectUri,
      authBaseUrl,
      isConfigured,
      configurationStatus: isConfigured ? 'configured' : 'missing_app_credentials',
    };
  }

  public static getLinearConfig(): ProviderAppCredentials {
    const clientId = optionalEnv('LINEAR_CLIENT_ID');
    const clientSecret = optionalEnv('LINEAR_CLIENT_SECRET');
    const redirectUri = optionalEnv('LINEAR_REDIRECT_URI', `${this.getApiBaseUrl()}/api/v1/connectors/linear/callback`);
    const rawAuthUrl = optionalEnv('LINEAR_AUTH_URL', 'https://linear.app/oauth/authorize');
    const authBaseUrl = rawAuthUrl ? rawAuthUrl.split('?')[0].trim() : 'https://linear.app/oauth/authorize';
    const tokenUrl = optionalEnv('LINEAR_TOKEN_URL', 'https://api.linear.app/oauth/token');
    const apiUrl = optionalEnv('LINEAR_API_URL', 'https://api.linear.app/graphql');

    const isConfigured = Boolean(clientId && clientSecret && !clientId.startsWith('mock_'));
    return {
      slug: 'linear',
      name: 'Linear Issue Tracker',
      authType: 'oauth2',
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      redirectUri,
      authBaseUrl,
      tokenUrl,
      apiUrl,
      isConfigured,
      configurationStatus: isConfigured ? 'configured' : 'missing_app_credentials',
    };
  }

  public static getHubSpotConfig(): ProviderAppCredentials {
    const clientId = optionalEnv('HUBSPOT_CLIENT_ID');
    const clientSecret = optionalEnv('HUBSPOT_CLIENT_SECRET');
    const redirectUri = optionalEnv('HUBSPOT_REDIRECT_URI', `${this.getApiBaseUrl()}/api/v1/connectors/hubspot/callback`);
    const authBaseUrl = optionalEnv('HUBSPOT_AUTH_URL', 'https://app.hubspot.com/oauth/authorize');

    const isConfigured = Boolean(clientId && !clientId.startsWith('mock_'));
    return {
      slug: 'hubspot',
      name: 'HubSpot CRM',
      authType: 'oauth2',
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      redirectUri,
      authBaseUrl,
      isConfigured,
      configurationStatus: isConfigured ? 'configured' : 'missing_app_credentials',
    };
  }

  public static getProviderConfig(providerSlug: string): ProviderAppCredentials {
    switch (providerSlug) {
      case 'gmail':
      case 'google':
      case 'google_workspace':
        return this.getGmailConfig();
      case 'slack':
        return this.getSlackConfig();
      case 'hubspot':
        return this.getHubSpotConfig();
      case 'salesforce':
        return this.getSalesforceConfig();
      case 'notion':
        return this.getNotionConfig();
      case 'linear':
        return this.getLinearConfig();
      case 'zapier':
        return {
          slug: 'zapier',
          name: 'Zapier Webhooks',
          authType: 'none',
          isConfigured: true,
          configurationStatus: 'configured',
        };
      case 'mcp':
        return {
          slug: 'mcp',
          name: 'Custom MCP Server',
          authType: 'bearer_token',
          isConfigured: true,
          configurationStatus: 'configured',
        };
      default:
        return {
          slug: providerSlug,
          name: providerSlug,
          authType: 'none',
          isConfigured: true,
          configurationStatus: 'configured',
        };
    }
  }
}
