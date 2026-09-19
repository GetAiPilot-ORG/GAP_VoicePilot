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

export class SalesforceConnector extends BaseConnector {
  public readonly slug = 'salesforce';
  public readonly name = 'Salesforce CRM';
  public readonly description = 'Search contacts and leads, create records, update prospects, log call tasks, and create notes in Salesforce CRM';
  public readonly authType: AuthType = 'oauth2';
  public readonly executionType: ExecutionType = 'native';

  private static readonly SCOPES = ['api', 'refresh_token', 'offline_access', 'id'];
  private static readonly API_VERSION = 'v60.0';
  private static readonly DEFAULT_AUTH_URL = 'https://login.salesforce.com/services/oauth2/authorize';
  private static readonly DEFAULT_TOKEN_URL = 'https://login.salesforce.com/services/oauth2/token';

  public listTools(): ConnectorToolDefinition[] {
    return [
      {
        name: 'salesforce.search_contacts',
        connectorSlug: this.slug,
        description: 'Search Salesforce Contacts by name, email, or phone number',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for contact name, email, or phone number' },
            limit: { type: 'number', description: 'Maximum records to return (default 5)', default: 5 },
          },
          required: ['query'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'salesforce.get_contact',
        connectorSlug: this.slug,
        description: 'Retrieve detailed profile and field values for a specific Salesforce Contact by ID',
        inputSchema: {
          type: 'object',
          properties: {
            contact_id: { type: 'string', description: 'Salesforce Contact Record ID (15 or 18 character ID)' },
          },
          required: ['contact_id'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'salesforce.create_contact',
        connectorSlug: this.slug,
        description: 'Create a new Contact record in Salesforce CRM (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            last_name: { type: 'string', description: 'Contact Last Name' },
            first_name: { type: 'string', description: 'Contact First Name' },
            email: { type: 'string', description: 'Contact Email Address' },
            phone: { type: 'string', description: 'Contact Phone Number' },
            title: { type: 'string', description: 'Job Title' },
            account_id: { type: 'string', description: 'Associated Salesforce Account ID' },
            description: { type: 'string', description: 'Background info or notes' },
          },
          required: ['last_name'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'salesforce.update_contact',
        connectorSlug: this.slug,
        description: 'Update an existing Contact record in Salesforce CRM (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            contact_id: { type: 'string', description: 'Salesforce Contact Record ID' },
            first_name: { type: 'string', description: 'Updated First Name' },
            last_name: { type: 'string', description: 'Updated Last Name' },
            email: { type: 'string', description: 'Updated Email Address' },
            phone: { type: 'string', description: 'Updated Phone Number' },
            title: { type: 'string', description: 'Updated Job Title' },
            description: { type: 'string', description: 'Updated notes' },
          },
          required: ['contact_id'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'salesforce.search_leads',
        connectorSlug: this.slug,
        description: 'Search Salesforce Leads by name, email, company, or phone number',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for lead name, email, company, or phone' },
            limit: { type: 'number', description: 'Maximum records to return (default 5)', default: 5 },
          },
          required: ['query'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'salesforce.create_lead',
        connectorSlug: this.slug,
        description: 'Create a new Lead record in Salesforce CRM (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            last_name: { type: 'string', description: 'Lead Last Name' },
            company: { type: 'string', description: 'Company Name' },
            first_name: { type: 'string', description: 'Lead First Name' },
            email: { type: 'string', description: 'Email Address' },
            phone: { type: 'string', description: 'Phone Number' },
            description: { type: 'string', description: 'Call notes summary' },
            lead_source: { type: 'string', description: 'Lead Source (default: VoicePilot Call)', default: 'VoicePilot Call' },
          },
          required: ['last_name', 'company'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'salesforce.update_lead',
        connectorSlug: this.slug,
        description: 'Update an existing Lead record in Salesforce CRM (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            lead_id: { type: 'string', description: 'Salesforce Lead Record ID' },
            status: { type: 'string', description: 'Lead status (e.g. Working - Contacted, Qualified, Closed)' },
            rating: { type: 'string', description: 'Lead rating (e.g. Hot, Warm, Cold)' },
            description: { type: 'string', description: 'Updated call summary notes' },
            email: { type: 'string', description: 'Updated email address' },
            phone: { type: 'string', description: 'Updated phone number' },
          },
          required: ['lead_id'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'salesforce.create_task',
        connectorSlug: this.slug,
        description: 'Create an activity Task or call log note associated with a Contact, Lead, or Account (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            subject: { type: 'string', description: 'Task Subject line (e.g. Voice Call with Customer)' },
            description: { type: 'string', description: 'Call summary, transcript, or task details' },
            who_id: { type: 'string', description: 'Salesforce Contact or Lead ID' },
            what_id: { type: 'string', description: 'Salesforce Account or Opportunity ID' },
            status: { type: 'string', description: 'Task Status (default: Completed)', default: 'Completed' },
            call_duration_seconds: { type: 'number', description: 'Call duration in seconds' },
            call_disposition: { type: 'string', description: 'Call outcome disposition (e.g. Interested, Follow-up Needed)' },
          },
          required: ['subject', 'description'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'salesforce.create_note',
        connectorSlug: this.slug,
        description: 'Create a Note record attached to a Salesforce Contact, Lead, or Account (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            parent_id: { type: 'string', description: 'Salesforce Parent Record ID (Contact, Lead, Account)' },
            title: { type: 'string', description: 'Note Title' },
            body: { type: 'string', description: 'Note text content body' },
          },
          required: ['parent_id', 'title', 'body'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
    ];
  }

  public async getAuthorizationUrl(
    workspaceId: string, 
    redirectUri: string, 
    state?: string,
    options?: {
      codeChallenge?: string;
      codeChallengeMethod?: string;
      [key: string]: any;
    }
  ): Promise<string> {
    const config = ConnectorConfigManager.getSalesforceConfig();
    const clientId = config.clientId || 'mock_salesforce_client_id';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;
    const rawAuthBaseUrl = config.authBaseUrl || SalesforceConnector.DEFAULT_AUTH_URL;
    const cleanAuthBaseUrl = rawAuthBaseUrl.split('?')[0].trim();

    const url = new URL(cleanAuthBaseUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', effectiveRedirectUri);
    url.searchParams.set('scope', SalesforceConnector.SCOPES.join(' '));
    url.searchParams.set('state', state || '');

    // PKCE parameters for External Client Apps
    if (options?.codeChallenge) {
      url.searchParams.set('code_challenge', options.codeChallenge);
      url.searchParams.set('code_challenge_method', options.codeChallengeMethod || 'S256');
    }

    return url.toString();
  }

  public async handleCallback(
    workspaceId: string, 
    code: string, 
    redirectUri: string,
    options?: {
      codeVerifier?: string | null;
      [key: string]: any;
    }
  ): Promise<Record<string, any>> {
    const config = ConnectorConfigManager.getSalesforceConfig();
    const clientId = config.clientId || 'mock_salesforce_client_id';
    const clientSecret = config.clientSecret || 'mock_salesforce_client_secret';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;
    const tokenUrl = process.env.SALESFORCE_TOKEN_URL || SalesforceConnector.DEFAULT_TOKEN_URL;

    if (clientId === 'mock_salesforce_client_id' || code.startsWith('sf_mock_') || code.startsWith('auth_code_')) {
      return {
        access_token: `sf_mock_access_token_${Date.now()}`,
        refresh_token: `sf_mock_refresh_token_${Date.now()}`,
        instance_url: 'https://mock-instance.my.salesforce.com',
        token_type: 'Bearer',
        expires_in: 7200,
        account_name: 'VoicePilot Acme Salesforce Org',
        account_email: 'admin@acme-salesforce.com',
        scopes: SalesforceConnector.SCOPES,
        code_verifier_used: options?.codeVerifier ? true : false,
      };
    }

    try {
      const bodyParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: effectiveRedirectUri,
      });

      // Pass matching PKCE code_verifier for External Client Apps
      if (options?.codeVerifier) {
        bodyParams.set('code_verifier', options.codeVerifier);
      }

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams,
      });

      if (!res.ok) {
        const errText = await res.text();
        this.handleSalesforceHttpError(res.status, errText);
      }

      const data = await res.json();
      let accountName = 'Salesforce Organization';
      let accountEmail = 'salesforce@org.com';

      // Query User Identity endpoint if identity URL is provided
      if (data.id && data.access_token) {
        try {
          const idRes = await fetch(data.id, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
          if (idRes.ok) {
            const idData = await idRes.json();
            if (idData.display_name) accountName = idData.display_name;
            else if (idData.username) accountName = idData.username;
            if (idData.email) accountEmail = idData.email;
            else if (idData.username && idData.username.includes('@')) accountEmail = idData.username;
          }
        } catch (e) {}
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        instance_url: data.instance_url,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 7200,
        id_url: data.id,
        account_name: accountName,
        account_email: accountEmail,
        scopes: SalesforceConnector.SCOPES,
      };
    } catch (err: any) {
      if (err instanceof ProviderError || err instanceof CredentialExpiredError) throw err;
      throw new ProviderError(`Salesforce OAuth callback failed: ${err.message}`);
    }
  }

  public async refreshCredentials(credentials: Record<string, any>): Promise<Record<string, any>> {
    const refreshToken = credentials.refresh_token;
    if (!refreshToken) {
      throw new CredentialExpiredError('Missing refresh_token for Salesforce credential refresh');
    }

    const config = ConnectorConfigManager.getSalesforceConfig();
    const clientId = config.clientId || 'mock_salesforce_client_id';
    const clientSecret = config.clientSecret || 'mock_salesforce_client_secret';
    const tokenUrl = process.env.SALESFORCE_TOKEN_URL || SalesforceConnector.DEFAULT_TOKEN_URL;

    if (clientId === 'mock_salesforce_client_id' || credentials.access_token?.startsWith('sf_mock_')) {
      const rotatedRefreshToken = credentials.simulate_rotation 
        ? `sf_mock_rotated_refresh_token_${Date.now()}` 
        : (credentials.new_mock_refresh_token || refreshToken);

      return {
        ...credentials,
        access_token: `sf_mock_refreshed_access_token_${Date.now()}`,
        refresh_token: rotatedRefreshToken,
        instance_url: credentials.instance_url || 'https://mock-instance.my.salesforce.com',
        expires_in: 7200,
      };
    }

    try {
      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.handleSalesforceHttpError(res.status, errText);
      }

      const data = await res.json();
      // Salesforce Refresh Token Rotation: if Salesforce returns a new refresh_token, atomically replace it; otherwise preserve existing
      const effectiveRefreshToken = data.refresh_token || refreshToken;

      return {
        ...credentials,
        access_token: data.access_token,
        refresh_token: effectiveRefreshToken,
        instance_url: data.instance_url || credentials.instance_url,
        expires_in: data.expires_in || 7200,
      };
    } catch (err: any) {
      if (err instanceof ProviderError || err instanceof CredentialExpiredError) throw err;
      throw new CredentialExpiredError(`Salesforce token refresh failed: ${err.message}`);
    }
  }

  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const accessToken = credentials.access_token;
    const instanceUrl = credentials.instance_url || 'https://login.salesforce.com';

    if (!accessToken) {
      return { healthy: false, status: 'error', message: 'No Salesforce access token present' };
    }

    if (accessToken.startsWith('sf_mock_')) {
      return { healthy: true, status: 'connected', message: 'Mock Salesforce connector operational' };
    }

    try {
      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/limits`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        return { healthy: false, status: 'expired', message: `Salesforce health check failed with status ${res.status}` };
      }

      return { healthy: true, status: 'connected', message: 'Salesforce REST API connection active' };
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
    const accessToken = context.credentials.access_token;
    const instanceUrl = context.credentials.instance_url || 'https://mock-instance.my.salesforce.com';

    if (!accessToken) {
      throw new ProviderError('Missing access token in execution context for Salesforce connector');
    }

    // Tool 1: salesforce.search_contacts (also alias salesforce.search_contact)
    if (toolName === 'salesforce.search_contacts' || toolName === 'salesforce.search_contact') {
      this.validateRequiredArgs(args, ['query']);
      const queryStr = String(args.query).trim();
      const limit = Number(args.limit || 5);

      if (accessToken.startsWith('sf_mock_')) {
        return {
          success: true,
          data: {
            count: 1,
            contacts: [
              {
                id: '003mockContact001',
                name: 'Sarah Connor',
                email: queryStr.includes('@') ? queryStr : 'sarah.connor@acme.com',
                phone: '+15551234567',
                title: 'VP of Engineering',
                account_id: '001mockAccount001',
                created_at: new Date().toISOString(),
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const escapedQuery = queryStr.replace(/'/g, "\\'");
      const soql = `SELECT Id, FirstName, LastName, Email, Phone, Title, AccountId, CreatedDate FROM Contact WHERE Email = '${escapedQuery}' OR Name LIKE '%${escapedQuery}%' OR Phone LIKE '%${escapedQuery}%' LIMIT ${limit}`;

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/query?q=${encodeURIComponent(soql)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const rawData = await this.parseJsonResponse(res);
      const records = rawData.records || [];
      const contacts = records.map((r: any) => ({
        id: r.Id,
        name: [r.FirstName, r.LastName].filter(Boolean).join(' ') || 'Contact',
        email: r.Email || null,
        phone: r.Phone || null,
        title: r.Title || null,
        account_id: r.AccountId || null,
        created_at: r.CreatedDate || null,
      }));

      return {
        success: true,
        data: { count: contacts.length, contacts },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 2: salesforce.get_contact
    if (toolName === 'salesforce.get_contact') {
      this.validateRequiredArgs(args, ['contact_id']);
      const contactId = String(args.contact_id || args.record_id).trim();

      if (accessToken.startsWith('sf_mock_')) {
        return {
          success: true,
          data: {
            id: contactId,
            first_name: 'Sarah',
            last_name: 'Connor',
            name: 'Sarah Connor',
            email: 'sarah.connor@acme.com',
            phone: '+15551234567',
            title: 'VP of Engineering',
            account_id: '001mockAccount001',
            department: 'Engineering',
            created_at: new Date().toISOString(),
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/sobjects/Contact/${contactId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const r = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          id: r.Id,
          first_name: r.FirstName || null,
          last_name: r.LastName || null,
          name: [r.FirstName, r.LastName].filter(Boolean).join(' ') || 'Contact',
          email: r.Email || null,
          phone: r.Phone || null,
          title: r.Title || null,
          account_id: r.AccountId || null,
          department: r.Department || null,
          created_at: r.CreatedDate || null,
          updated_at: r.LastModifiedDate || null,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 3: salesforce.create_contact
    if (toolName === 'salesforce.create_contact') {
      this.validateRequiredArgs(args, ['last_name']);
      const lastName = String(args.last_name).trim();

      if (accessToken.startsWith('sf_mock_')) {
        const mockContactId = `003mockContact${Date.now().toString().slice(-6)}`;
        return {
          success: true,
          data: {
            success: true,
            contact_id: mockContactId,
            name: [args.first_name, lastName].filter(Boolean).join(' '),
            email: args.email || null,
            phone: args.phone || null,
            message: `Salesforce Contact '${lastName}' created successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const payload: Record<string, any> = { LastName: lastName };
      if (args.first_name) payload.FirstName = String(args.first_name).trim();
      if (args.email) payload.Email = String(args.email).trim();
      if (args.phone) payload.Phone = String(args.phone).trim();
      if (args.title) payload.Title = String(args.title).trim();
      if (args.account_id) payload.AccountId = String(args.account_id).trim();
      if (args.description) payload.Description = String(args.description).trim();

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/sobjects/Contact`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const r = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          success: true,
          contact_id: r.id,
          name: [args.first_name, lastName].filter(Boolean).join(' '),
          message: `Salesforce Contact '${lastName}' created successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 4: salesforce.update_contact
    if (toolName === 'salesforce.update_contact') {
      this.validateRequiredArgs(args, ['contact_id']);
      const contactId = String(args.contact_id).trim();

      if (accessToken.startsWith('sf_mock_')) {
        return {
          success: true,
          data: {
            success: true,
            contact_id: contactId,
            updated_fields: Object.keys(args).filter((k) => k !== 'contact_id'),
            message: `Salesforce Contact '${contactId}' updated successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const updatePayload: Record<string, any> = {};
      if (args.first_name) updatePayload.FirstName = String(args.first_name).trim();
      if (args.last_name) updatePayload.LastName = String(args.last_name).trim();
      if (args.email) updatePayload.Email = String(args.email).trim();
      if (args.phone) updatePayload.Phone = String(args.phone).trim();
      if (args.title) updatePayload.Title = String(args.title).trim();
      if (args.description) updatePayload.Description = String(args.description).trim();

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/sobjects/Contact/${contactId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok && res.status !== 204) {
        const errText = await res.text();
        this.handleSalesforceHttpError(res.status, errText);
      }

      return {
        success: true,
        data: {
          success: true,
          contact_id: contactId,
          updated_fields: Object.keys(updatePayload),
          message: `Salesforce Contact '${contactId}' updated successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 5: salesforce.search_leads
    if (toolName === 'salesforce.search_leads') {
      this.validateRequiredArgs(args, ['query']);
      const queryStr = String(args.query).trim();
      const limit = Number(args.limit || 5);

      if (accessToken.startsWith('sf_mock_')) {
        return {
          success: true,
          data: {
            count: 1,
            leads: [
              {
                id: '00QmockLead001',
                name: 'John Connor',
                company: 'Cyberdyne Systems',
                email: queryStr.includes('@') ? queryStr : 'john@cyberdyne.com',
                phone: '+15559876543',
                status: 'Open - Not Contacted',
                created_at: new Date().toISOString(),
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const escapedQuery = queryStr.replace(/'/g, "\\'");
      const soql = `SELECT Id, FirstName, LastName, Company, Email, Phone, Status, CreatedDate FROM Lead WHERE Email = '${escapedQuery}' OR Name LIKE '%${escapedQuery}%' OR Company LIKE '%${escapedQuery}%' OR Phone LIKE '%${escapedQuery}%' LIMIT ${limit}`;

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/query?q=${encodeURIComponent(soql)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const rawData = await this.parseJsonResponse(res);
      const records = rawData.records || [];
      const leads = records.map((r: any) => ({
        id: r.Id,
        name: [r.FirstName, r.LastName].filter(Boolean).join(' ') || 'Lead',
        company: r.Company || null,
        email: r.Email || null,
        phone: r.Phone || null,
        status: r.Status || null,
        created_at: r.CreatedDate || null,
      }));

      return {
        success: true,
        data: { count: leads.length, leads },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 6: salesforce.create_lead
    if (toolName === 'salesforce.create_lead') {
      this.validateRequiredArgs(args, ['last_name', 'company']);
      const lastName = String(args.last_name).trim();
      const company = String(args.company).trim();

      if (accessToken.startsWith('sf_mock_')) {
        const mockLeadId = `00QmockLead${Date.now().toString().slice(-6)}`;
        return {
          success: true,
          data: {
            success: true,
            lead_id: mockLeadId,
            name: [args.first_name, lastName].filter(Boolean).join(' '),
            company,
            email: args.email || null,
            status: 'Open - Not Contacted',
            message: `Salesforce Lead '${lastName}' created successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const leadPayload: Record<string, any> = {
        LastName: lastName,
        Company: company,
      };
      if (args.first_name) leadPayload.FirstName = String(args.first_name).trim();
      if (args.email) leadPayload.Email = String(args.email).trim();
      if (args.phone) leadPayload.Phone = String(args.phone).trim();
      if (args.lead_source) leadPayload.LeadSource = String(args.lead_source).trim();
      if (args.description) leadPayload.Description = String(args.description).trim();

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/sobjects/Lead`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      });

      const r = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          success: true,
          lead_id: r.id,
          name: [args.first_name, lastName].filter(Boolean).join(' '),
          company,
          email: args.email || null,
          message: `Salesforce Lead '${lastName}' created successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 7: salesforce.update_lead
    if (toolName === 'salesforce.update_lead') {
      this.validateRequiredArgs(args, ['lead_id']);
      const leadId = String(args.lead_id).trim();

      if (accessToken.startsWith('sf_mock_')) {
        return {
          success: true,
          data: {
            success: true,
            lead_id: leadId,
            updated_fields: Object.keys(args).filter((k) => k !== 'lead_id'),
            message: `Salesforce Lead '${leadId}' updated successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const updatePayload: Record<string, any> = {};
      if (args.status) updatePayload.Status = String(args.status).trim();
      if (args.rating) updatePayload.Rating = String(args.rating).trim();
      if (args.description) updatePayload.Description = String(args.description).trim();
      if (args.email) updatePayload.Email = String(args.email).trim();
      if (args.phone) updatePayload.Phone = String(args.phone).trim();

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/sobjects/Lead/${leadId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok && res.status !== 204) {
        const errText = await res.text();
        this.handleSalesforceHttpError(res.status, errText);
      }

      return {
        success: true,
        data: {
          success: true,
          lead_id: leadId,
          updated_fields: Object.keys(updatePayload),
          message: `Salesforce Lead '${leadId}' updated successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 8: salesforce.create_task (also alias salesforce.add_call_note)
    if (toolName === 'salesforce.create_task' || toolName === 'salesforce.add_call_note') {
      this.validateRequiredArgs(args, ['subject', 'description']);
      const subject = String(args.subject).trim();
      const description = String(args.description).trim();

      if (accessToken.startsWith('sf_mock_')) {
        const mockTaskId = `00TmockTask${Date.now().toString().slice(-6)}`;
        return {
          success: true,
          data: {
            success: true,
            task_id: mockTaskId,
            subject,
            status: args.status || 'Completed',
            message: `Salesforce Task '${subject}' created successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const taskPayload: Record<string, any> = {
        Subject: subject,
        Description: description,
        Status: args.status || 'Completed',
        TaskSubtype: 'Call',
      };

      if (args.who_id) taskPayload.WhoId = String(args.who_id).trim();
      if (args.what_id) taskPayload.WhatId = String(args.what_id).trim();
      if (args.call_duration_seconds) taskPayload.CallDurationInSeconds = Number(args.call_duration_seconds);
      if (args.call_disposition) taskPayload.CallDisposition = String(args.call_disposition).trim();

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/sobjects/Task`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskPayload),
      });

      const r = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          success: true,
          task_id: r.id,
          subject,
          status: taskPayload.Status,
          message: `Salesforce Task '${subject}' created successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 9: salesforce.create_note
    if (toolName === 'salesforce.create_note') {
      this.validateRequiredArgs(args, ['parent_id', 'title', 'body']);
      const parentId = String(args.parent_id).trim();
      const title = String(args.title).trim();
      const body = String(args.body).trim();

      if (accessToken.startsWith('sf_mock_')) {
        const mockNoteId = `002mockNote${Date.now().toString().slice(-6)}`;
        return {
          success: true,
          data: {
            success: true,
            note_id: mockNoteId,
            parent_id: parentId,
            title,
            message: `Salesforce Note '${title}' created successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      // Create Note sObject linked to ParentId
      const notePayload = {
        ParentId: parentId,
        Title: title,
        Body: body,
      };

      const res = await fetch(`${instanceUrl}/services/data/${SalesforceConnector.API_VERSION}/sobjects/Note`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notePayload),
      });

      const r = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          success: true,
          note_id: r.id,
          parent_id: parentId,
          title,
          message: `Salesforce Note '${title}' created successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    throw new ProviderError(`Unknown tool '${toolName}' for Salesforce connector`);
  }

  private async parseJsonResponse(res: Response): Promise<any> {
    const text = await res.text();
    if (!res.ok) {
      this.handleSalesforceHttpError(res.status, text);
    }

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  private handleSalesforceHttpError(status: number, errorText: string): void {
    if (status === 429 || errorText.includes('REQUEST_LIMIT_EXCEEDED')) {
      throw new ProviderError('Salesforce API rate limit exceeded. Please retry later.');
    }

    if (status === 401 || errorText.includes('INVALID_SESSION_ID') || errorText.includes('Session expired')) {
      throw new CredentialExpiredError('Salesforce access token is invalid or expired.');
    }

    let parsedMsg = errorText;
    try {
      const jsonArr = JSON.parse(errorText);
      if (Array.isArray(jsonArr) && jsonArr.length > 0) {
        parsedMsg = jsonArr.map((e: any) => `${e.errorCode || 'ERROR'}: ${e.message}`).join('; ');
      } else if (jsonArr.message) {
        parsedMsg = jsonArr.message;
      }
    } catch (e) {}

    throw new ProviderError(`Salesforce API error (${status}): ${parsedMsg}`);
  }
}
