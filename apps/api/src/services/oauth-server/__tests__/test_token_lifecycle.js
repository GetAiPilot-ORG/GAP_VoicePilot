const express = require('express');
const { oauthServerRouter } = require('../../../../dist/routes/oauthServer');
const { zapierAuthRouter } = require('../../../../dist/routes/zapierAuth');

async function testLifecycle() {
  console.log('----------------------------------------------------');
  console.log('🧪 VERIFYING OAUTH TOKEN LIFECYCLE & ZAPIER AUTH TEST');
  console.log('----------------------------------------------------');

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/oauth', oauthServerRouter);
  app.use('/api/v1/oauth', oauthServerRouter);
  app.use('/api/v1/zapier', zapierAuthRouter);

  app.get('/health', (req, res) => res.json({ status: 'ok', provider: 'vomyra' }));

  const server = app.listen(8099);
  console.log('Lifecycle test server running on port 8099...');

  try {
    const clientId = 'vp_client_zapier_app245289_cli';
    const clientSecret = '7547957957589547hunvjfdbfjnubunufdu';
    const redirectUri = 'https://zapier.com/dashboard/auth/oauth/return/App245289CLIAPI/';

    // 1. GET /oauth/authorize -> redirect with code
    const authUrl = `http://127.0.0.1:8099/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test_state_lifecycle&workspaceId=1ecef1bf-6fcb-4538-8ae1-c48469f2031c&userId=usr_test_123`;
    const authRes = await fetch(authUrl, { redirect: 'manual' });
    const location = authRes.headers.get('location');
    console.log('1. Authorization redirect status:', authRes.status);
    console.log('   Location:', location);

    const redirectUrlObj = new URL(location);
    const code = redirectUrlObj.searchParams.get('code');
    console.log('   Code generated:', code ? `${code.substring(0, 15)}...` : 'NONE');

    // 2. POST /oauth/token (authorization_code) using form-urlencoded
    const tokenRes = await fetch('http://127.0.0.1:8099/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenContentType = tokenRes.headers.get('content-type');
    const tokenData = await tokenRes.json();

    console.log('2. POST /oauth/token (authorization_code) status:', tokenRes.status);
    console.log('   Content-Type:', tokenContentType);
    console.log('   Token Payload:', JSON.stringify(tokenData));

    if (tokenRes.status !== 200) {
      throw new Error(`Token exchange failed with status ${tokenRes.status}`);
    }
    if (typeof tokenData.expires_in !== 'number') {
      throw new Error(`expires_in is not a number: ${typeof tokenData.expires_in}`);
    }
    if (tokenData.token_type !== 'Bearer') {
      throw new Error(`token_type is not Bearer: ${tokenData.token_type}`);
    }

    // 3. GET /api/v1/zapier/auth/test with fresh access token
    const testRes1 = await fetch('http://127.0.0.1:8099/api/v1/zapier/auth/test', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const testData1 = await testRes1.json();
    console.log('3. GET /api/v1/zapier/auth/test (fresh token) status:', testRes1.status);
    console.log('   Returned Profile:', JSON.stringify(testData1, null, 2));

    if (testRes1.status !== 200 || !testData1.id) {
      throw new Error('Fresh access token failed authentication test or missing id property');
    }

    // 4. POST /oauth/token (refresh_token)
    const refreshRes = await fetch('http://127.0.0.1:8099/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokenData.refresh_token,
      }).toString(),
    });

    const refreshData = await refreshRes.json();
    console.log('4. POST /oauth/token (grant_type=refresh_token) status:', refreshRes.status);
    console.log('   Refreshed Access Token:', refreshData.access_token ? `${refreshData.access_token.substring(0, 15)}...` : 'NONE');

    if (refreshRes.status !== 200) {
      throw new Error(`Refresh token exchange failed with status ${refreshRes.status}`);
    }

    // 5. GET /api/v1/zapier/auth/test with refreshed access token
    const testRes2 = await fetch('http://127.0.0.1:8099/api/v1/zapier/auth/test', {
      headers: {
        Authorization: `Bearer ${refreshData.access_token}`,
      },
    });

    const testData2 = await testRes2.json();
    console.log('5. GET /api/v1/zapier/auth/test (refreshed token) status:', testRes2.status);
    console.log('   Returned Profile:', JSON.stringify(testData2, null, 2));

    if (testRes2.status !== 200 || !testData2.id) {
      throw new Error('Refreshed access token failed authentication test');
    }

    console.log('----------------------------------------------------');
    console.log('🎉 ALL TOKEN LIFECYCLE & ZAPIER AUTH TESTS PASSED 100%!');
    console.log('----------------------------------------------------');
  } finally {
    server.close();
  }
}

testLifecycle().catch(err => {
  console.error('Lifecycle test execution failed:', err);
  process.exit(1);
});
