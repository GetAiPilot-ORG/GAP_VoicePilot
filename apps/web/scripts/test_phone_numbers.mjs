const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function main() {
  const res = await fetch(`${vomyraBaseUrl}/v1/phone-numbers`, {
    headers: { "x-api-key": vomyraApiKey }
  });
  console.log("Phone numbers status:", res.status);
  const text = await res.text();
  console.log("Phone numbers body:\n", text);
}

main();
