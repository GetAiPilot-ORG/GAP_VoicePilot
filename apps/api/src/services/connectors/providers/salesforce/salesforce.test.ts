import assert from 'assert';
import crypto from 'crypto';
import { SalesforceConnector } from './SalesforceConnector';
import { OAuthStateManager, OAuthStateInvalidError, OAuthStateExpiredError } from '../../core/OAuthStateManager';
import { CredentialManager } from '../../core/CredentialManager';
import { CredentialVault } from '../../core/CredentialVault';
import { ConnectorRegistry } from '../../core/ConnectorRegistry';
import { SlackConnector } from '../slack/SlackConnector';
import { GmailConnector } from '../gmail/GmailConnector';
import { HubSpotConnector } from '../hubspot/HubSpotConnector';
import { NotionConnector } from '../notion/NotionConnector';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING SALESFORCE CRM PKCE & ROTATION TESTS');
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

  // 1. Cryptographic PKCE Generation (RFC 7636)
  await test('1. PKCE verifier and S256 challenge generated cryptographically', () => {
    const pkce = OAuthStateManager.generatePKCE();
    assert.ok(pkce.codeVerifier, 'Must generate codeVerifier');
    assert.ok(pkce.codeChallenge, 'Must generate codeChallenge');
    assert.strictEqual(pkce.codeChallengeMethod, 'S256');

    // Verify S256 transformation
    const expectedChallenge = crypto
      .createHash('sha256')
      .update(pkce.codeVerifier)
      .digest('base64url');
    assert.strictEqual(pkce.codeChallenge, expectedChallenge, 'S256 challenge must match SHA-256 of verifier');
  });

  // 2. Authorization URL Construction with PKCE (code_challenge & code_challenge_method=S256)
  await test('2. Salesforce authorization URL includes client_id, redirect_uri, response_type=code, code_challenge, code_challenge_method=S256', async () => {
    const connector = new SalesforceConnector();
    const pkce = OAuthStateManager.generatePKCE();
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_sf_test',
      providerSlug: 'salesforce',
      userId: 'user_sf_1',
      codeVerifier: pkce.codeVerifier,
    });

    const authUrl = await connector.getAuthorizationUrl(
      'ws_sf_test',
      'http://localhost:8000/api/v1/connectors/salesforce/callback',
      state,
      {
        codeChallenge: pkce.codeChallenge,
        codeChallengeMethod: pkce.codeChallengeMethod,
      }
    );

    const parsedUrl = new URL(authUrl);
    assert.strictEqual(parsedUrl.origin, 'https://login.salesforce.com');
    assert.strictEqual(parsedUrl.pathname, '/services/oauth2/authorize');
    assert.ok(parsedUrl.searchParams.get('client_id'), 'Must have client_id');
    assert.strictEqual(parsedUrl.searchParams.get('redirect_uri'), 'http://localhost:8000/api/v1/connectors/salesforce/callback');
    assert.strictEqual(parsedUrl.searchParams.get('response_type'), 'code');
    assert.strictEqual(parsedUrl.searchParams.get('code_challenge'), pkce.codeChallenge);
    assert.strictEqual(parsedUrl.searchParams.get('code_challenge_method'), 'S256');
    assert.strictEqual(parsedUrl.searchParams.get('state'), state);

    // Assert exact single occurrence of response_type
    const allResponseTypes = parsedUrl.searchParams.getAll('response_type');
    assert.strictEqual(allResponseTypes.length, 1, 'There must be exactly one response_type parameter');
  });

  // 3. State Validation & Protected codeVerifier Extraction
  await test('3. State validation recovers encrypted codeVerifier securely', () => {
    const pkce = OAuthStateManager.generatePKCE();
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_sf_abc',
      providerSlug: 'salesforce',
      userId: 'user_sf_99',
      codeVerifier: pkce.codeVerifier,
    });

    const payload = OAuthStateManager.validateState(state, 'salesforce');
    assert.strictEqual(payload.workspaceId, 'ws_sf_abc');
    assert.strictEqual(payload.providerSlug, 'salesforce');
    assert.strictEqual(payload.codeVerifier, pkce.codeVerifier);
  });

  // 4. State Provider Mismatch Rejection
  await test('4. Callback rejects mismatched provider state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_sf_test',
      providerSlug: 'gmail',
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'salesforce'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('mismatch')
    );
  });

  // 5. State Expiration Rejection
  await test('5. Callback rejects expired state', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_sf_test',
      providerSlug: 'salesforce',
      ttlMs: -1000,
    });

    assert.throws(
      () => OAuthStateManager.validateState(state, 'salesforce'),
      (err: any) => err instanceof OAuthStateExpiredError
    );
  });

  // 6. Anti-Replay / Single-Use Nonce Rejection
  await test('6. Callback rejects reused state (anti-replay)', () => {
    const state = OAuthStateManager.generateState({
      workspaceId: 'ws_sf_replay',
      providerSlug: 'salesforce',
    });

    OAuthStateManager.validateState(state, 'salesforce');

    assert.throws(
      () => OAuthStateManager.validateState(state, 'salesforce'),
      (err: any) => err instanceof OAuthStateInvalidError && err.message.includes('already been consumed')
    );
  });

  // 7. Token Exchange with PKCE code_verifier
  await test('7. SalesforceConnector handleCallback accepts matching codeVerifier', async () => {
    const connector = new SalesforceConnector();
    const pkce = OAuthStateManager.generatePKCE();
    const result = await connector.handleCallback(
      'ws_test',
      'auth_code_sf_123',
      'http://localhost:8000/api/v1/connectors/salesforce/callback',
      { codeVerifier: pkce.codeVerifier }
    );

    assert.ok(result.access_token, 'Must return access token');
    assert.ok(result.refresh_token, 'Must return refresh token');
    assert.ok(result.instance_url, 'Must return instance_url');
    assert.strictEqual(result.code_verifier_used, true);
  });

  // 8. Refresh Token Rotation - Atomically Replace Old Refresh Token
  await test('8. Refresh token rotation atomically replaces old refresh token with new one', async () => {
    const connector = new SalesforceConnector();
    const oldRefreshToken = 'sf_mock_old_refresh_token_111';
    const initialCredentials = {
      access_token: 'sf_mock_old_access_token',
      refresh_token: oldRefreshToken,
      instance_url: 'https://customer-org.my.salesforce.com',
      simulate_rotation: true,
    };

    const refreshed = await connector.refreshCredentials(initialCredentials);
    assert.ok(refreshed.access_token, 'Must provide new access token');
    assert.notStrictEqual(refreshed.access_token, initialCredentials.access_token);
    assert.ok(refreshed.refresh_token, 'Must return rotated refresh token');
    assert.notStrictEqual(refreshed.refresh_token, oldRefreshToken, 'Must replace old refresh token on rotation');
    assert.strictEqual(refreshed.instance_url, initialCredentials.instance_url);
  });

  // 9. Refresh Token Rotation - Preserve Old Refresh Token When Replacement Not Returned
  await test('9. Refresh token rotation preserves old refresh token when provider does not issue replacement', async () => {
    const connector = new SalesforceConnector();
    const stableRefreshToken = 'sf_mock_stable_refresh_token_222';
    const initialCredentials = {
      access_token: 'sf_mock_old_access_token',
      refresh_token: stableRefreshToken,
      instance_url: 'https://customer-org.my.salesforce.com',
      simulate_rotation: false,
    };

    const refreshed = await connector.refreshCredentials(initialCredentials);
    assert.ok(refreshed.access_token, 'Must provide new access token');
    assert.strictEqual(refreshed.refresh_token, stableRefreshToken, 'Must preserve old refresh token');
    assert.strictEqual(refreshed.instance_url, initialCredentials.instance_url);
  });

  // 10. AES-256-GCM Credential Encryption & Sanitization
  await test('10. CredentialVault encrypts credentials and scrubs tokens from public metadata', () => {
    const credentials = {
      access_token: 'sf_secret_token_123',
      refresh_token: 'sf_secret_refresh_456',
      instance_url: 'https://acme.my.salesforce.com',
    };

    const encrypted = CredentialManager.encrypt(credentials);
    const decrypted = CredentialManager.decrypt<typeof credentials>(encrypted);
    assert.strictEqual(decrypted.access_token, credentials.access_token);
    assert.strictEqual(decrypted.refresh_token, credentials.refresh_token);

    const mockRecord: any = {
      id: 'conn_sf_999',
      workspace_id: 'ws_sf_sec',
      connector_definition_id: 'salesforce',
      status: 'connected',
      connected_account_name: 'Acme Salesforce Enterprise',
      connected_account_email: 'salesforce@acme.com',
      token_expires_at: new Date(Date.now() + 7200000).toISOString(),
      encrypted_access_token: encrypted,
      encrypted_refresh_token: CredentialManager.encrypt({ refresh_token: credentials.refresh_token }),
    };

    const publicMeta = CredentialVault.toPublicMetadata(mockRecord);
    assert.strictEqual(publicMeta.status, 'connected');
    assert.strictEqual((publicMeta as any).encrypted_access_token, undefined, 'Must not leak access token');
    assert.strictEqual((publicMeta as any).encrypted_refresh_token, undefined, 'Must not leak refresh token');
  });

  // 11. Tool Listing (All 9 Tools)
  await test('11. SalesforceConnector lists all 9 standard CRM tools', () => {
    const connector = new SalesforceConnector();
    const tools = connector.listTools();
    const toolNames = tools.map((t) => t.name);

    const expectedTools = [
      'salesforce.search_contacts',
      'salesforce.get_contact',
      'salesforce.create_contact',
      'salesforce.update_contact',
      'salesforce.search_leads',
      'salesforce.create_lead',
      'salesforce.update_lead',
      'salesforce.create_task',
      'salesforce.create_note',
    ];

    for (const expected of expectedTools) {
      assert.ok(toolNames.includes(expected), `Must include ${expected}`);
    }
  });

  // 12. Tool Execution - Search Contacts & Leads
  await test('12. Executes search_contacts and search_leads cleanly', async () => {
    const connector = new SalesforceConnector();
    const contactRes = await connector.executeTool(
      'salesforce.search_contacts',
      { query: 'Connor', limit: 5 },
      { workspaceId: 'ws_test', credentials: { access_token: 'sf_mock_token_123', instance_url: 'https://mock.my.salesforce.com' } }
    );
    assert.strictEqual(contactRes.success, true);
    assert.ok(contactRes.data.contacts.length > 0);

    const leadRes = await connector.executeTool(
      'salesforce.search_leads',
      { query: 'John', limit: 5 },
      { workspaceId: 'ws_test', credentials: { access_token: 'sf_mock_token_123', instance_url: 'https://mock.my.salesforce.com' } }
    );
    assert.strictEqual(leadRes.success, true);
    assert.ok(leadRes.data.leads.length > 0);
  });

  // 13. Tool Execution - Create/Update Contacts & Leads
  await test('13. Executes create_contact, update_contact, create_lead, update_lead cleanly', async () => {
    const connector = new SalesforceConnector();
    const contactRes = await connector.executeTool(
      'salesforce.create_contact',
      { first_name: 'Kyle', last_name: 'Reese', email: 'kyle@resistance.org' },
      { workspaceId: 'ws_test', credentials: { access_token: 'sf_mock_token_123', instance_url: 'https://mock.my.salesforce.com' } }
    );
    assert.strictEqual(contactRes.success, true);

    const leadRes = await connector.executeTool(
      'salesforce.create_lead',
      { first_name: 'John', last_name: 'Connor', company: 'Cyberdyne' },
      { workspaceId: 'ws_test', credentials: { access_token: 'sf_mock_token_123', instance_url: 'https://mock.my.salesforce.com' } }
    );
    assert.strictEqual(leadRes.success, true);
  });

  // 14. Tool Execution - Task & Note Creation
  await test('14. Executes create_task and create_note cleanly', async () => {
    const connector = new SalesforceConnector();
    const taskRes = await connector.executeTool(
      'salesforce.create_task',
      { subject: 'Call Follow-up', description: 'Discussed requirements' },
      { workspaceId: 'ws_test', credentials: { access_token: 'sf_mock_token_123', instance_url: 'https://mock.my.salesforce.com' } }
    );
    assert.strictEqual(taskRes.success, true);

    const noteRes = await connector.executeTool(
      'salesforce.create_note',
      { parent_id: '003mockContact001', title: 'Call Note', body: 'Customer agreed to proceed' },
      { workspaceId: 'ws_test', credentials: { access_token: 'sf_mock_token_123', instance_url: 'https://mock.my.salesforce.com' } }
    );
    assert.strictEqual(noteRes.success, true);
  });

  // 15. Registry Integration & Non-Regression across other connectors
  await test('15. Salesforce, Gmail, Slack, HubSpot, and Notion remain registered and functional', () => {
    const registry = ConnectorRegistry.getInstance();
    registry.registerConnector(new GmailConnector());
    registry.registerConnector(new SlackConnector());
    registry.registerConnector(new HubSpotConnector());
    registry.registerConnector(new NotionConnector());
    registry.registerConnector(new SalesforceConnector());

    assert.ok(registry.getConnector('salesforce'));
    assert.ok(registry.getConnector('gmail'));
    assert.ok(registry.getConnector('slack'));
    assert.ok(registry.getConnector('hubspot'));
    assert.ok(registry.getConnector('notion'));
  });

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================\n');
}

runTests().catch((e) => {
  console.error('Test Suite Failed:', e);
  process.exit(1);
});
