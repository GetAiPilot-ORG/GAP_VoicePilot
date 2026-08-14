const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function diagnose() {
  console.log("=== 1. Checking GET /v1/phone-numbers ===");
  try {
    const res = await fetch(`${vomyraBaseUrl}/v1/phone-numbers`, {
      headers: { "x-api-key": vomyraApiKey }
    });
    console.log("Phone Numbers HTTP:", res.status);
    console.log("Phone Numbers Data:", await res.text());
  } catch (e) { console.error(e); }

  console.log("\n=== 2. Checking GET /v1/assistants ===");
  try {
    const res = await fetch(`${vomyraBaseUrl}/v1/assistants`, {
      headers: { "x-api-key": vomyraApiKey }
    });
    console.log("Assistants HTTP:", res.status);
    const text = await res.text();
    console.log("Assistants Data:", text);
  } catch (e) { console.error(e); }

  console.log("\n=== 3. Testing POST /v1/calls variants ===");
  const testAssistants = [
    "6a79b1f312df58f68ce4e836",
    "6a7d9b8812df58f68ce4f7b9",
    "6a7c600112df58f68ce4f3f6",
    "6a7ac3b712df58f68ce4eb06"
  ];

  for (const astId of testAssistants) {
    console.log(`\nTesting Assistant ID: ${astId}`);
    
    // Variant A: +919343418163
    try {
      const resA = await fetch(`${vomyraBaseUrl}/v1/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": vomyraApiKey },
        body: JSON.stringify({
          customer_number: "+919343418163",
          customer_name: "Test User",
          assistant_id: astId
        })
      });
      console.log(`  Format +919343418163 -> Status ${resA.status}: ${await resA.text()}`);
    } catch (e) { console.error(e); }

    // Variant B: 9343418163 (10 digits)
    try {
      const resB = await fetch(`${vomyraBaseUrl}/v1/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": vomyraApiKey },
        body: JSON.stringify({
          customer_number: "9343418163",
          customer_country_code: "+91",
          customer_name: "Test User",
          assistant_id: astId
        })
      });
      console.log(`  Format 9343418163 -> Status ${resB.status}: ${await resB.text()}`);
    } catch (e) { console.error(e); }
  }
}

diagnose();
