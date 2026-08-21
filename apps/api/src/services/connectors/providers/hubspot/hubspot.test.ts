import assert from 'assert';
import crypto from 'crypto';
import { HubSpotConnector } from './HubSpotConnector';
import { HubSpotMCPClient } from './HubSpotMCPClient';
import { OAuthStateManager, OAuthStateInvalidError, OAuthStateExpiredError } from '../../core/OAuthStateManager';
import { CredentialManager } from '../../core/CredentialManager';
import { CredentialVault } from '../../core/CredentialVault';
import { ConnectorRegistry } from '../../core/ConnectorRegistry';
import { OAuthManager } from '../../core/OAuthManager';
import { SlackConnector } from '../slack/SlackConnector';
import { GmailConnector } from '../gmail/GmailConnector';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING HUBSPOT CRM & CONNECTOR SUITE TESTS');
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

  // 1. PKCE Generation & Verification
  await test('1. PKCE verifier and S256 challenge generated correctly', () => {
    const pkce = OAuthStateManager.generatePKCE();
    assert.ok(pkce.codeVerifier, 'Verifier must be non-empty');
    assert.ok(pkce.codeChallenge, 'Challenge must be non-empty');
    assert.strictEqual(pkce.codeChallengeMethod, 'S256');

    // Verify SHA-256 base64url calculation
    const expectedChallenge = crypto
      .createHash('sha256')
      .update(pkce.codeVerifier)
      .digest('base64url');
    assert.strictEqual(pkce.codeChallenge, expectedChallenge, 'Challenge must equal BASE64URL(SHA256(verifier))');
  });

  // 2. Authorization URL Construction
  await test('2. HubSpot authorization URL includes client_id, redirect_uri, state, PKCE challenge', async () => {
    const connector = new HubSpotConnector();
    const pkce = OAuthStateManager.generatePKCE();
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_test_123',
      providerSlug: 'hubspot',
      codeVerifier: pkce.codeVerifier,
    });

    const authUrl = await connector.getAuthorizationUrl('ws_test_123', 'http://localhost:8000/api/v1/connectors/hubspot/callback', state, {
      codeChallenge: pkce.codeChallenge,
      codeChallengeMethod: pkce.codeChallengeMethod,
    });

    const parsedUrl = new URL(authUrl);
    assert.strictEqual(parsedUrl.origin, 'https://app.hubspot.com');
    assert.strictEqual(parsedUrl.pathname, '/oauth/authorize');
    assert.ok(parsedUrl.searchParams.get('client_id'), 'Must have client_id');
    assert.strictEqual(parsedUrl.searchParams.get('redirect_uri'), 'http://localhost:8000/api/v1/connectors/hubspot/callback');
    assert.strictEqual(parsedUrl.searchParams.get('state'), state);
    assert.strictEqual(parsedUrl.searchParams.get('code_challenge'), pkce.codeChallenge);
    assert.strictEqual(parsedUrl.searchParams.get('code_challenge_method'), 'S256');
  });

  // 3. State Validation & Tampering Protection
  await test('3. State validation succeeds for valid matching provider state', () => {
    const pkce = OAuthStateManager.generatePKCE();
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_abc_789',
      providerSlug: 'hubspot',
      userId: 'user_xyz_123',
      codeVerifier: pkce.codeVerifier,
    });

    const payload = OAuthStateManager.validateState(state, 'hubspot');
    assert.strictEqual(payload.workspaceId, 'ws_abc_789');
    assert.strictEqual(payload.providerSlug, 'hubspot');
    assert.strictEqual(payload.userId, 'user_xyz_123');
    assert.strictEqual(payload.codeVerifier, pkce.codeVerifier);
  });

  // 4. State Provider Mismatch Rejection
  await test('4. Callback rejects mismatched provider state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_test_1',
      providerSlug: 'slack',
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'hubspot'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('mismatch')
    );
  });

  // 5. State Expiration Rejection
  await test('5. Callback rejects expired state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_test_1',
      providerSlug: 'hubspot',
      ttlMs: -1000, // already expired
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'hubspot'),
      (err: any) => err instanceof OAuthStateExpiredError
    );
  });

  // 6. Anti-Replay / Single-Use Nonce Rejection
  await test('6. Callback rejects reused state (anti-replay)', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_test_replay',
      providerSlug: 'hubspot',
    });

    // First use: valid
    OAuthStateManager.validateState(state, 'hubspot');

    // Second use: must throw replay error
    assert.throws(
      () => OAuthStateManager.validateState(state, 'hubspot'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('already been consumed')
    );
  });

  // 7. Token Storage & AES-256-GCM Encryption
  await test('7. Credentials encrypt with AES-256-GCM and decrypt accurately', () => {
    const secretData = {
      access_token: 'pat-na1-secret-hubspot-access-token-12345',
      refresh_token: 'pat-na1-secret-hubspot-refresh-token-67890',
    };

    const encrypted = CredentialManager.encrypt(secretData);
    assert.ok(encrypted, 'Encrypted string must be non-empty base64');
    assert.notStrictEqual(encrypted, JSON.stringify(secretData), 'Must not be plaintext');

    // Decode base64 payload to verify AES-256-GCM structure
    const decoded = JSON.parse(Buffer.from(encrypted, 'base64').toString('utf8'));
    assert.ok(decoded.iv, 'Must contain IV');
    assert.ok(decoded.authTag, 'Must contain authTag');
    assert.ok(decoded.data, 'Must contain ciphertext data');

    const decrypted = CredentialManager.decrypt<typeof secretData>(encrypted);
    assert.strictEqual(decrypted.access_token, secretData.access_token);
    assert.strictEqual(decrypted.refresh_token, secretData.refresh_token);
  });

  // 8. Token Sanitization (No sensitive data exposed)
  await test('8. CredentialVault.toPublicMetadata scrubs secrets completely', () => {
    const mockRecord: any = {
      id: 'conn_hubspot_123',
      workspace_id: 'ws_secure_1',
      connector_definition_id: 'hubspot',
      status: 'connected',
      connected_account_name: 'HubSpot Portal #9876543',
      connected_account_email: 'portal_9876543@hubspot.com',
      token_expires_at: new Date(Date.now() + 1800000).toISOString(),
      encrypted_access_token: CredentialManager.encrypt({ access_token: 'secret_token_value' }),
      encrypted_refresh_token: CredentialManager.encrypt({ refresh_token: 'secret_refresh_value' }),
    };

    const publicMeta = CredentialVault.toPublicMetadata(mockRecord);
    assert.strictEqual(publicMeta.status, 'connected');
    assert.strictEqual(publicMeta.connected_account_name, 'HubSpot Portal #9876543');
    assert.strictEqual((publicMeta as any).encrypted_access_token, undefined, 'Must not leak access token');
    assert.strictEqual((publicMeta as any).encrypted_refresh_token, undefined, 'Must not leak refresh token');
    assert.strictEqual((publicMeta as any).access_token, undefined);
  });

  // 9. Mock Callback & Token Exchange
  await test('9. HubSpotConnector handles callback and resolves portal identity', async () => {
    const connector = new HubSpotConnector();
    const result = await connector.handleCallback(
      'ws_test',
      'auth_code_xyz',
      'http://localhost:8000/api/v1/connectors/hubspot/callback',
      { codeVerifier: 'mock_pkce_verifier' }
    );

    assert.ok(result.access_token, 'Must return access token');
    assert.ok(result.refresh_token, 'Must return refresh token');
    assert.ok(result.account_name, 'Must return account name');
    assert.ok(result.account_email, 'Must return account email');
    assert.strictEqual(result.token_type, 'bearer');
  });

  // 10. Refresh Token Rotation
  await test('10. HubSpotConnector refreshCredentials rotates access and refresh tokens', async () => {
    const connector = new HubSpotConnector();
    const initialCredentials = {
      access_token: 'old_access_token',
      refresh_token: 'initial_refresh_token',
      expires_in: 1800,
    };

    const refreshed = await connector.refreshCredentials(initialCredentials);
    assert.ok(refreshed.access_token, 'Must return refreshed access token');
    assert.ok(refreshed.refresh_token, 'Must return rotated refresh token');
    assert.notStrictEqual(refreshed.access_token, initialCredentials.access_token);
  });

  // 11. Remote MCP Client Tool Execution (Mock / Fallback)
  await test('11. HubSpotMCPClient executes search_contacts cleanly', async () => {
    const mcpClient = new HubSpotMCPClient('mock_access_token');
    assert.ok(mcpClient, 'HubSpotMCPClient initialized');

    const result = await mcpClient.executeTool('search_contacts', { query: 'test' });
    assert.strictEqual(result.success, true);
    assert.ok(result.data, 'Must return result data');
  });

  // 12. Tool Definitions Check
  await test('12. HubSpotConnector lists standard CRM tools', () => {
    const connector = new HubSpotConnector();
    const tools = connector.listTools();
    const toolNames = tools.map((t) => t.name);

    assert.ok(toolNames.includes('hubspot.search_contacts'));
    assert.ok(toolNames.includes('hubspot.get_contact'));
    assert.ok(toolNames.includes('hubspot.create_contact'));
    assert.ok(toolNames.includes('hubspot.create_engagement'));

    const createContact = tools.find((t) => t.name === 'hubspot.create_contact');
    assert.strictEqual(createContact?.permissionCategory, 'write');
    assert.strictEqual(createContact?.realtimeSuitability, false);

    const searchContact = tools.find((t) => t.name === 'hubspot.search_contacts');
    assert.strictEqual(searchContact?.permissionCategory, 'read');
    assert.strictEqual(searchContact?.realtimeSuitability, true);
  });

  // 13. Registry Integration
  await test('13. HubSpotConnector is registered in ConnectorRegistry', () => {
    const registry = ConnectorRegistry.getInstance();
    registry.registerConnector(new HubSpotConnector());
    const hubspot = registry.getConnector('hubspot');
    assert.ok(hubspot, 'HubSpot must be registered in registry');
    assert.strictEqual(hubspot?.slug, 'hubspot');
    assert.strictEqual(hubspot?.name, 'HubSpot CRM');
  });

  // 14. Existing Connectors Preservation (Slack & Gmail)
  await test('14. Slack and Gmail connectors remain fully functional', () => {
    const registry = ConnectorRegistry.getInstance();
    registry.registerConnector(new GmailConnector());
    registry.registerConnector(new SlackConnector());

    const gmail = registry.getConnector('gmail');
    const slack = registry.getConnector('slack');

    assert.ok(gmail, 'Gmail connector must be registered');
    assert.ok(slack, 'Slack connector must be registered');

    const gmailTools = gmail?.listTools() || [];
    assert.ok(gmailTools.some((t) => t.name === 'gmail.send_email'));

    const slackTools = slack?.listTools() || [];
    assert.ok(slackTools.some((t) => t.name === 'slack.send_message'));
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================\n');
}

runTests().catch((e) => {
  console.error('Test Suite Failed:', e);
  process.exit(1);
});
