const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function testWithName() {
  const astId = "6a79b1f312df58f68ce4e836"; // MyBot
  const num = "+919343418163";

  console.log("=== Testing call payload WITH customer_name ===");

  const payload = {
    customer_number: num,
    customer_name: "Harshit Sharma",
    customer_country_code: "+91",
    assistant_id: astId,
    additional_data: {
      source: "demo_test",
      dispatched_at: new Date().toISOString()
    }
  };

  console.log("Sending payload:", JSON.stringify(payload, null, 2));

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
    const responseText = await res.text();
    console.log(`\nHTTP ${status}:`, responseText);
  } catch (err) {
    console.error("Error:", err);
  }
}

testWithName();
