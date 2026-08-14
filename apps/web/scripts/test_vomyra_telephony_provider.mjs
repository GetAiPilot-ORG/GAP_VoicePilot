const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function testTelephony() {
  console.log("=== VOMYRA TELEPHONY DIAGNOSTICS ===");

  const astId = "6a7d9fd812df58f68ce4f83c";
  const num = "+919343418163";

  // Check GET /v1/calls
  try {
    const res = await fetch(`${vomyraBaseUrl}/v1/calls?limit=5`, {
      headers: { "x-api-key": vomyraApiKey }
    });
    console.log("\nGET /v1/calls status:", res.status);
    console.log("GET /v1/calls body:\n", await res.text());
  } catch (e) {
    console.error("GET /v1/calls error:", e);
  }

  // Check POST /v1/calls with telephony provider parameters
  const variants = [
    { name: "Standard customer_number + assistant_id", body: { customer_number: num, customer_name: "Test User", assistant_id: astId } },
    { name: "With country code", body: { customer_number: "9343418163", customer_country_code: "+91", customer_name: "Test User", assistant_id: astId } },
    { name: "With phone_number key", body: { phone_number: num, customer_number: num, customer_name: "Test User", assistant_id: astId } },
    { name: "With provider: exotel", body: { customer_number: num, customer_name: "Test User", assistant_id: astId, provider: "exotel" } },
    { name: "With provider: twilio", body: { customer_number: num, customer_name: "Test User", assistant_id: astId, provider: "twilio" } },
    { name: "With max_duration_seconds: 60", body: { customer_number: num, customer_name: "Test User", assistant_id: astId, max_duration_seconds: 60 } }
  ];

  for (const v of variants) {
    console.log(`\nTesting variant: ${v.name}`);
    try {
      const res = await fetch(`${vomyraBaseUrl}/v1/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": vomyraApiKey },
        body: JSON.stringify(v.body)
      });
      console.log(`  Status ${res.status}:`, await res.text());
    } catch (e) {
      console.error("  Error:", e);
    }
  }
}

testTelephony();
