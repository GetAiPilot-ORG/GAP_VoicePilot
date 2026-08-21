const clientId = 'vp_client_zapier_app245289_cli';
const clientSecret = '7547957957589547hunvjfdbfjnubunufdu';
const redirectUri = 'https://zapier.com/dashboard/auth/oauth/return/App245289CLIAPI/';
const ngrokHost = 'https://rewash-rematch-repost.ngrok-free.dev';

async function runAccessTokenOnlyNgrokTest() {
  console.log('----------------------------------------------------');
  console.log('🧪 VERIFYING ACCESS-TOKEN-ONLY MODE & NGROK PERSISTENCE');
  console.log('----------------------------------------------------');

  // 1. GET /oauth/authorize via local server port 8000
  const authUrl = `http://127.0.0.1:8000/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test_state_access_only&workspaceId=1ecef1bf-6fcb-4538-8ae1-c48469f2031c&userId=519f482f-0927-45a0-985e-b1d80a7819ab`;
  const authRes = await fetch(authUrl, { redirect: 'manual' });
  const location = authRes.headers.get('location');
  console.log('1. GET /oauth/authorize status:', authRes.status);
  console.log('   Location:', location);

  if (!location || !location.includes('code=')) {
    throw new Error('Failed to obtain authorization code');
  }

  const code = new URL(location).searchParams.get('code');
  console.log('   Code:', code ? `${code.substring(0, 15)}...` : 'NONE');

  // 2. POST /oauth/token over public NGROK tunnel with form-urlencoded
  const tokenRes = await fetch(`${ngrokHost}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'ngrok-skip-browser-warning': 'true',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  const tokenData = await tokenRes.json();
  console.log('2. POST /oauth/token via NGROK status:', tokenRes.status);
  console.log('   Token Response exact JSON shape:', JSON.stringify(tokenData, null, 2));

  if (tokenRes.status !== 200 || !tokenData.access_token) {
    throw new Error('Token exchange over ngrok failed');
  }

  // 3. GET /api/v1/zapier/auth/test over public NGROK tunnel with issued Bearer token
  const authTestRes = await fetch(`${ngrokHost}/api/v1/zapier/auth/test`, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  const authTestData = await authTestRes.json();
  console.log('3. GET /api/v1/zapier/auth/test via NGROK status:', authTestRes.status);
  console.log('   Auth Test Response exact JSON shape:', JSON.stringify(authTestData, null, 2));

  if (authTestRes.status !== 200 || !authTestData.id) {
    throw new Error('Auth test over ngrok failed');
  }

  console.log('----------------------------------------------------');
  console.log('🎉 ALL ACCESS-TOKEN-ONLY & NGROK PERSISTENCE TESTS PASSED 100%!');
  console.log('----------------------------------------------------');
}

runAccessTokenOnlyNgrokTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
