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
import { GoogleIdentityVerifier } from './GoogleIdentityVerifier';

export class GmailConnector extends BaseConnector {
  public readonly slug = 'gmail';
  public readonly name = 'Google Workspace';
  public readonly description = 'Unified Google Workspace integration: Gmail, Calendar, Contacts, Drive, Sheets, and Meet via OAuth2';
  public readonly authType: AuthType = 'oauth2';
  public readonly executionType: ExecutionType = 'native';

  public static readonly SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/meetings.space.created',
  ];

  public listTools(): ConnectorToolDefinition[] {
    return [
      // --- 1. GMAIL TOOLS ---
      {
        name: 'gmail.search_email',
        connectorSlug: this.slug,
        description: 'Search Gmail inbox messages using query syntax (e.g. from:support or label:UNREAD)',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Gmail search query string' },
            limit: { type: 'number', description: 'Maximum number of messages to return (default 5)', default: 5 },
          },
          required: ['query'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'gmail.get_email',
        connectorSlug: this.slug,
        description: 'Retrieve full email headers, snippet, and body content by message ID',
        inputSchema: {
          type: 'object',
          properties: {
            message_id: { type: 'string', description: 'Gmail message ID' },
          },
          required: ['message_id'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'gmail.create_draft',
        connectorSlug: this.slug,
        description: 'Create an email draft in Gmail without sending it immediately',
        inputSchema: {
          type: 'object',
          properties: {
            to: { type: 'string', description: 'Recipient email address' },
            subject: { type: 'string', description: 'Email subject line' },
            body: { type: 'string', description: 'Email body content' },
            cc: { type: 'string', description: 'Optional CC recipient email address' },
          },
          required: ['to', 'subject', 'body'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
      {
        name: 'gmail.send_email',
        connectorSlug: this.slug,
        description: 'Send an email directly through Gmail (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            to: { type: 'string', description: 'Recipient email address' },
            subject: { type: 'string', description: 'Email subject line' },
            body: { type: 'string', description: 'Email body content' },
            cc: { type: 'string', description: 'Optional CC recipient email address' },
          },
          required: ['to', 'subject', 'body'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },

      // --- 2. GOOGLE CALENDAR TOOLS ---
      {
        name: 'google_calendar.check_availability',
        connectorSlug: this.slug,
        description: 'Check schedule free/busy availability in Google Calendar for a date and time window',
        inputSchema: {
          type: 'object',
          properties: {
            start_time: { type: 'string', description: 'Start time ISO string (e.g. 2026-08-20T09:00:00Z)' },
            end_time: { type: 'string', description: 'End time ISO string (e.g. 2026-08-20T17:00:00Z)' },
          },
          required: ['start_time', 'end_time'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'google_calendar.list_events',
        connectorSlug: this.slug,
        description: 'List scheduled calendar events from primary Google Calendar',
        inputSchema: {
          type: 'object',
          properties: {
            time_min: { type: 'string', description: 'Lower bound ISO string' },
            time_max: { type: 'string', description: 'Upper bound ISO string' },
            limit: { type: 'number', description: 'Max events to return', default: 10 },
          },
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'google_calendar.create_event',
        connectorSlug: this.slug,
        description: 'Create a new Google Calendar event / meeting appointment',
        inputSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Event title / summary' },
            start_time: { type: 'string', description: 'Start time ISO string' },
            end_time: { type: 'string', description: 'End time ISO string' },
            description: { type: 'string', description: 'Meeting description or agenda' },
            attendees: { type: 'string', description: 'Comma-separated attendee email addresses' },
          },
          required: ['summary', 'start_time', 'end_time'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
      {
        name: 'google_calendar.cancel_event',
        connectorSlug: this.slug,
        description: 'Delete or cancel an existing Google Calendar event by ID',
        inputSchema: {
          type: 'object',
          properties: {
            event_id: { type: 'string', description: 'Google Calendar Event ID' },
          },
          required: ['event_id'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 6000,
        permissionCategory: 'write',
      },

      // --- 3. GOOGLE CONTACTS (PEOPLE API) TOOLS ---
      {
        name: 'google_contacts.search_contacts',
        connectorSlug: this.slug,
        description: 'Search Google Contacts by name, email, or phone query string',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for name or email' },
          },
          required: ['query'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'google_contacts.get_contact',
        connectorSlug: this.slug,
        description: 'Get detailed profile for a Google Contact by resource name',
        inputSchema: {
          type: 'object',
          properties: {
            resource_name: { type: 'string', description: 'Resource name (e.g. people/c12345)' },
          },
          required: ['resource_name'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'google_contacts.create_contact',
        connectorSlug: this.slug,
        description: 'Create a new contact record in Google Contacts',
        inputSchema: {
          type: 'object',
          properties: {
            given_name: { type: 'string', description: 'First name' },
            family_name: { type: 'string', description: 'Last name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' },
          },
          required: ['given_name'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
      {
        name: 'google_contacts.update_contact',
        connectorSlug: this.slug,
        description: 'Update existing contact details in Google Contacts',
        inputSchema: {
          type: 'object',
          properties: {
            resource_name: { type: 'string', description: 'Resource name' },
            given_name: { type: 'string', description: 'Updated first name' },
            family_name: { type: 'string', description: 'Updated last name' },
            email: { type: 'string', description: 'Updated email' },
            phone: { type: 'string', description: 'Updated phone' },
          },
          required: ['resource_name'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },

      // --- 4. GOOGLE DRIVE TOOLS ---
      {
        name: 'google_drive.search_files',
        connectorSlug: this.slug,
        description: 'Search accessible files and documents in Google Drive',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for file name or content' },
            limit: { type: 'number', description: 'Max files to return', default: 10 },
          },
          required: ['query'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'google_drive.get_file_metadata',
        connectorSlug: this.slug,
        description: 'Fetch file size, webViewLink, and metadata by Google Drive file ID',
        inputSchema: {
          type: 'object',
          properties: {
            file_id: { type: 'string', description: 'Google Drive File ID' },
          },
          required: ['file_id'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },

      // --- 5. GOOGLE SHEETS TOOLS ---
      {
        name: 'google_sheets.read_spreadsheet',
        connectorSlug: this.slug,
        description: 'Read tabular row data from a Google Spreadsheet range',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { type: 'string', description: 'Google Spreadsheet ID' },
            range: { type: 'string', description: 'Sheet range (e.g. Sheet1!A1:E50)', default: 'Sheet1!A1:Z100' },
          },
          required: ['spreadsheet_id'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'google_sheets.append_row',
        connectorSlug: this.slug,
        description: 'Append a new data row to a Google Spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { type: 'string', description: 'Google Spreadsheet ID' },
            range: { type: 'string', description: 'Target sheet range (e.g. Sheet1!A1)', default: 'Sheet1!A1' },
            values: { type: 'array', items: { type: 'string' }, description: 'Row column values array' },
          },
          required: ['spreadsheet_id', 'values'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
      {
        name: 'google_sheets.update_cell',
        connectorSlug: this.slug,
        description: 'Update specific cells or range in a Google Spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { type: 'string', description: 'Google Spreadsheet ID' },
            range: { type: 'string', description: 'Cell location (e.g. Sheet1!B2)' },
            values: { type: 'array', items: { type: 'string' }, description: 'Values to write' },
          },
          required: ['spreadsheet_id', 'range', 'values'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },

      // --- 6. GOOGLE MEET TOOLS ---
      {
        name: 'google_meet.create_space',
        connectorSlug: this.slug,
        description: 'Create a new instant Google Meet video conference link / meeting space',
        inputSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Meeting topic / summary', default: 'VoicePilot Call Meeting' },
            start_time: { type: 'string', description: 'Start ISO timestamp' },
            end_time: { type: 'string', description: 'End ISO timestamp' },
          },
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
    ];
  }

  public async getAuthorizationUrl(workspaceId: string, redirectUri: string, state?: string): Promise<string> {
    const config = ConnectorConfigManager.getGmailConfig();
    const clientId = config.clientId || 'mock_gmail_client_id';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: effectiveRedirectUri,
      response_type: 'code',
      scope: GmailConnector.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: state || '',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async handleCallback(workspaceId: string, code: string, redirectUri: string): Promise<Record<string, any>> {
    const config = ConnectorConfigManager.getGmailConfig();
    const clientId = config.clientId || 'mock_gmail_client_id';
    const clientSecret = config.clientSecret || 'mock_gmail_client_secret';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;

    if (clientId === 'mock_gmail_client_id' || code.startsWith('code_gmail_mock_') || code.startsWith('mock_')) {
      return {
        access_token: `mock_gmail_access_token_${Date.now()}`,
        refresh_token: `mock_gmail_refresh_token_${Date.now()}`,
        expires_in: 3600,
        token_type: 'Bearer',
        account_email: 'voicepilot.test@gmail.com',
        account_name: 'VoicePilot Test User',
        scopes: GmailConnector.SCOPES,
      };
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: effectiveRedirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new ProviderError(`Google OAuth token exchange failed: ${errText}`);
      }

      const tokenData = await tokenRes.json();

      const hasAccessToken = Boolean(tokenData.access_token);
      const hasIdToken = Boolean(tokenData.id_token);
      console.log(`[OAuth Diagnostic] token_exchange_success: ${hasAccessToken} | access_token_present: ${hasAccessToken} | id_token_present: ${hasIdToken}`);

      let email: string | undefined;
      let name: string | undefined;
      let providerAccountId: string | undefined;
      let isEmailVerified = false;

      console.log(`[OAuth Diagnostic] identity_fetch_started: true`);

      // Preferred Strategy 1: Cryptographically verified Google ID Token
      let identity = await GoogleIdentityVerifier.verifyIdToken(tokenData.id_token, clientId);

      // Fallback Strategy 2: Google OIDC UserInfo endpoint with access token
      if (!identity && tokenData.access_token) {
        console.warn(`[OAuth Diagnostic] Verified ID Token not available, falling back to Google UserInfo endpoint`);
        identity = await GoogleIdentityVerifier.fetchUserInfo(tokenData.access_token);
      }

      const isIdentitySuccess = Boolean(identity && identity.email && identity.email.includes('@'));
      console.log(`[OAuth Diagnostic] identity_fetch_success: ${isIdentitySuccess} | email_present: ${Boolean(identity?.email)} | email_verified: ${Boolean(identity?.email_verified)} | provider_account_id_present: ${Boolean(identity?.sub)}`);

      if (!identity || !isIdentitySuccess) {
        throw new ProviderError('Failed to retrieve verified Google account identity');
      }

      const grantedScopesList = typeof tokenData.scope === 'string'
        ? tokenData.scope.split(' ')
        : Array.isArray(tokenData.scope)
        ? tokenData.scope
        : GmailConnector.SCOPES;

      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in || 3600,
        token_type: tokenData.token_type || 'Bearer',
        account_email: identity.email,
        account_name: identity.name || identity.email,
        provider_account_id: identity.sub,
        scopes: grantedScopesList,
      };
    } catch (err: any) {
      throw new ProviderError(`Google handleCallback error: ${err.message}`);
    }
  }

  public async refreshCredentials(credentials: Record<string, any>): Promise<Record<string, any>> {
    const refreshToken = credentials.refresh_token || credentials.raw_token;
    if (!refreshToken) {
      throw new CredentialExpiredError('Missing refresh_token for Google Workspace credential refresh');
    }

    const config = ConnectorConfigManager.getGmailConfig();
    const clientId = config.clientId || 'mock_gmail_client_id';
    const clientSecret = config.clientSecret || 'mock_gmail_client_secret';

    if (clientId === 'mock_gmail_client_id') {
      return {
        access_token: `mock_gmail_refreshed_access_token_${Date.now()}`,
        refresh_token: refreshToken,
        expires_in: 3600,
      };
    }

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new CredentialExpiredError(`Google refresh token revoked or invalid: ${errText}`);
      }

      const data = await res.json();
      return {
        access_token: data.access_token,
        refresh_token: refreshToken,
        expires_in: data.expires_in || 3600,
      };
    } catch (err: any) {
      throw new CredentialExpiredError(`Google credential refresh failed: ${err.message}`);
    }
  }

  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const accessToken = credentials.access_token || credentials.raw_token;
    if (!accessToken) {
      return { healthy: false, status: 'error', message: 'No access token found' };
    }

    if (accessToken.startsWith('mock_')) {
      return { healthy: true, status: 'connected', message: 'Mock Google Workspace connector operational' };
    }

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        return { healthy: false, status: 'expired', message: 'Google access token invalid or expired' };
      }

      return { healthy: true, status: 'connected', message: 'Google Workspace health check passed' };
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

    // --- 1. GMAIL TOOLS ---
    if (toolName === 'gmail.search_email') {
      this.validateRequiredArgs(args, ['query']);
      const query = String(args.query).trim();
      const limit = Number(args.limit || 5);

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            query,
            count: 2,
            messages: [
              {
                id: 'msg_mock_001',
                threadId: 'thread_001',
                subject: 'VoicePilot Inquiry',
                from: 'client@example.com',
                date: new Date().toISOString(),
                snippet: 'We would like to connect your VoicePilot call bot to our CRM.',
              },
              {
                id: 'msg_mock_002',
                threadId: 'thread_002',
                subject: 'Meeting Confirmation',
                from: 'alex@acme.org',
                date: new Date().toISOString(),
                snippet: 'Sounds great, let us schedule a demo call tomorrow.',
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${limit}`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!searchRes.ok) {
        throw new ProviderError(`Gmail search failed: ${await searchRes.text()}`);
      }

      const searchData = await searchRes.json();
      const rawMessages = searchData.messages || [];

      const messages = await Promise.all(
        rawMessages.map(async (msg: any) => {
          try {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!detailRes.ok) return { id: msg.id, threadId: msg.threadId };
            const detail = await detailRes.json();
            const headers = detail.payload?.headers || [];
            const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

            return {
              id: detail.id,
              threadId: detail.threadId,
              subject: getHeader('Subject'),
              from: getHeader('From'),
              to: getHeader('To'),
              date: getHeader('Date'),
              snippet: detail.snippet || '',
            };
          } catch {
            return { id: msg.id, threadId: msg.threadId };
          }
        })
      );

      return {
        success: true,
        data: { query, count: messages.length, messages },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'gmail.get_email') {
      this.validateRequiredArgs(args, ['message_id']);
      const messageId = String(args.message_id).trim();

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            id: messageId,
            threadId: 'thread_mock_123',
            subject: 'Mock Email Subject',
            from: 'support@voicepilot.ai',
            to: 'customer@example.com',
            date: new Date().toISOString(),
            body: 'Hello! This is a mock email body retrieved from Gmail API.',
            snippet: 'Hello! This is a mock email body...',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!detailRes.ok) {
        throw new ProviderError(`Gmail get_email failed for ID '${messageId}': ${await detailRes.text()}`);
      }

      const detail = await detailRes.json();
      const headers = detail.payload?.headers || [];
      const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      let body = detail.snippet || '';
      if (detail.payload?.body?.data) {
        body = Buffer.from(detail.payload.body.data, 'base64url').toString('utf8');
      } else if (detail.payload?.parts) {
        const textPart = detail.payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64url').toString('utf8');
        }
      }

      return {
        success: true,
        data: {
          id: detail.id,
          threadId: detail.threadId,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          to: getHeader('To'),
          cc: getHeader('Cc'),
          date: getHeader('Date'),
          snippet: detail.snippet || '',
          body,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'gmail.create_draft') {
      this.validateRequiredArgs(args, ['to', 'subject', 'body']);
      const { to, subject, body, cc } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            draft_id: `draft_mock_${Date.now()}`,
            message_id: `msg_draft_mock_${Date.now()}`,
            to,
            subject,
            status: 'created',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const rawEmail = this.buildRfc2822Message({ to, subject, body, cc });
      const encodedRaw = Buffer.from(rawEmail).toString('base64url');

      const draftRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: { raw: encodedRaw } }),
      });

      if (!draftRes.ok) {
        throw new ProviderError(`Gmail create_draft failed: ${await draftRes.text()}`);
      }

      const draftData = await draftRes.json();
      return {
        success: true,
        data: {
          draft_id: draftData.id,
          message_id: draftData.message?.id,
          to,
          subject,
          status: 'created',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'gmail.send_email') {
      this.validateRequiredArgs(args, ['to', 'subject', 'body']);
      const { to, subject, body, cc } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            message_id: `msg_sent_mock_${Date.now()}`,
            thread_id: `thread_sent_mock_${Date.now()}`,
            to,
            subject,
            status: 'sent',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const rawEmail = this.buildRfc2822Message({ to, subject, body, cc });
      const encodedRaw = Buffer.from(rawEmail).toString('base64url');

      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedRaw }),
      });

      if (!sendRes.ok) {
        throw new ProviderError(`Gmail send_email failed: ${await sendRes.text()}`);
      }

      const sendData = await sendRes.json();
      return {
        success: true,
        data: {
          message_id: sendData.id,
          thread_id: sendData.threadId,
          to,
          subject,
          status: 'sent',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // --- 2. GOOGLE CALENDAR TOOLS ---
    if (toolName === 'google_calendar.check_availability') {
      this.validateRequiredArgs(args, ['start_time', 'end_time']);
      const { start_time, end_time } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            available: true,
            start_time,
            end_time,
            busy_slots: [],
            message: 'Slot is completely free for appointment',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: start_time,
          timeMax: end_time,
          items: [{ id: 'primary' }],
        }),
      });

      if (!fbRes.ok) {
        throw new ProviderError(`Calendar check_availability failed: ${await fbRes.text()}`);
      }

      const fbData = await fbRes.json();
      const busySlots = fbData.calendars?.primary?.busy || [];

      return {
        success: true,
        data: {
          available: busySlots.length === 0,
          start_time,
          end_time,
          busy_slots: busySlots,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_calendar.list_events') {
      const timeMin = args.time_min || new Date().toISOString();
      const timeMax = args.time_max;
      const limit = Number(args.limit || 10);

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            count: 2,
            events: [
              {
                id: 'evt_mock_01',
                summary: 'VoicePilot Strategy Meeting',
                start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
                end: { dateTime: new Date(Date.now() + 7200000).toISOString() },
                htmlLink: 'https://calendar.google.com/event?id=evt_mock_01',
              },
              {
                id: 'evt_mock_02',
                summary: 'Client Demo Call',
                start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
                end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
                htmlLink: 'https://calendar.google.com/event?id=evt_mock_02',
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      let url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=${limit}&singleEvents=true&orderBy=startTime`;
      if (timeMax) url += `&timeMax=${encodeURIComponent(timeMax)}`;

      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!listRes.ok) {
        throw new ProviderError(`Calendar list_events failed: ${await listRes.text()}`);
      }

      const listData = await listRes.json();
      return {
        success: true,
        data: {
          count: (listData.items || []).length,
          events: (listData.items || []).map((e: any) => ({
            id: e.id,
            summary: e.summary,
            description: e.description,
            start: e.start,
            end: e.end,
            htmlLink: e.htmlLink,
            hangoutLink: e.hangoutLink,
          })),
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_calendar.create_event') {
      this.validateRequiredArgs(args, ['summary', 'start_time', 'end_time']);
      const { summary, start_time, end_time, description, attendees } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            event_id: `evt_mock_${Date.now()}`,
            summary,
            start_time,
            end_time,
            status: 'confirmed',
            htmlLink: 'https://calendar.google.com/event?id=mock',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const attendeesList = typeof attendees === 'string'
        ? attendees.split(',').map((email: string) => ({ email: email.trim() }))
        : [];

      const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          description: description || 'Created by VoicePilot Assistant',
          start: { dateTime: start_time },
          end: { dateTime: end_time },
          attendees: attendeesList,
        }),
      });

      if (!createRes.ok) {
        throw new ProviderError(`Calendar create_event failed: ${await createRes.text()}`);
      }

      const evt = await createRes.json();
      return {
        success: true,
        data: {
          event_id: evt.id,
          summary: evt.summary,
          status: evt.status,
          htmlLink: evt.htmlLink,
          hangoutLink: evt.hangoutLink,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_calendar.cancel_event') {
      this.validateRequiredArgs(args, ['event_id']);
      const { event_id } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: { event_id, status: 'cancelled' },
          latencyMs: Date.now() - startTime,
        };
      }

      const delRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!delRes.ok && delRes.status !== 204) {
        throw new ProviderError(`Calendar cancel_event failed: ${await delRes.text()}`);
      }

      return {
        success: true,
        data: { event_id, status: 'cancelled' },
        latencyMs: Date.now() - startTime,
      };
    }

    // --- 3. GOOGLE CONTACTS (PEOPLE API) TOOLS ---
    if (toolName === 'google_contacts.search_contacts') {
      this.validateRequiredArgs(args, ['query']);
      const query = String(args.query).trim();

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            query,
            count: 1,
            contacts: [
              {
                resourceName: 'people/c_mock_123',
                name: 'Alex Johnson',
                email: 'alex.johnson@example.com',
                phone: '+15550199283',
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch(`https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(query)}&readMask=names,emailAddresses,phoneNumbers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new ProviderError(`Google Contacts search failed: ${await res.text()}`);
      }

      const data = await res.json();
      const results = (data.results || []).map((r: any) => {
        const person = r.person || {};
        return {
          resourceName: person.resourceName,
          name: person.names?.[0]?.displayName || 'Unknown Name',
          email: person.emailAddresses?.[0]?.value || '',
          phone: person.phoneNumbers?.[0]?.value || '',
        };
      });

      return {
        success: true,
        data: { query, count: results.length, contacts: results },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_contacts.get_contact') {
      this.validateRequiredArgs(args, ['resource_name']);
      const { resource_name } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            resourceName: resource_name,
            name: 'Alex Johnson',
            email: 'alex.johnson@example.com',
            phone: '+15550199283',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch(`https://people.googleapis.com/v1/${resource_name}?personFields=names,emailAddresses,phoneNumbers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new ProviderError(`Google Contacts get_contact failed: ${await res.text()}`);
      }

      const person = await res.json();
      return {
        success: true,
        data: {
          resourceName: person.resourceName,
          name: person.names?.[0]?.displayName || '',
          email: person.emailAddresses?.[0]?.value || '',
          phone: person.phoneNumbers?.[0]?.value || '',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_contacts.create_contact') {
      this.validateRequiredArgs(args, ['given_name']);
      const { given_name, family_name, email, phone } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            resourceName: `people/c_mock_${Date.now()}`,
            name: `${given_name} ${family_name || ''}`.trim(),
            email,
            phone,
            status: 'created',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names: [{ givenName: given_name, familyName: family_name || '' }],
          emailAddresses: email ? [{ value: email }] : [],
          phoneNumbers: phone ? [{ value: phone }] : [],
        }),
      });

      if (!res.ok) {
        throw new ProviderError(`Google Contacts create_contact failed: ${await res.text()}`);
      }

      const person = await res.json();
      return {
        success: true,
        data: {
          resourceName: person.resourceName,
          name: person.names?.[0]?.displayName || '',
          email: person.emailAddresses?.[0]?.value || '',
          phone: person.phoneNumbers?.[0]?.value || '',
          status: 'created',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_contacts.update_contact') {
      this.validateRequiredArgs(args, ['resource_name']);
      const { resource_name, given_name, family_name, email, phone } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            resourceName: resource_name,
            status: 'updated',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      // Fetch existing contact to get etag
      const getRes = await fetch(`https://people.googleapis.com/v1/${resource_name}?personFields=names,emailAddresses,phoneNumbers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!getRes.ok) {
        throw new ProviderError(`Google Contacts fetch for update failed: ${await getRes.text()}`);
      }

      const existingPerson = await getRes.json();

      const patchRes = await fetch(`https://people.googleapis.com/v1/${resource_name}:updateContact?updatePersonFields=names,emailAddresses,phoneNumbers`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          etag: existingPerson.etag,
          resourceName: resource_name,
          names: given_name ? [{ givenName: given_name, familyName: family_name || '' }] : existingPerson.names,
          emailAddresses: email ? [{ value: email }] : existingPerson.emailAddresses,
          phoneNumbers: phone ? [{ value: phone }] : existingPerson.phoneNumbers,
        }),
      });

      if (!patchRes.ok) {
        throw new ProviderError(`Google Contacts update_contact failed: ${await patchRes.text()}`);
      }

      const person = await patchRes.json();
      return {
        success: true,
        data: {
          resourceName: person.resourceName,
          name: person.names?.[0]?.displayName || '',
          status: 'updated',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // --- 4. GOOGLE DRIVE TOOLS ---
    if (toolName === 'google_drive.search_files') {
      this.validateRequiredArgs(args, ['query']);
      const query = String(args.query).trim();
      const limit = Number(args.limit || 10);

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            query,
            count: 2,
            files: [
              {
                id: 'file_mock_01',
                name: 'Q3 Financial Leads.xlsx',
                mimeType: 'application/vnd.google-apps.spreadsheet',
                webViewLink: 'https://drive.google.com/file/d/file_mock_01/view',
              },
              {
                id: 'file_mock_02',
                name: 'VoicePilot Call Guidelines.pdf',
                mimeType: 'application/pdf',
                webViewLink: 'https://drive.google.com/file/d/file_mock_02/view',
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const qParam = `name contains '${query}' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(qParam)}&pageSize=${limit}&fields=files(id,name,mimeType,createdTime,webViewLink)`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new ProviderError(`Drive search_files failed: ${await res.text()}`);
      }

      const data = await res.json();
      return {
        success: true,
        data: {
          query,
          count: (data.files || []).length,
          files: data.files || [],
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_drive.get_file_metadata') {
      this.validateRequiredArgs(args, ['file_id']);
      const { file_id } = args;

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            id: file_id,
            name: 'VoicePilot Product Spec.pdf',
            mimeType: 'application/pdf',
            size: '102400',
            webViewLink: `https://drive.google.com/file/d/${file_id}/view`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file_id}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new ProviderError(`Drive get_file_metadata failed: ${await res.text()}`);
      }

      const meta = await res.json();
      return {
        success: true,
        data: meta,
        latencyMs: Date.now() - startTime,
      };
    }

    // --- 5. GOOGLE SHEETS TOOLS ---
    if (toolName === 'google_sheets.read_spreadsheet') {
      this.validateRequiredArgs(args, ['spreadsheet_id']);
      const spreadsheetId = String(args.spreadsheet_id).trim();
      const range = String(args.range || 'Sheet1!A1:Z100').trim();

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            spreadsheet_id: spreadsheetId,
            range,
            rows_count: 3,
            values: [
              ['Name', 'Email', 'Phone', 'Call Outcome'],
              ['John Doe', 'john@example.com', '+15550192', 'Qualified Lead'],
              ['Jane Smith', 'jane@acme.org', '+15550193', 'Interested - Call Back'],
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new ProviderError(`Sheets read_spreadsheet failed: ${await res.text()}`);
      }

      const data = await res.json();
      return {
        success: true,
        data: {
          spreadsheet_id: spreadsheetId,
          range: data.range,
          rows_count: (data.values || []).length,
          values: data.values || [],
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_sheets.append_row') {
      this.validateRequiredArgs(args, ['spreadsheet_id', 'values']);
      const spreadsheetId = String(args.spreadsheet_id).trim();
      const range = String(args.range || 'Sheet1!A1').trim();
      const values = Array.isArray(args.values) ? args.values : [String(args.values)];

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            spreadsheet_id: spreadsheetId,
            range,
            updatedRows: 1,
            status: 'appended',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [values] }),
      });

      if (!res.ok) {
        throw new ProviderError(`Sheets append_row failed: ${await res.text()}`);
      }

      const data = await res.json();
      return {
        success: true,
        data: {
          spreadsheet_id: spreadsheetId,
          updatedRange: data.updates?.updatedRange,
          updatedRows: data.updates?.updatedRows || 1,
          status: 'appended',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'google_sheets.update_cell') {
      this.validateRequiredArgs(args, ['spreadsheet_id', 'range', 'values']);
      const spreadsheetId = String(args.spreadsheet_id).trim();
      const range = String(args.range).trim();
      const values = Array.isArray(args.values) ? args.values : [String(args.values)];

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            spreadsheet_id: spreadsheetId,
            range,
            status: 'updated',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [values] }),
      });

      if (!res.ok) {
        throw new ProviderError(`Sheets update_cell failed: ${await res.text()}`);
      }

      const data = await res.json();
      return {
        success: true,
        data: {
          spreadsheet_id: spreadsheetId,
          updatedRange: data.updatedRange,
          updatedCells: data.updatedCells,
          status: 'updated',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // --- 6. GOOGLE MEET TOOLS ---
    if (toolName === 'google_meet.create_space') {
      const summary = args.summary || 'VoicePilot Assistant Meeting';
      const startTimeIso = args.start_time || new Date().toISOString();
      const endTimeIso = args.end_time || new Date(Date.now() + 3600000).toISOString();

      if (accessToken?.startsWith('mock_')) {
        return {
          success: true,
          data: {
            meeting_link: 'https://meet.google.com/vp-call-demo',
            summary,
            start_time: startTimeIso,
            end_time: endTimeIso,
            status: 'created',
          },
          latencyMs: Date.now() - startTime,
        };
      }

      // Create Calendar Event with Google Meet conferenceData
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          description: 'Instant Google Meet space generated by VoicePilot',
          start: { dateTime: startTimeIso },
          end: { dateTime: endTimeIso },
          conferenceData: {
            createRequest: {
              requestId: `meet_vp_${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      });

      if (!res.ok) {
        throw new ProviderError(`Google Meet space creation failed: ${await res.text()}`);
      }

      const evtData = await res.json();
      const meetLink = evtData.hangoutLink || evtData.conferenceData?.entryPoints?.[0]?.uri || 'https://meet.google.com';

      return {
        success: true,
        data: {
          event_id: evtData.id,
          meeting_link: meetLink,
          summary: evtData.summary,
          start_time: startTimeIso,
          end_time: endTimeIso,
          status: 'created',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    throw new ProviderError(`Unknown tool '${toolName}' for Google Workspace connector`);
  }

  /**
   * Format standard MIME RFC 2822 raw message string.
   */
  private buildRfc2822Message(params: { to: string; subject: string; body: string; cc?: string }): string {
    const lines = [
      `To: ${params.to}`,
      ...(params.cc ? [`Cc: ${params.cc}`] : []),
      `Subject: ${params.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      params.body,
    ];
    return lines.join('\r\n');
  }
}
