const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function main() {
  const astId = "6a7d9fd812df58f68ce4f83c";
  
  console.log("=== 1. Checking Vomyra GET /v1/phone-numbers ===");
  try {
    const res = await fetch(`${vomyraBaseUrl}/v1/phone-numbers`, {
      headers: { "x-api-key": vomyraApiKey }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Text:", text);
  } catch (e) { console.error(e); }
}

main();
