const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function testCall() {
  const assistantId = "6a79b1f312df58f68ce4e836";
  const customerNumber = "+919343418163";

  console.log("=== Testing direct call POST to Vomyra API ===");
  console.log("Endpoint:", `${vomyraBaseUrl}/v1/calls`);
  console.log("API Key:", vomyraApiKey);
  
  const payload = {
    customer_number: customerNumber,
    customer_name: "Test Caller",
    customer_country_code: "+91",
    assistant_id: assistantId,
    additional_data: {
      source: "diagnostics_test",
      dispatched_at: new Date().toISOString()
    }
  };

  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(`${vomyraBaseUrl}/v1/calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": vomyraApiKey
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const text = await res.text();
    console.log(`\nVomyra API HTTP Status: ${status}`);
    console.log(`Vomyra API Raw Response:\n${text}`);
  } catch (err) {
    console.error("Fetch Exception:", err);
  }
}

testCall();
