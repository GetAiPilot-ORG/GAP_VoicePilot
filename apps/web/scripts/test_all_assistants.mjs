const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function testAll() {
  const num = "+919343418163";
  const astRes = await fetch(`${vomyraBaseUrl}/v1/assistants`, {
    headers: { "x-api-key": vomyraApiKey }
  });
  const astData = await astRes.json();
  const list = astData.data || [];

  console.log(`Found ${list.length} assistants. Testing call initiation for each...`);

  for (const ast of list) {
    const astId = ast.id;
    console.log(`\nTesting Assistant: "${ast.name}" (ID: ${astId})`);
    
    try {
      const res = await fetch(`${vomyraBaseUrl}/v1/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": vomyraApiKey },
        body: JSON.stringify({
          customer_number: num,
          customer_name: "Demo Caller",
          customer_country_code: "+91",
          assistant_id: astId
        })
      });

      const text = await res.text();
      console.log(`  Status ${res.status}: ${text}`);
      if (res.ok || res.status === 200 || res.status === 201) {
        console.log(`>>> SUCCESSFUL ASSISTANT FOUND: ${astId} (${ast.name}) <<<`);
        break;
      }
    } catch (e) {
      console.error("  Fetch error:", e.message);
    }
  }
}

testAll();
