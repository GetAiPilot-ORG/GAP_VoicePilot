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

export class LinearConnector extends BaseConnector {
  public readonly slug = 'linear';
  public readonly name = 'Linear Issue Tracker';
  public readonly description = 'Search issues, inspect tickets, create bug reports, update issues, add comments, and query teams via Linear GraphQL API';
  public readonly authType: AuthType = 'oauth2';
  public readonly executionType: ExecutionType = 'native';

  private static readonly SCOPES = ['read', 'write', 'issues:create', 'comments:create'];
  private static readonly DEFAULT_AUTH_URL = 'https://linear.app/oauth/authorize';
  private static readonly DEFAULT_TOKEN_URL = 'https://api.linear.app/oauth/token';
  private static readonly DEFAULT_GRAPHQL_URL = 'https://api.linear.app/graphql';

  public listTools(): ConnectorToolDefinition[] {
    return [
      {
        name: 'linear.search_issues',
        connectorSlug: this.slug,
        description: 'Search Linear issues by title, description query string, or team key',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term query string' },
            limit: { type: 'number', description: 'Maximum issues to return (default 5)', default: 5 },
          },
          required: ['query'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'linear.get_issue',
        connectorSlug: this.slug,
        description: 'Retrieve full issue details, status, priority, and assignee by Linear issue key (e.g. ENG-123) or UUID',
        inputSchema: {
          type: 'object',
          properties: {
            issue_id: { type: 'string', description: 'Linear Issue Key (e.g. ENG-123) or UUID' },
          },
          required: ['issue_id'],
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'linear.create_issue',
        connectorSlug: this.slug,
        description: 'Create a new Linear issue / ticket in a specific team (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Issue Title' },
            team_id: { type: 'string', description: 'Linear Team Key (e.g. ENG) or Team UUID' },
            description: { type: 'string', description: 'Issue Description body text' },
            priority: { type: 'number', description: 'Priority level (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)', default: 3 },
            project_id: { type: 'string', description: 'Optional Linear Project UUID' },
          },
          required: ['title', 'team_id'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'linear.update_issue',
        connectorSlug: this.slug,
        description: 'Update an existing Linear issue title, description, priority, or state (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            issue_id: { type: 'string', description: 'Linear Issue Key (e.g. ENG-123) or UUID' },
            title: { type: 'string', description: 'New Issue Title' },
            description: { type: 'string', description: 'New Issue Description' },
            priority: { type: 'number', description: 'Updated Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)' },
            state_id: { type: 'string', description: 'Target Workflow State UUID' },
          },
          required: ['issue_id'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'linear.add_comment',
        connectorSlug: this.slug,
        description: 'Add a comment or call note to an existing Linear issue (Requires User Confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            issue_id: { type: 'string', description: 'Linear Issue ID or key (e.g. ENG-123)' },
            comment_body: { type: 'string', description: 'Comment body or call transcript summary text' },
          },
          required: ['issue_id', 'comment_body'],
        },
        executionType: 'native',
        realtimeSuitability: false,
        timeoutMs: 10000,
        permissionCategory: 'write',
      },
      {
        name: 'linear.list_teams',
        connectorSlug: this.slug,
        description: 'List accessible Linear teams in the workspace',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'linear.list_projects',
        connectorSlug: this.slug,
        description: 'List active projects in the Linear workspace',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 6000,
        permissionCategory: 'read',
      },
      {
        name: 'linear.get_viewer',
        connectorSlug: this.slug,
        description: 'Get authenticated Linear user and workspace details',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        executionType: 'native',
        realtimeSuitability: true,
        timeoutMs: 5000,
        permissionCategory: 'read',
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
    const config = ConnectorConfigManager.getLinearConfig();
    const clientId = config.clientId || 'mock_linear_client_id';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;
    const rawAuthBaseUrl = config.authBaseUrl || LinearConnector.DEFAULT_AUTH_URL;
    const cleanAuthBaseUrl = rawAuthBaseUrl.split('?')[0].trim();

    const url = new URL(cleanAuthBaseUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', effectiveRedirectUri);
    url.searchParams.set('scope', LinearConnector.SCOPES.join(','));
    url.searchParams.set('state', state || '');
    url.searchParams.set('actor', 'user');

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
    const config = ConnectorConfigManager.getLinearConfig();
    const clientId = config.clientId || 'mock_linear_client_id';
    const clientSecret = config.clientSecret || 'mock_linear_client_secret';
    const effectiveRedirectUri = redirectUri || config.redirectUri!;
    const tokenUrl = config.tokenUrl || LinearConnector.DEFAULT_TOKEN_URL;

    if (clientId === 'mock_linear_client_id' || code.startsWith('lin_mock_') || code.startsWith('auth_code_')) {
      return {
        access_token: `lin_mock_access_token_${Date.now()}`,
        token_type: 'Bearer',
        expires_in: 31536000,
        account_name: 'VoicePilot Acme Linear Team',
        account_email: 'team@acme-linear.app',
        scopes: LinearConnector.SCOPES,
        organization_id: 'org_mock_linear_123',
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
        this.handleLinearHttpError(res.status, errText);
      }

      const data = await res.json();
      const accessToken = data.access_token;

      let accountName = 'Linear Workspace';
      let accountEmail = 'linear@workspace.app';
      let orgId: string | null = null;

      // Query Linear GraphQL viewer and organization
      try {
        const viewerData = await this.queryGraphQL(
          accessToken, 
          `query { viewer { id name email organization { id name urlKey } } }`, 
          {}
        );
        if (viewerData.viewer) {
          const v = viewerData.viewer;
          if (v.organization?.name) {
            accountName = `${v.organization.name} (${v.name || 'User'})`;
            orgId = v.organization.id;
          } else if (v.name) {
            accountName = v.name;
          }
          if (v.email) accountEmail = v.email;
        }
      } catch (e) {}

      return {
        access_token: accessToken,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 31536000,
        account_name: accountName,
        account_email: accountEmail,
        organization_id: orgId,
        scopes: data.scope ? String(data.scope).split(',') : LinearConnector.SCOPES,
      };
    } catch (err: any) {
      if (err instanceof ProviderError || err instanceof CredentialExpiredError) throw err;
      throw new ProviderError(`Linear OAuth callback failed: ${err.message}`);
    }
  }

  public async refreshCredentials(credentials: Record<string, any>): Promise<Record<string, any>> {
    // Linear OAuth access tokens do not expire by default unless revoked
    return {
      ...credentials,
      refreshed_at: new Date().toISOString(),
    };
  }

  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const accessToken = credentials.access_token || credentials.raw_token;

    if (!accessToken) {
      return { healthy: false, status: 'error', message: 'No Linear access token present' };
    }

    if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
      return { healthy: true, status: 'connected', message: 'Mock Linear connector operational' };
    }

    try {
      const query = `query { viewer { id name email } }`;
      const res = await fetch(LinearConnector.DEFAULT_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        return { healthy: false, status: 'expired', message: `Linear health check failed with status ${res.status}` };
      }

      return { healthy: true, status: 'connected', message: 'Linear GraphQL API connection active' };
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
      throw new ProviderError('Missing access token in execution context for Linear connector');
    }

    // Tool 1: linear.search_issues
    if (toolName === 'linear.search_issues') {
      this.validateRequiredArgs(args, ['query']);
      const queryStr = String(args.query).trim();
      const limit = Number(args.limit || 5);

      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            count: 2,
            issues: [
              {
                id: 'iss_mock_01',
                identifier: 'ENG-101',
                title: `Fix voice latency for query: ${queryStr}`,
                description: 'Customer reported minor echo on call.',
                priority: 2,
                state: 'In Progress',
                url: 'https://linear.app/acme/issue/ENG-101',
                created_at: new Date().toISOString(),
              },
              {
                id: 'iss_mock_02',
                identifier: 'ENG-102',
                title: `Add Hinglish assistant for: ${queryStr}`,
                description: 'Feature request from demo call.',
                priority: 3,
                state: 'Backlog',
                url: 'https://linear.app/acme/issue/ENG-102',
                created_at: new Date().toISOString(),
              },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const graphqlQuery = `
        query SearchIssues($term: String!, $first: Int) {
          issueSearch(query: $term, first: $first) {
            nodes {
              id
              identifier
              title
              description
              priority
              state { name }
              url
              createdAt
              team { key name }
            }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlQuery, { term: queryStr, first: limit });
      const nodes = data.issueSearch?.nodes || [];

      const issues = nodes.map((n: any) => ({
        id: n.id,
        identifier: n.identifier,
        title: n.title,
        description: n.description || '',
        priority: n.priority,
        state: n.state?.name || 'Open',
        url: n.url,
        created_at: n.createdAt,
        team: n.team ? { key: n.team.key, name: n.team.name } : null,
      }));

      return {
        success: true,
        data: { count: issues.length, issues },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 2: linear.get_issue
    if (toolName === 'linear.get_issue') {
      this.validateRequiredArgs(args, ['issue_id']);
      const issueId = String(args.issue_id).trim();

      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            id: issueId,
            identifier: issueId.includes('-') ? issueId : 'ENG-101',
            title: 'Voice AI Engine Performance Optimization',
            description: 'Refactor audio pipeline for sub-200ms response time.',
            priority: 1,
            state: 'In Progress',
            url: `https://linear.app/acme/issue/${issueId}`,
            created_at: new Date().toISOString(),
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const graphqlQuery = `
        query GetIssue($id: String!) {
          issue(id: $id) {
            id
            identifier
            title
            description
            priority
            state { name }
            url
            createdAt
            team { key name }
            assignee { name email }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlQuery, { id: issueId });
      const n = data.issue;

      if (!n) {
        throw new ProviderError(`Linear issue '${issueId}' not found`);
      }

      return {
        success: true,
        data: {
          id: n.id,
          identifier: n.identifier,
          title: n.title,
          description: n.description || '',
          priority: n.priority,
          state: n.state?.name || 'Open',
          url: n.url,
          created_at: n.createdAt,
          team: n.team ? { key: n.team.key, name: n.team.name } : null,
          assignee: n.assignee ? { name: n.assignee.name, email: n.assignee.email } : null,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 3: linear.create_issue
    if (toolName === 'linear.create_issue') {
      this.validateRequiredArgs(args, ['team_id', 'title']);
      const teamId = String(args.team_id).trim();
      const title = String(args.title).trim();
      const description = args.description ? String(args.description).trim() : '';
      const priority = Number(args.priority ?? 3);
      const projectId = args.project_id ? String(args.project_id).trim() : undefined;

      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        const mockId = `iss_mock_${Date.now()}`;
        return {
          success: true,
          data: {
            success: true,
            issue_id: mockId,
            identifier: `ENG-${Math.floor(Math.random() * 900 + 100)}`,
            title,
            url: `https://linear.app/acme/issue/${mockId}`,
            message: `Linear issue '${title}' created successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const graphqlMutation = `
        mutation CreateIssue($teamId: String!, $title: String!, $description: String, $priority: Int, $projectId: String) {
          issueCreate(input: { teamId: $teamId, title: $title, description: $description, priority: $priority, projectId: $projectId }) {
            success
            issue {
              id
              identifier
              title
              url
            }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlMutation, {
        teamId,
        title,
        description,
        priority,
        projectId,
      });

      const res = data.issueCreate;
      if (!res?.success || !res.issue) {
        throw new ProviderError('Linear issue creation failed');
      }

      return {
        success: true,
        data: {
          success: true,
          issue_id: res.issue.id,
          identifier: res.issue.identifier,
          title: res.issue.title,
          url: res.issue.url,
          message: `Linear issue '${res.issue.identifier}' created successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 4: linear.update_issue
    if (toolName === 'linear.update_issue') {
      this.validateRequiredArgs(args, ['issue_id']);
      const issueId = String(args.issue_id).trim();

      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            success: true,
            issue_id: issueId,
            title: args.title || 'Updated Title',
            message: `Linear issue '${issueId}' updated successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const inputPayload: Record<string, any> = {};
      if (args.title) inputPayload.title = String(args.title).trim();
      if (args.description) inputPayload.description = String(args.description).trim();
      if (args.priority !== undefined) inputPayload.priority = Number(args.priority);
      if (args.state_id) inputPayload.stateId = String(args.state_id).trim();

      const graphqlMutation = `
        mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) {
            success
            issue {
              id
              identifier
              title
              url
              state { name }
            }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlMutation, {
        id: issueId,
        input: inputPayload,
      });

      const res = data.issueUpdate;
      if (!res?.success || !res.issue) {
        throw new ProviderError(`Linear issue '${issueId}' update failed`);
      }

      return {
        success: true,
        data: {
          success: true,
          issue_id: res.issue.id,
          identifier: res.issue.identifier,
          title: res.issue.title,
          url: res.issue.url,
          state: res.issue.state?.name,
          message: `Linear issue '${res.issue.identifier}' updated successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 5: linear.add_comment
    if (toolName === 'linear.add_comment') {
      this.validateRequiredArgs(args, ['issue_id', 'comment_body']);
      const issueId = String(args.issue_id).trim();
      const commentBody = String(args.comment_body).trim();

      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        const mockCommentId = `cmt_mock_${Date.now()}`;
        return {
          success: true,
          data: {
            success: true,
            comment_id: mockCommentId,
            issue_id: issueId,
            body: commentBody,
            message: `Comment added to Linear issue '${issueId}' successfully`,
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const graphqlMutation = `
        mutation AddComment($issueId: String!, $body: String!) {
          commentCreate(input: { issueId: $issueId, body: $body }) {
            success
            comment {
              id
              body
              createdAt
              url
            }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlMutation, {
        issueId,
        body: commentBody,
      });

      const res = data.commentCreate;
      if (!res?.success || !res.comment) {
        throw new ProviderError('Linear comment creation failed');
      }

      return {
        success: true,
        data: {
          success: true,
          comment_id: res.comment.id,
          issue_id: issueId,
          body: res.comment.body,
          url: res.comment.url,
          message: `Comment added to Linear issue '${issueId}' successfully`,
        },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 6: linear.list_teams
    if (toolName === 'linear.list_teams') {
      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            count: 2,
            teams: [
              { id: 'team_eng_1', key: 'ENG', name: 'Engineering' },
              { id: 'team_sup_2', key: 'SUP', name: 'Customer Support' },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const graphqlQuery = `
        query ListTeams {
          teams {
            nodes {
              id
              key
              name
              description
            }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlQuery, {});
      const teams = (data.teams?.nodes || []).map((t: any) => ({
        id: t.id,
        key: t.key,
        name: t.name,
        description: t.description || '',
      }));

      return {
        success: true,
        data: { count: teams.length, teams },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 7: linear.list_projects
    if (toolName === 'linear.list_projects') {
      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            count: 2,
            projects: [
              { id: 'proj_voice_1', name: 'Voice AI Telephony 2.0', state: 'started', description: 'Voice engine' },
              { id: 'proj_crm_2', name: 'CRM Integrations', state: 'planned', description: 'OAuth connectors' },
            ],
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const graphqlQuery = `
        query ListProjects {
          projects {
            nodes {
              id
              name
              state
              description
            }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlQuery, {});
      const projects = (data.projects?.nodes || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        state: p.state,
        description: p.description || '',
      }));

      return {
        success: true,
        data: { count: projects.length, projects },
        latencyMs: Date.now() - startTime,
      };
    }

    // Tool 8: linear.get_viewer
    if (toolName === 'linear.get_viewer') {
      if (accessToken.startsWith('lin_mock_') || accessToken.startsWith('mock_')) {
        return {
          success: true,
          data: {
            id: 'usr_linear_mock',
            name: 'Linear Lead Developer',
            email: 'dev@voicepilot.ai',
            organization: {
              id: 'org_mock_123',
              name: 'Acme VoicePilot',
              urlKey: 'acme-vp',
            },
          },
          latencyMs: Date.now() - startTime,
        };
      }

      const graphqlQuery = `
        query GetViewer {
          viewer {
            id
            name
            email
            organization {
              id
              name
              urlKey
            }
          }
        }
      `;

      const data = await this.queryGraphQL(accessToken, graphqlQuery, {});
      return {
        success: true,
        data: data.viewer || {},
        latencyMs: Date.now() - startTime,
      };
    }

    throw new ProviderError(`Unknown tool '${toolName}' for Linear connector`);
  }

  private async queryGraphQL(accessToken: string, query: string, variables: Record<string, any>): Promise<any> {
    const config = ConnectorConfigManager.getLinearConfig();
    const apiUrl = config.apiUrl || LinearConnector.DEFAULT_GRAPHQL_URL;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const errText = await res.text();
      this.handleLinearHttpError(res.status, errText);
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      const errMsg = json.errors.map((e: any) => e.message).join('; ');
      throw new ProviderError(`Linear GraphQL error: ${errMsg}`);
    }

    return json.data || {};
  }

  private handleLinearHttpError(status: number, errorText: string): void {
    if (status === 429) {
      throw new ProviderError('Linear API rate limit exceeded. Please retry later.');
    }

    if (status === 401 || errorText.includes('AUTHENTICATION_ERROR')) {
      throw new CredentialExpiredError('Linear access token is invalid or expired.');
    }

    throw new ProviderError(`Linear API error (${status}): ${errorText}`);
  }
}
