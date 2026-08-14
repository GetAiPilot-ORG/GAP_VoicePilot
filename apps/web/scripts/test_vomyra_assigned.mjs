const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function testCombinations() {
  const astId = "6a79b1f312df58f68ce4e836";
  const num = "+919343418163";

  console.log("=== Testing call payloads ===");

  const payloads = [
    {
      name: "Payload 1: assistant_id + phone_number",
      body: { phone_number: num, customer_number: num, assistant_id: astId }
    },
    {
      name: "Payload 2: assistant_id + to",
      body: { to: num, customer_number: num, assistant_id: astId }
    },
    {
      name: "Payload 3: assistant_id + customer_number + assigned_number (+918047481234)",
      body: { customer_number: num, assistant_id: astId, assigned_number: "+918047481234" }
    },
    {
      name: "Payload 4: assistant_id + customer_number + assigned_number (918047481234)",
      body: { customer_number: num, assistant_id: astId, assigned_number: "918047481234" }
    },
    {
      name: "Payload 5: assigned_number only (+918047481234)",
      body: { customer_number: num, assigned_number: "+918047481234" }
    }
  ];

  for (const p of payloads) {
    try {
      console.log(`\n--- ${p.name} ---`);
      const res = await fetch(`${vomyraBaseUrl}/v1/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": vomyraApiKey },
        body: JSON.stringify(p.body)
      });
      console.log(`HTTP ${res.status}:`, await res.text());
    } catch (e) {
      console.error("Error:", e);
    }
  }
}

testCombinations();
