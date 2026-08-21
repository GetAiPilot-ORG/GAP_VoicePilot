const clientId = 'vp_client_zapier_app245289_cli';
const clientSecret = '7547957957589547hunvjfdbfjnubunufdu';
const redirectUri = 'https://zapier.com/dashboard/auth/oauth/return/App245289CLIAPI/';
const ngrokHost = 'https://rewash-rematch-repost.ngrok-free.dev';

async function runForensicAudit() {
  console.log('==================================================');
  console.log('🔬 STARTING FORENSIC OAUTH AUDIT FOR ZAPIER');
  console.log('==================================================');

  // Step 1: Authorization Code
  const authUrl = `http://127.0.0.1:8000/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test_state_forensic&workspaceId=1ecef1bf-6fcb-4538-8ae1-c48469f2031c&userId=519f482f-0927-45a0-985e-b1d80a7819ab`;
  const authRes = await fetch(authUrl, { redirect: 'manual' });
  const location = authRes.headers.get('location');

  if (!location || !location.includes('code=')) {
    throw new Error('Failed to obtain code in step 1');
  }

  const code = new URL(location).searchParams.get('code');
  console.log('[Audit] Step 1: Authorization code obtained.');

  // Step 2: POST /oauth/token over NGROK
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

  const tokenContentType = tokenRes.headers.get('content-type');
  const tokenData = await tokenRes.json();
  const tokenKeys = Object.keys(tokenData);

  console.log('[Audit] Step 2: POST /oauth/token received.');
  console.log('  - Status:', tokenRes.status);
  console.log('  - Content-Type:', tokenContentType);
  console.log('  - Top-level keys:', tokenKeys.join(', '));

  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error('No access token returned');
  }

  // Step 3: Check existence 1 second after exchange
  await new Promise(r => setTimeout(r, 1000));
  const test1SecRes = await fetch(`${ngrokHost}/api/v1/zapier/auth/test`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  const tokenExists1s = test1SecRes.status === 200;
  console.log(`[Audit] Token exists 1 second after exchange: ${tokenExists1s ? 'YES' : 'NO'}`);

  // Step 4: Check existence 10 seconds after exchange
  await new Promise(r => setTimeout(r, 9000));
  const test10SecRes = await fetch(`${ngrokHost}/api/v1/zapier/auth/test`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  const tokenExists10s = test10SecRes.status === 200;
  console.log(`[Audit] Token exists 10 seconds after exchange: ${tokenExists10s ? 'YES' : 'NO'}`);

  // Step 5: Zapier Auth Test response shape check
  const authTestData = await test10SecRes.json();
  console.log('[Audit] GET /api/v1/zapier/auth/test received.');
  console.log('  - Status:', test10SecRes.status);
  console.log('  - Header Present: YES');
  console.log('  - Scheme: Bearer');
  console.log('  - Response payload:', JSON.stringify(authTestData, null, 2));

  // Step 6: Check existence after auth test
  const testPostRes = await fetch(`${ngrokHost}/api/v1/zapier/auth/test`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  const tokenExistsAfterTest = testPostRes.status === 200;
  console.log(`[Audit] Token exists after auth test: ${tokenExistsAfterTest ? 'YES' : 'NO'}`);

  console.log('==================================================');
  console.log('🎉 FORENSIC AUDIT COMPLETED SUCCESSFULLY');
  console.log('==================================================');
}

runForensicAudit().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
