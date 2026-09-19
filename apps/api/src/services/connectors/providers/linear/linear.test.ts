import assert from 'assert';
import { LinearConnector } from './LinearConnector';
import { OAuthStateManager, OAuthStateInvalidError, OAuthStateExpiredError } from '../../core/OAuthStateManager';
import { CredentialManager } from '../../core/CredentialManager';
import { CredentialVault } from '../../core/CredentialVault';
import { ConnectorRegistry } from '../../core/ConnectorRegistry';
import { SlackConnector } from '../slack/SlackConnector';
import { GmailConnector } from '../gmail/GmailConnector';
import { HubSpotConnector } from '../hubspot/HubSpotConnector';
import { NotionConnector } from '../notion/NotionConnector';
import { SalesforceConnector } from '../salesforce/SalesforceConnector';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING LINEAR ISSUE TRACKER CONNECTOR TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`  ✓ ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  ✗ ${name}:`, err.message);
            throw err;
          });
      } else {
        console.log(`  ✓ ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  ✗ ${name}:`, err.message);
      throw err;
    }
  }

  // 1. Authorization URL Generation
  await test('1. Linear authorization URL includes client_id, redirect_uri, response_type=code, scope, state, and actor=user (no deprecated actor=application)', async () => {
    const connector = new LinearConnector();
    const pkce = OAuthStateManager.generatePKCE();
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_linear_test',
      providerSlug: 'linear',
      userId: 'user_linear_1',
      codeVerifier: pkce.codeVerifier,
    });

    const authUrl = await connector.getAuthorizationUrl(
      'ws_linear_test',
      'http://localhost:8000/api/v1/connectors/linear/callback',
      state,
      {
        codeChallenge: pkce.codeChallenge,
        codeChallengeMethod: pkce.codeChallengeMethod,
      }
    );

    const parsedUrl = new URL(authUrl);
    assert.strictEqual(parsedUrl.origin, 'https://linear.app');
    assert.strictEqual(parsedUrl.pathname, '/oauth/authorize');
    assert.ok(parsedUrl.searchParams.get('client_id'), 'Must include client_id');
    assert.strictEqual(parsedUrl.searchParams.get('redirect_uri'), 'http://localhost:8000/api/v1/connectors/linear/callback');
    assert.strictEqual(parsedUrl.searchParams.get('response_type'), 'code');
    assert.strictEqual(parsedUrl.searchParams.get('state'), state);
    assert.strictEqual(parsedUrl.searchParams.get('actor'), 'user');
    assert.strictEqual(authUrl.includes('actor=application'), false, 'Must not contain deprecated actor=application');

    const allActors = parsedUrl.searchParams.getAll('actor');
    assert.strictEqual(allActors.length, 1, 'Must have exactly one actor parameter');

    assert.strictEqual(parsedUrl.searchParams.get('code_challenge'), pkce.codeChallenge);
    assert.strictEqual(parsedUrl.searchParams.get('code_challenge_method'), 'S256');

    const scopes = parsedUrl.searchParams.get('scope')?.split(',') || [];
    assert.ok(scopes.includes('read'));
    assert.ok(scopes.includes('write'));

    // Assert exact single occurrence of response_type
    const allResponseTypes = parsedUrl.searchParams.getAll('response_type');
    assert.strictEqual(allResponseTypes.length, 1, 'Must have exactly one response_type parameter');
  });

  // 2. State Validation
  await test('2. State validation succeeds for valid matching Linear state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_linear_abc',
      providerSlug: 'linear',
      userId: 'user_lin_99',
    });

    const payload = OAuthStateManager.validateState(state, 'linear');
    assert.strictEqual(payload.workspaceId, 'ws_linear_abc');
    assert.strictEqual(payload.providerSlug, 'linear');
  });

  // 3. State Mismatch Rejection
  await test('3. Callback rejects mismatched provider state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_linear_test',
      providerSlug: 'gmail',
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'linear'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('mismatch')
    );
  });

  // 4. State Expiration Rejection
  await test('4. Callback rejects expired state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_linear_test',
      providerSlug: 'linear',
      ttlMs: -1000,
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'linear'),
      (err: any) => err instanceof OAuthStateExpiredError
    );
  });

  // 5. Anti-Replay Nonce Protection
  await test('5. Callback rejects reused state (anti-replay)', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_linear_replay',
      providerSlug: 'linear',
    });

    OAuthStateManager.validateState(state, 'linear');

    assert.throws(
      () => OAuthStateManager.validateState(state, 'linear'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('already been consumed')
    );
  });

  // 6. AES-256-GCM Token Encryption
  await test('6. Linear tokens encrypt with AES-256-GCM and decrypt accurately', () => {
    const credentials = {
      access_token: 'lin_oauth_token_secret_12345',
      organization_id: 'org_lin_777',
      account_name: 'Acme Linear',
    };

    const encrypted = CredentialManager.encrypt(credentials);
    const decrypted = CredentialManager.decrypt<typeof credentials>(encrypted);

    assert.strictEqual(decrypted.access_token, credentials.access_token);
    assert.strictEqual(decrypted.organization_id, credentials.organization_id);
    assert.strictEqual(decrypted.account_name, credentials.account_name);
  });

  // 7. Credential Vault Sanitization
  await test('7. CredentialVault.toPublicMetadata scrubs Linear tokens completely', () => {
    const mockRecord: any = {
      id: 'conn_linear_001',
      workspace_id: 'ws_linear_xyz',
      connector_definition_id: 'linear',
      status: 'connected',
      connected_account_name: 'Acme Linear Organization',
      connected_account_email: 'dev@acme.com',
      token_expires_at: null,
      encrypted_access_token: CredentialManager.encrypt({ access_token: 'lin_secret_access' }),
      encrypted_refresh_token: null,
    };

    const publicMeta = CredentialVault.toPublicMetadata(mockRecord);
    assert.strictEqual(publicMeta.status, 'connected');
    assert.strictEqual(publicMeta.connected_account_name, 'Acme Linear Organization');
    assert.strictEqual((publicMeta as any).encrypted_access_token, undefined, 'Must not leak encrypted tokens');
  });

  // 8. OAuth Callback Handling
  await test('8. LinearConnector handles callback and resolves workspace identity', async () => {
    const connector = new LinearConnector();
    const result = await connector.handleCallback(
      'ws_linear_test',
      'auth_code_lin_mock',
      'http://localhost:8000/api/v1/connectors/linear/callback'
    );

    assert.ok(result.access_token, 'Must return access token');
    assert.ok(result.account_name, 'Must return account name');
    assert.ok(result.account_email, 'Must return account email');
    assert.ok(result.scopes.length > 0, 'Must return scopes');
  });

  // 9. Health Check
  await test('9. LinearConnector healthCheck returns operational status', async () => {
    const connector = new LinearConnector();
    const health = await connector.healthCheck({ access_token: 'lin_mock_token_123' });
    assert.strictEqual(health.healthy, true);
    assert.strictEqual(health.status, 'connected');
  });

  // 10. Tool Listing (All 8 Tools)
  await test('10. LinearConnector lists all 8 standard tools', () => {
    const connector = new LinearConnector();
    const tools = connector.listTools();
    const toolNames = tools.map((t) => t.name);

    const expectedTools = [
      'linear.search_issues',
      'linear.get_issue',
      'linear.create_issue',
      'linear.update_issue',
      'linear.add_comment',
      'linear.list_teams',
      'linear.list_projects',
      'linear.get_viewer',
    ];

    assert.strictEqual(tools.length, 8);
    for (const expected of expectedTools) {
      assert.ok(toolNames.includes(expected), `Must include ${expected}`);
    }
  });

  // 11. Tool Execution - Search Issues
  await test('11. Executes linear.search_issues cleanly', async () => {
    const connector = new LinearConnector();
    const res = await connector.executeTool(
      'linear.search_issues',
      { query: 'voice latency', limit: 5 },
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.data.issues.length > 0);
  });

  // 12. Tool Execution - Get Issue
  await test('12. Executes linear.get_issue cleanly', async () => {
    const connector = new LinearConnector();
    const res = await connector.executeTool(
      'linear.get_issue',
      { issue_id: 'ENG-101' },
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.identifier, 'ENG-101');
    assert.ok(res.data.title);
  });

  // 13. Tool Execution - Create & Update Issue
  await test('13. Executes linear.create_issue and linear.update_issue cleanly', async () => {
    const connector = new LinearConnector();
    const createRes = await connector.executeTool(
      'linear.create_issue',
      { team_id: 'ENG', title: 'Fix WebRTC audio glitch', description: 'Caller reported audio drop' },
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(createRes.success, true);
    assert.ok(createRes.data.issue_id);

    const updateRes = await connector.executeTool(
      'linear.update_issue',
      { issue_id: createRes.data.issue_id, title: 'Fix WebRTC audio glitch (Resolved)' },
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(updateRes.success, true);
    assert.ok(updateRes.data.issue_id);
  });

  // 14. Tool Execution - Add Comment
  await test('14. Executes linear.add_comment cleanly', async () => {
    const connector = new LinearConnector();
    const commentRes = await connector.executeTool(
      'linear.add_comment',
      { issue_id: 'ENG-101', comment_body: 'Call verified: user agreed with proposal.' },
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(commentRes.success, true);
    assert.ok(commentRes.data.comment_id);
  });

  // 15. Tool Execution - List Teams, Projects & Viewer
  await test('15. Executes linear.list_teams, linear.list_projects, and linear.get_viewer cleanly', async () => {
    const connector = new LinearConnector();
    const teamsRes = await connector.executeTool(
      'linear.list_teams',
      {},
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(teamsRes.success, true);
    assert.ok(teamsRes.data.teams.length > 0);

    const projectsRes = await connector.executeTool(
      'linear.list_projects',
      {},
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(projectsRes.success, true);
    assert.ok(projectsRes.data.projects.length > 0);

    const viewerRes = await connector.executeTool(
      'linear.get_viewer',
      {},
      { workspaceId: 'ws_test', credentials: { access_token: 'lin_mock_token' } }
    );
    assert.strictEqual(viewerRes.success, true);
    assert.ok(viewerRes.data.name);
    assert.ok(viewerRes.data.organization);
  });

  // 16. Connector Registry & Multi-Provider Non-Regression Check
  await test('16. Linear, Gmail, Slack, HubSpot, Notion, and Salesforce remain registered and operational', () => {
    const registry = ConnectorRegistry.getInstance();
    registry.registerConnector(new GmailConnector());
    registry.registerConnector(new SlackConnector());
    registry.registerConnector(new HubSpotConnector());
    registry.registerConnector(new NotionConnector());
    registry.registerConnector(new SalesforceConnector());
    registry.registerConnector(new LinearConnector());

    assert.ok(registry.getConnector('linear'), 'Linear must be registered');
    assert.ok(registry.getConnector('gmail'), 'Gmail must be registered');
    assert.ok(registry.getConnector('slack'), 'Slack must be registered');
    assert.ok(registry.getConnector('hubspot'), 'HubSpot must be registered');
    assert.ok(registry.getConnector('notion'), 'Notion must be registered');
    assert.ok(registry.getConnector('salesforce'), 'Salesforce must be registered');
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================\n');
}

runTests().catch((e) => {
  console.error('Test Suite Failed:', e);
  process.exit(1);
});
