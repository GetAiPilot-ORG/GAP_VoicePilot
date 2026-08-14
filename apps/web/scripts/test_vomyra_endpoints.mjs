const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function checkEndpoints() {
  const endpoints = [
    "/v1/numbers",
    "/v1/phone_numbers",
    "/v1/caller-ids",
    "/v1/account",
    "/v1/me",
    "/v1/user",
    "/v1/wallet",
    "/v1/balance",
    "/v1/billing"
  ];

  console.log("=== Checking Vomyra API Endpoints ===");

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${vomyraBaseUrl}${ep}`, {
        headers: { "x-api-key": vomyraApiKey }
      });
      const contentType = res.headers.get("content-type") || "";
      let text = await res.text();
      if (text.length > 200) text = text.slice(0, 200) + "...";
      console.log(`Endpoint ${ep} -> Status ${res.status} (${contentType}): ${text}`);
    } catch (e) {
      console.error(`Endpoint ${ep} error: ${e.message}`);
    }
  }
}

checkEndpoints();
