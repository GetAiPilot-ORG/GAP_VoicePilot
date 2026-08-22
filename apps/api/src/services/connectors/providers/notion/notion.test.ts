import assert from 'assert';
import { NotionConnector } from './NotionConnector';
import { OAuthStateManager, OAuthStateInvalidError, OAuthStateExpiredError } from '../../core/OAuthStateManager';
import { CredentialManager } from '../../core/CredentialManager';
import { CredentialVault } from '../../core/CredentialVault';
import { ConnectorRegistry } from '../../core/ConnectorRegistry';
import { SlackConnector } from '../slack/SlackConnector';
import { GmailConnector } from '../gmail/GmailConnector';
import { HubSpotConnector } from '../hubspot/HubSpotConnector';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING NOTION WORKSPACE CONNECTOR TESTS');
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

  // 1. Authorization URL Construction
  await test('1. Notion authorization URL includes client_id, redirect_uri, response_type=code, owner=user, state with exactly one response_type', async () => {
    const connector = new NotionConnector();
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_notion_test',
      providerSlug: 'notion',
      userId: 'user_notion_1',
    });

    const authUrl = await connector.getAuthorizationUrl(
      'ws_notion_test',
      'http://localhost:8000/api/v1/connectors/notion/callback',
      state
    );

    const parsedUrl = new URL(authUrl);
    assert.strictEqual(parsedUrl.origin, 'https://api.notion.com');
    assert.strictEqual(parsedUrl.pathname, '/v1/oauth/authorize');
    assert.ok(parsedUrl.searchParams.get('client_id'), 'Must have client_id');
    assert.strictEqual(parsedUrl.searchParams.get('redirect_uri'), 'http://localhost:8000/api/v1/connectors/notion/callback');
    assert.strictEqual(parsedUrl.searchParams.get('response_type'), 'code');
    assert.strictEqual(parsedUrl.searchParams.get('owner'), 'user');
    assert.strictEqual(parsedUrl.searchParams.get('state'), state);

    // Explicit uniqueness checks for response_type
    const allResponseTypes = parsedUrl.searchParams.getAll('response_type');
    assert.strictEqual(allResponseTypes.length, 1, 'There must be exactly one response_type query parameter');
    assert.strictEqual(allResponseTypes[0], 'code');

    const matches = authUrl.match(/response_type=/g);
    assert.strictEqual(matches?.length, 1, 'response_type must appear exactly once in the URL string');
  });

  // 2. State Validation & Tampering Protection
  await test('2. State validation succeeds for valid matching Notion state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_notion_abc',
      providerSlug: 'notion',
      userId: 'user_notion_99',
    });

    const payload = OAuthStateManager.validateState(state, 'notion');
    assert.strictEqual(payload.workspaceId, 'ws_notion_abc');
    assert.strictEqual(payload.providerSlug, 'notion');
    assert.strictEqual(payload.userId, 'user_notion_99');
  });

  // 3. State Provider Mismatch Rejection
  await test('3. Callback rejects mismatched provider state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_notion_test',
      providerSlug: 'slack',
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'notion'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('mismatch')
    );
  });

  // 4. State Expiration Rejection
  await test('4. Callback rejects expired state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_notion_test',
      providerSlug: 'notion',
      ttlMs: -1000,
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'notion'),
      (err: any) => err instanceof OAuthStateExpiredError
    );
  });

  // 5. Anti-Replay / Single-Use Nonce Rejection
  await test('5. Callback rejects reused state (anti-replay)', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_notion_replay',
      providerSlug: 'notion',
    });

    OAuthStateManager.validateState(state, 'notion');

    assert.throws(
      () => OAuthStateManager.validateState(state, 'notion'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('already been consumed')
    );
  });

  // 6. Token Encryption & Decryption
  await test('6. Notion tokens encrypt with AES-256-GCM and decrypt accurately', () => {
    const tokenData = {
      access_token: 'secret_notion_bearer_token_abc123',
      bot_id: 'bot_id_xyz789',
      workspace_id: 'notion_ws_456',
    };

    const encrypted = CredentialManager.encrypt(tokenData);
    assert.ok(encrypted, 'Must return encrypted string');
    assert.notStrictEqual(encrypted, JSON.stringify(tokenData));

    const decrypted = CredentialManager.decrypt<typeof tokenData>(encrypted);
    assert.strictEqual(decrypted.access_token, tokenData.access_token);
    assert.strictEqual(decrypted.bot_id, tokenData.bot_id);
    assert.strictEqual(decrypted.workspace_id, tokenData.workspace_id);
  });

  // 7. Token Sanitization (No sensitive data exposed)
  await test('7. CredentialVault.toPublicMetadata scrubs Notion tokens completely', () => {
    const mockRecord: any = {
      id: 'conn_notion_123',
      workspace_id: 'ws_notion_sec',
      connector_definition_id: 'notion',
      status: 'connected',
      connected_account_name: 'Acme Notion Workspace',
      connected_account_email: 'workspace@notion-acme.com',
      token_expires_at: null,
      encrypted_access_token: CredentialManager.encrypt({ access_token: 'secret_notion_secret_value' }),
      encrypted_refresh_token: null,
    };

    const publicMeta = CredentialVault.toPublicMetadata(mockRecord);
    assert.strictEqual(publicMeta.status, 'connected');
    assert.strictEqual(publicMeta.connected_account_name, 'Acme Notion Workspace');
    assert.strictEqual((publicMeta as any).encrypted_access_token, undefined, 'Must not leak access token');
    assert.strictEqual((publicMeta as any).access_token, undefined);
  });

  // 8. Mock Callback & Token Exchange
  await test('8. NotionConnector handles callback and resolves workspace identity', async () => {
    const connector = new NotionConnector();
    const result = await connector.handleCallback(
      'ws_test',
      'auth_code_notion_123',
      'http://localhost:8000/api/v1/connectors/notion/callback'
    );

    assert.ok(result.access_token, 'Must return access token');
    assert.ok(result.workspace_id, 'Must return workspace_id');
    assert.ok(result.account_name, 'Must return account name');
    assert.ok(result.account_email, 'Must return valid account email');
    assert.ok(result.account_email.includes('@'), 'Account email must contain @');
  });

  // 9. Tool Definitions Check
  await test('9. NotionConnector lists all 5 tools (search, get_page, create_page, update_page, append_blocks)', () => {
    const connector = new NotionConnector();
    const tools = connector.listTools();
    const toolNames = tools.map((t) => t.name);

    assert.ok(toolNames.includes('notion.search'), 'Must include notion.search');
    assert.ok(toolNames.includes('notion.get_page'), 'Must include notion.get_page');
    assert.ok(toolNames.includes('notion.create_page'), 'Must include notion.create_page');
    assert.ok(toolNames.includes('notion.update_page'), 'Must include notion.update_page');
    assert.ok(toolNames.includes('notion.append_blocks'), 'Must include notion.append_blocks');

    const searchTool = tools.find((t) => t.name === 'notion.search');
    assert.strictEqual(searchTool?.permissionCategory, 'read');
    assert.strictEqual(searchTool?.realtimeSuitability, true);

    const appendTool = tools.find((t) => t.name === 'notion.append_blocks');
    assert.strictEqual(appendTool?.permissionCategory, 'write');
    assert.strictEqual(appendTool?.realtimeSuitability, false);
  });

  // 10. Tool Execution: notion.search
  await test('10. NotionConnector executes notion.search cleanly', async () => {
    const connector = new NotionConnector();
    const result = await connector.executeTool(
      'notion.search',
      { query: 'Roadmap', limit: 5 },
      { workspaceId: 'ws_test', credentials: { access_token: 'secret_mock_token_123' } }
    );

    assert.strictEqual(result.success, true);
    assert.ok(result.data.results, 'Must return search results');
    assert.ok(result.data.results.length > 0);
  });

  // 11. Tool Execution: notion.get_page
  await test('11. NotionConnector executes notion.get_page cleanly', async () => {
    const connector = new NotionConnector();
    const result = await connector.executeTool(
      'notion.get_page',
      { page_id: 'page_123_456' },
      { workspaceId: 'ws_test', credentials: { access_token: 'secret_mock_token_123' } }
    );

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.id, 'page_123_456');
    assert.ok(result.data.plain_text_content);
  });

  // 12. Tool Execution: notion.create_page
  await test('12. NotionConnector executes notion.create_page cleanly', async () => {
    const connector = new NotionConnector();
    const result = await connector.executeTool(
      'notion.create_page',
      { parent_id: 'parent_page_123', title: 'Q4 Strategy Meeting', content: 'Discuss voice agents' },
      { workspaceId: 'ws_test', credentials: { access_token: 'secret_mock_token_123' } }
    );

    assert.strictEqual(result.success, true);
    assert.ok(result.data.page_id);
    assert.strictEqual(result.data.title, 'Q4 Strategy Meeting');
  });

  // 13. Tool Execution: notion.update_page
  await test('13. NotionConnector executes notion.update_page cleanly', async () => {
    const connector = new NotionConnector();
    const result = await connector.executeTool(
      'notion.update_page',
      { page_id: 'page_123_456', title: 'Updated Strategy Title', archived: false },
      { workspaceId: 'ws_test', credentials: { access_token: 'secret_mock_token_123' } }
    );

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.title, 'Updated Strategy Title');
  });

  // 14. Tool Execution: notion.append_blocks
  await test('14. NotionConnector executes notion.append_blocks cleanly', async () => {
    const connector = new NotionConnector();
    const result = await connector.executeTool(
      'notion.append_blocks',
      { block_id: 'page_123_456', text: 'Action item: Follow up with customer on pricing' },
      { workspaceId: 'ws_test', credentials: { access_token: 'secret_mock_token_123' } }
    );

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.block_id, 'page_123_456');
    assert.strictEqual(result.data.appended_count, 1);
  });

  // 15. Registry Integration
  await test('15. NotionConnector is registered in ConnectorRegistry', () => {
    const registry = ConnectorRegistry.getInstance();
    registry.registerConnector(new NotionConnector());
    const notion = registry.getConnector('notion');
    assert.ok(notion, 'Notion must be registered in registry');
    assert.strictEqual(notion?.slug, 'notion');
    assert.strictEqual(notion?.name, 'Notion Workspace');
  });

  // 16. Existing Connectors Preservation (Slack, Gmail, HubSpot)
  await test('16. Slack, Gmail, and HubSpot connectors remain fully functional', () => {
    const registry = ConnectorRegistry.getInstance();
    registry.registerConnector(new GmailConnector());
    registry.registerConnector(new SlackConnector());
    registry.registerConnector(new HubSpotConnector());

    const gmail = registry.getConnector('gmail');
    const slack = registry.getConnector('slack');
    const hubspot = registry.getConnector('hubspot');

    assert.ok(gmail, 'Gmail connector must be registered');
    assert.ok(slack, 'Slack connector must be registered');
    assert.ok(hubspot, 'HubSpot connector must be registered');

    assert.ok(gmail?.listTools().some((t) => t.name === 'gmail.send_email'));
    assert.ok(slack?.listTools().some((t) => t.name === 'slack.send_message'));
    assert.ok(hubspot?.listTools().some((t) => t.name === 'hubspot.create_contact'));
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================\n');
}

runTests().catch((e) => {
  console.error('Test Suite Failed:', e);
  process.exit(1);
});
