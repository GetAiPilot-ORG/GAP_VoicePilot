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

export class NotionConnector extends BaseConnector {
  public readonly slug = 'notion';
  public readonly name = 'Notion Workspace';
  public readonly description = 'Search Notion workspace pages, read document content, create meeting notes, update pages, and append content blocks';
  public readonly authType: AuthType = 'oauth2';
  public readonly executionType: ExecutionType = 'native';

  private static readonly NOTION_API_VERSION = '2022-06-28';
  private static readonly DEFAULT_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize';

  public listTools(): ConnectorToolDefinition[] {
    return [
      {
        name: 'notion.search',
        connectorSlug: this.slug,
        description: 'Search Notion workspace pages and databases by title or query string',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for Notion pages' },
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
        name: 'notion.get_page',
        connectorSlug: this.slug,
        description: 'Retrieve page metadata and plain text content from a Notion page by ID',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: { type: 'string', description: 'Notion Page ID (32-char UUID string)' },
          },
          required: ['page_id'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'notion.create_page',
        connectorSlug: this.slug,
        description: 'Create a new Notion page inside a parent page or database (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            parent_id: { type: 'string', description: 'Parent Notion Page ID or Database ID' },
            parent_type: { type: 'string', description: 'Parent type (page_id or database_id)', default: 'page_id' },
            title: { type: 'string', description: 'Page Title' },
            content: { type: 'string', description: 'Plain text content body for the new page' },
          },
          required: ['parent_id', 'title'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'notion.update_page',
        connectorSlug: this.slug,
        description: 'Update page title or archive status of a Notion page (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: { type: 'string', description: 'Notion Page ID' },
            title: { type: 'string', description: 'New Page Title' },
            archived: { type: 'boolean', description: 'Archive or unarchive page' },
          },
          required: ['page_id'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'notion.append_blocks',
        connectorSlug: this.slug,
        description: 'Append text blocks, call notes, or paragraphs to an existing Notion page or block (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            block_id: { type: 'string', description: 'Target Notion Page ID or Block ID to append content to' },
            text: { type: 'string', description: 'Plain text content to append as a new paragraph block' },
          },
          required: ['block_id', 'text'],
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
    const config = ConnectorConfigManager.getNotionConfig();
    const clientId = config.clientId || 'mock_notion_client_id';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;
    const rawAuthBaseUrl = config.authBaseUrl || NotionConnector.DEFAULT_AUTH_URL;
    const cleanAuthBaseUrl = rawAuthBaseUrl.split('?')[0].trim();

    const url = new URL(cleanAuthBaseUrl);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('owner', 'user');
    url.searchParams.set('redirect_uri', effectiveRedirectUri);
    url.searchParams.set('state', state || '');

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
    const config = ConnectorConfigManager.getNotionConfig();
    const clientId = config.clientId || 'mock_notion_client_id';
    const clientSecret = config.clientSecret || 'mock_notion_client_secret';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;

    if (clientId === 'mock_notion_client_id' || code.startsWith('mock_') || code.startsWith('auth_code_')) {
      return {
        access_token: `secret_mock_notion_token_${Date.now()}`,
        workspace_id: 'ws_mock_notion_123',
        workspace_name: 'Acme VoicePilot Notion Workspace',
        bot_id: 'bot_mock_999',
        account_name: 'Acme VoicePilot Notion Workspace',
        account_email: 'workspace@notion-acme.com',
      };
    }

    try {
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const res = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Notion-Version': NotionConnector.NOTION_API_VERSION,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: effectiveRedirectUri,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.handleNotionHttpError(res.status, errText);
      }

      const data = await res.json();
      const resolvedEmail = data.owner?.user?.person?.email || 
        `${(data.workspace_name || 'notion').toLowerCase().replace(/\s+/g, '_')}@workspace.notion.so`;

      return {
        access_token: data.access_token,
        workspace_id: data.workspace_id,
        workspace_name: data.workspace_name || 'Notion Workspace',
        bot_id: data.bot_id,
        account_name: data.workspace_name || 'Notion Workspace',
        account_email: resolvedEmail,
        duplicated_template_id: data.duplicated_template_id || null,
      };
    } catch (err: any) {
      if (err instanceof ProviderError || err instanceof CredentialExpiredError) throw err;
      throw new ProviderError(`Notion OAuth callback failed: ${err.message}`);
    }
  }

  public async refreshCredentials(credentials: Record<string, any>): Promise<Record<string, any>> {
    // Notion access tokens are long-lived and do not require periodic refresh unless revoked
    return {
      ...credentials,
      refreshed_at: new Date().toISOString(),
    };
  }

  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const accessToken = credentials.access_token || credentials.raw_token;

    if (!accessToken) {
      return { healthy: false, status: 'error', message: 'No Notion access token present' };
    }

    if (String(accessToken).startsWith('secret_mock_') || String(accessToken).startsWith('mock_')) {
      return { healthy: true, status: 'connected', message: 'Mock Notion connector operational' };
    }

    try {
      const res = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Notion-Version': NotionConnector.NOTION_API_VERSION,
        },
      });

      if (!res.ok) {
        return { healthy: false, status: 'expired', message: `Notion health check failed with status ${res.status}` };
      }

      return { healthy: true, status: 'connected', message: 'Notion API connection active' };
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

    if (!accessToken) {
      throw new ProviderError('Missing access token in execution context for Notion connector');
    }

    // Tool 1: notion.search
    if (toolName === 'notion.search') {
      this.validateRequiredArgs(args, ['query']);
      const query = String(args.query).trim();
      const limit = Number(args.limit || 5);

      if (accessToken.startsWith('secret_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            count: 2,
            results: [
              {
                id: '5977307d-78b1-4112-a376-728b7e289d0b',
                object: 'page',
                title: `Meeting Notes: ${query}`,
                url: 'https://notion.so/mock-page-01',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: '8899aabb-ccdd-eeff-0011-223344556677',
                object: 'database',
                title: `Customer Leads DB: ${query}`,
                url: 'https://notion.so/mock-db-01',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const res = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Notion-Version': NotionConnector.NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          page_size: limit,
        }),
      });

      const rawData = await this.parseJsonResponse(res);
      const results = (rawData.results || []).map((item: any) => ({
        id: item.id,
        object: item.object,
        title: this.extractTitle(item),
        url: item.url || null,
        created_at: item.created_time || null,
        updated_at: item.last_edited_time || null,
      }));

      return {
        success: true,
        data: { count: results.length, results },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 2: notion.get_page
    if (toolName === 'notion.get_page') {
      this.validateRequiredArgs(args, ['page_id']);
      const pageId = String(args.page_id).trim();

      if (accessToken.startsWith('secret_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            id: pageId,
            title: 'Q3 Enterprise Call Logs & Notes',
            url: `https://notion.so/${pageId}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            plain_text_content: 'Lead expressed high intent for 50 voice seats. Action item: send custom quote.',
            properties: {
              Status: 'In Progress',
              Category: 'Voice Call Follow-up',
            },
          },
          latencyMs: Date.now() - startTime,
        };
      }

      // Fetch Page metadata
      const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Notion-Version': NotionConnector.NOTION_API_VERSION,
        },
      });

      const pageData = await this.parseJsonResponse(pageRes);
      const title = this.extractTitle(pageData);

      // Fetch Page Block Children for plain text body
      let plainTextContent = '';
      try {
        const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=50`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Notion-Version': NotionConnector.NOTION_API_VERSION,
          },
        });
        if (blocksRes.ok) {
          const blocksData = await blocksRes.json();
          plainTextContent = this.extractBlocksPlainText(blocksData.results || []);
        }
      } catch (e) {}

      return {
        success: true,
        data: {
          id: pageData.id,
          title,
          url: pageData.url || null,
          created_at: pageData.created_time || null,
          updated_at: pageData.last_edited_time || null,
          plain_text_content: plainTextContent || 'No text content',
          properties: this.extractCleanProperties(pageData.properties || {}),
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 3: notion.create_page
    if (toolName === 'notion.create_page') {
      this.validateRequiredArgs(args, ['parent_id', 'title']);
      const parentId = String(args.parent_id || args.parent_page_id).trim();
      const parentType = String(args.parent_type || (args.is_database ? 'database_id' : 'page_id')).trim();
      const title = String(args.title).trim();
      const content = args.content ? String(args.content).trim() : '';

      if (accessToken.startsWith('secret_mock_') || accessToken.startsWith('mock_')) {
        const mockPageId = `page_mock_${Date.now()}`;
        return {
          success: true,
          data: {
            success: true,
            page_id: mockPageId,
            title,
            url: `https://notion.so/${mockPageId}`,
            message: `Notion page '${title}' created successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const parentObj = parentType === 'database_id' ? { database_id: parentId } : { page_id: parentId };

      const bodyPayload: Record<string, any> = {
        parent: parentObj,
        properties: {
          title: {
            title: [{ text: { content: title } }],
          },
        },
      };

      if (content) {
        bodyPayload.children = [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content } }],
            },
          },
        ];
      }

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Notion-Version': NotionConnector.NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const pageData = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          success: true,
          page_id: pageData.id,
          title,
          url: pageData.url || null,
          message: `Notion page '${title}' created successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 4: notion.update_page
    if (toolName === 'notion.update_page') {
      this.validateRequiredArgs(args, ['page_id']);
      const pageId = String(args.page_id).trim();

      if (accessToken.startsWith('secret_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            success: true,
            page_id: pageId,
            title: args.title || 'Updated Page Title',
            archived: Boolean(args.archived),
            message: `Notion page '${pageId}' updated successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const updatePayload: Record<string, any> = {};

      if (args.title) {
        updatePayload.properties = {
          title: {
            title: [{ text: { content: String(args.title).trim() } }],
          },
        };
      }

      if (args.archived !== undefined) {
        updatePayload.archived = Boolean(args.archived);
      }

      const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Notion-Version': NotionConnector.NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const pageData = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          success: true,
          page_id: pageData.id,
          title: this.extractTitle(pageData),
          archived: Boolean(pageData.archived),
          message: `Notion page '${pageId}' updated successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 5: notion.append_blocks
    if (toolName === 'notion.append_blocks') {
      this.validateRequiredArgs(args, ['block_id', 'text']);
      const blockId = String(args.block_id).trim();
      const text = String(args.text).trim();

      if (accessToken.startsWith('secret_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            success: true,
            block_id: blockId,
            appended_count: 1,
            message: `Content appended to Notion block '${blockId}' successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const appendPayload = {
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: text } }],
            },
          },
        ],
      };

      const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Notion-Version': NotionConnector.NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appendPayload),
      });

      const blockData = await this.parseJsonResponse(res);
      return {
        success: true,
        data: {
          success: true,
          block_id: blockId,
          appended_count: (blockData.results || []).length || 1,
          message: `Content appended to Notion block '${blockId}' successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    throw new ProviderError(`Unknown tool '${toolName}' for Notion connector`);
  }

  private async parseJsonResponse(res: Response): Promise<any> {
    const text = await res.text();
    if (!res.ok) {
      this.handleNotionHttpError(res.status, text);
    }

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  private handleNotionHttpError(status: number, errorText: string): void {
    if (status === 429) {
      throw new ProviderError('Notion API rate limit exceeded. Please retry later.');
    }

    if (status === 401 || errorText.includes('unauthorized')) {
      throw new CredentialExpiredError('Notion access token is invalid or expired.');
    }

    let parsedMsg = errorText;
    try {
      const jsonObj = JSON.parse(errorText);
      if (jsonObj.message) {
        parsedMsg = `${jsonObj.code || 'ERROR'}: ${jsonObj.message}`;
      }
    } catch (e) {}

    throw new ProviderError(`Notion API error (${status}): ${parsedMsg}`);
  }

  private extractTitle(item: any): string {
    if (!item) return 'Untitled';
    if (item.title && Array.isArray(item.title) && item.title.length > 0) {
      return item.title.map((t: any) => t.plain_text || t.text?.content || '').join('');
    }

    const props = item.properties || {};
    for (const pVal of Object.values(props) as any[]) {
      if (pVal?.type === 'title' && Array.isArray(pVal.title) && pVal.title.length > 0) {
        return pVal.title.map((t: any) => t.plain_text || t.text?.content || '').join('');
      }
    }

    return 'Untitled';
  }

  private extractBlocksPlainText(blocks: any[]): string {
    const lines: string[] = [];
    for (const b of blocks) {
      const type = b.type;
      const contentObj = b[type];
      if (contentObj && Array.isArray(contentObj.rich_text)) {
        const textStr = contentObj.rich_text.map((rt: any) => rt.plain_text || rt.text?.content || '').join('');
        if (textStr) lines.push(textStr);
      }
    }
    return lines.join('\n');
  }

  private extractCleanProperties(props: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(props)) {
      if (val.type === 'select' && val.select) {
        clean[key] = val.select.name;
      } else if (val.type === 'multi_select' && Array.isArray(val.multi_select)) {
        clean[key] = val.multi_select.map((s: any) => s.name);
      } else if (val.type === 'rich_text' && Array.isArray(val.rich_text)) {
        clean[key] = val.rich_text.map((t: any) => t.plain_text || t.text?.content || '').join('');
      } else if (val.type === 'email') {
        clean[key] = val.email;
      } else if (val.type === 'phone_number') {
        clean[key] = val.phone_number;
      }
    }
    return clean;
  }
}
