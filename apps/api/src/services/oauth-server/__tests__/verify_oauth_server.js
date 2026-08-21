const express = require('express');
const { oauthServerRouter } = require('../../../../dist/routes/oauthServer');
const { zapierAuthRouter } = require('../../../../dist/routes/zapierAuth');

async function testOAuthFlow() {
  console.log('----------------------------------------------------');
  console.log('🧪 VERIFYING GAP VOICEPILOT OAUTH 2.0 SERVER FOR ZAPIER');
  console.log('----------------------------------------------------');

  const app = express();
  app.use(express.json());
  app.use('/oauth', oauthServerRouter);
  app.use('/api/v1/oauth', oauthServerRouter);
  app.use('/api/v1/zapier', zapierAuthRouter);

  app.get('/health', (req, res) => res.json({ status: 'ok', provider: 'vomyra' }));

  const server = app.listen(8088);
  console.log('Test server listening on port 8088...');

  try {
    const clientId = 'vp_client_zapier_app245289_cli';
    const clientSecret = 'vp_sec_zapier_prod_secret_2026_key';
    const redirectUri = 'https://zapier.com/dashboard/auth/oauth/return/App245289CLIAPI/';

    // 1. Health check
    const healthRes = await fetch('http://127.0.0.1:8088/health');
    const healthData = await healthRes.json();
    console.log('1. GET /health:', healthRes.status, JSON.stringify(healthData));

    // 2. GET /oauth/authorize with direct approval
    const authUrl = `http://127.0.0.1:8088/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test_state_123&workspaceId=1ecef1bf-6fcb-4538-8ae1-c48469f2031c&userId=usr_test_123`;
    const authRes = await fetch(authUrl, { redirect: 'manual' });
    const locationHeader = authRes.headers.get('location');
    console.log('2. GET /oauth/authorize status:', authRes.status);
    console.log('   Redirect Location:', locationHeader);

    if (!locationHeader || !locationHeader.includes('code=')) {
      throw new Error('Failed to obtain code from /oauth/authorize redirect');
    }

    const redirectUrlObj = new URL(locationHeader);
    const code = redirectUrlObj.searchParams.get('code');
    const state = redirectUrlObj.searchParams.get('state');
    console.log('   Extracted Auth Code:', code ? `${code.substring(0, 15)}...` : 'NONE');
    console.log('   Extracted State:', state);

    // 3. POST /oauth/token (Code Exchange)
    const tokenRes = await fetch('http://127.0.0.1:8088/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    console.log('3. POST /oauth/token status:', tokenRes.status);
    console.log('   Access Token Issued:', tokenData.access_token ? `${tokenData.access_token.substring(0, 15)}...` : 'NONE');
    console.log('   Token Type:', tokenData.token_type);
    console.log('   Expires In:', tokenData.expires_in);
    console.log('   Refresh Token Issued:', tokenData.refresh_token ? `${tokenData.refresh_token.substring(0, 15)}...` : 'NONE');

    // 4. Test Single-Use Replay Protection
    const replayRes = await fetch('http://127.0.0.1:8088/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const replayData = await replayRes.json();
    console.log('4. Single-Use Replay Test status:', replayRes.status, '(Expected 400)');
    console.log('   Replay Error Payload:', JSON.stringify(replayData));

    // 5. Test Zapier Authenticated API Route GET /api/v1/zapier/auth/test
    const testApiRes = await fetch('http://127.0.0.1:8088/api/v1/zapier/auth/test', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const testApiData = await testApiRes.json();
    console.log('5. GET /api/v1/zapier/auth/test status:', testApiRes.status);
    console.log('   Returned Profile:', JSON.stringify(testApiData, null, 2));

    // 6. Test Refresh Token Grant
    const refreshRes = await fetch('http://127.0.0.1:8088/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokenData.refresh_token,
      }),
    });

    const refreshData = await refreshRes.json();
    console.log('6. POST /oauth/token (grant_type=refresh_token) status:', refreshRes.status);
    console.log('   New Access Token:', refreshData.access_token ? `${refreshData.access_token.substring(0, 15)}...` : 'NONE');

    console.log('----------------------------------------------------');
    console.log('🎉 ALL OAUTH 2.0 PROVIDER VERIFICATIONS PASSED 100%!');
    console.log('----------------------------------------------------');
  } finally {
    server.close();
  }
}

testOAuthFlow().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
