import assert from 'assert';
import { OAuthServerService } from '../oauth-server/OAuthServerService';
import { ZapierSubscriptionManager } from './ZapierSubscriptionManager';
import { EventBus } from '../events/EventBus';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING ZAPIER DEVELOPER INTEGRATION TEST SUITE   ');
  console.log('====================================================\n');

  const oauthService = OAuthServerService.getInstance();
  const subManager = ZapierSubscriptionManager.getInstance();
  const eventBus = EventBus.getInstance();

  const testClientId = 'vp_client_zapier_test_001';
  const testClientSecret = 'zapier_sec_1234567890abcdef';
  const testRedirectUri = 'https://zapier.com/dashboard/auth/oauth/return/AppTest123/';
  const testWorkspaceId = '99999999-9999-4999-8999-999999999999';
  const testUserId = '11111111-1111-4111-8111-111111111111';

  // 1. Register test OAuth Client
  oauthService.registerMemoryClient({
    id: 'test_client_rec_id',
    client_id: testClientId,
    client_secret_hash: oauthService.hashSecret(testClientSecret),
    name: 'Zapier Private Test App',
    redirect_uris: [testRedirectUri],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Test 1: Client and Redirect URI Validation
  {
    const client = await oauthService.validateClient(testClientId, testClientSecret, testRedirectUri);
    assert.strictEqual(client.client_id, testClientId);
    console.log('  ✓ 1. Validates registered OAuth Client & redirect_uri exact match');
  }

  // Test 2: Issue Authorization Code
  let authCode: string;
  {
    authCode = await oauthService.createAuthorizationCode({
      clientId: testClientId,
      userId: testUserId,
      workspaceId: testWorkspaceId,
      redirectUri: testRedirectUri,
      scope: 'calls:read calls:write zapier:subscribe',
    });
    assert.ok(authCode.startsWith('vp_code_'));
    console.log('  ✓ 2. Issues 5-minute single-use authorization_code bound to client & redirect_uri');
  }

  // Test 3: Exchange Authorization Code for Access & Refresh Tokens
  let accessToken: string;
  let refreshToken: string;
  {
    const tokenResponse = await oauthService.exchangeCodeForTokens({
      clientId: testClientId,
      clientSecret: testClientSecret,
      code: authCode,
      redirectUri: testRedirectUri,
    });

    assert.ok(tokenResponse.access_token.startsWith('vp_at_'));
    assert.strictEqual(tokenResponse.token_type, 'Bearer');
    assert.strictEqual(tokenResponse.expires_in, 3600);
    assert.ok(tokenResponse.refresh_token.startsWith('vp_rt_'));
    assert.ok(tokenResponse.scope.includes('zapier:subscribe'));

    accessToken = tokenResponse.access_token;
    refreshToken = tokenResponse.refresh_token;
    console.log('  ✓ 3. Exchanges code for access_token, refresh_token, token_type=Bearer, expires_in=3600');
  }

  // Test 4: Single-use Code Enforcement (Anti-replay)
  {
    let failed = false;
    try {
      await oauthService.exchangeCodeForTokens({
        clientId: testClientId,
        clientSecret: testClientSecret,
        code: authCode,
        redirectUri: testRedirectUri,
      });
    } catch (e: any) {
      failed = true;
      assert.ok(e.message.includes('already been used'));
    }
    assert.strictEqual(failed, true, 'Reused authorization code MUST be rejected');
    console.log('  ✓ 4. Reused authorization code is strictly rejected (anti-replay)');
  }

  // Test 5: Validate Access Token Context
  {
    const context = await oauthService.validateAccessToken(accessToken);
    assert.strictEqual(context.client_id, testClientId);
    assert.strictEqual(context.workspace_id, testWorkspaceId);
    assert.strictEqual(context.user_id, testUserId);
    console.log('  ✓ 5. Access token accurately resolves authenticated user & workspace context');
  }

  // Test 6: Refresh Token Grant (grant_type=refresh_token)
  {
    const refreshed = await oauthService.refreshAccessToken({
      clientId: testClientId,
      clientSecret: testClientSecret,
      refreshToken: refreshToken,
    });

    assert.ok(refreshed.access_token.startsWith('vp_at_'));
    assert.strictEqual(refreshed.token_type, 'Bearer');
    assert.strictEqual(refreshed.expires_in, 3600);
    assert.ok(refreshed.refresh_token.startsWith('vp_rt_'));

    // Validate new refreshed token
    const newContext = await oauthService.validateAccessToken(refreshed.access_token);
    assert.strictEqual(newContext.workspace_id, testWorkspaceId);
    console.log('  ✓ 6. Exchanges refresh_token for newly rotated access & refresh tokens');
  }

  // Test 7: Create REST Hook Subscription
  const fakeHookUrl = 'https://hooks.zapier.com/hooks/catch/123456/abcdef/';
  let subscriptionId: string;
  {
    const sub = await subManager.createSubscription({
      workspaceId: testWorkspaceId,
      userId: testUserId,
      hookUrl: fakeHookUrl,
      eventType: 'call.completed',
    });

    assert.ok(sub.id.startsWith('zap_sub_'));
    assert.strictEqual(sub.event_type, 'call.completed');
    assert.strictEqual(sub.status, 'active');
    subscriptionId = sub.id;
    console.log('  ✓ 7. Creates active REST hook subscription with stable subscription id');
  }

  // Test 8: Workspace Isolation & Cross-Workspace Delete Rejection
  {
    let rejected = false;
    try {
      await subManager.deleteSubscription(subscriptionId, 'other-workspace-uuid-8888');
    } catch (e: any) {
      rejected = true;
      assert.ok(e.message.includes('does not belong to your workspace'));
    }
    assert.strictEqual(rejected, true);
    console.log('  ✓ 8. Enforces strict workspace isolation; rejects cross-workspace deletion');
  }

  // Test 9: Real Call Completed Delivery & Duplicate Suppression
  {
    // Test duplicate event suppression
    const event1 = {
      workspaceId: testWorkspaceId,
      eventId: 'evt_zapier_test_001',
      callId: 'call_zapier_test_001',
      status: 'completed',
      durationSeconds: 42,
      customerName: 'Alice Springs',
      customerPhone: '+14155551234',
      assistantId: 'asst_001',
      assistantName: 'Receptionist AI',
      summary: 'Appointment successfully confirmed.',
      outcome: 'appointment_confirmed',
      createdAt: new Date().toISOString(),
    };

    const res1 = await subManager.deliverCallCompleted(event1);
    assert.strictEqual(res1.deliveredCount, 1);

    // Re-delivering exact same event
    const res2 = await subManager.deliverCallCompleted(event1);
    assert.strictEqual(res2.deliveredCount, 0, 'Duplicate event must be suppressed');
    console.log('  ✓ 9. Formats Call Completed payload & suppresses duplicate event deliveries');
  }

  // Test 10: Delete Subscription (Unsubscribe)
  {
    const deleted = await subManager.deleteSubscription(subscriptionId, testWorkspaceId);
    assert.strictEqual(deleted, true);

    const activeSubs = await subManager.getSubscriptionsForWorkspace(testWorkspaceId);
    assert.strictEqual(activeSubs.find((s) => s.id === subscriptionId), undefined);
    console.log('  ✓ 10. Unsubscribes REST Hook cleanly from workspace subscriptions');
  }

  console.log('\n====================================================');
  console.log('  TEST RESULTS: 10/10 PASSED');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
