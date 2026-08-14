const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function testBonvoiceCall() {
  console.log("=== Testing Call with Bonvoice Assigned Number 7943494977 ===");

  const assignedNumber = "7943494977";
  const customerNumber = "+919343418163";
  const assistantId = "6a7b0170380daa8620b019ba";

  const variants = [
    {
      name: "Variant 1: assigned_number + customer_number + assistant_id",
      body: {
        customer_number: customerNumber,
        customer_name: "Harshit Sharma",
        assigned_number: assignedNumber,
        assistant_id: assistantId
      }
    },
    {
      name: "Variant 2: assigned_number + customer_number (+917943494977)",
      body: {
        customer_number: customerNumber,
        customer_name: "Harshit Sharma",
        assigned_number: "+91" + assignedNumber,
        assistant_id: assistantId
      }
    },
    {
      name: "Variant 3: assigned_number ONLY (no assistant_id)",
      body: {
        customer_number: customerNumber,
        customer_name: "Harshit Sharma",
        assigned_number: assignedNumber
      }
    },
    {
      name: "Variant 4: assigned_number + 10 digit customer_number (9343418163)",
      body: {
        customer_number: "9343418163",
        customer_name: "Harshit Sharma",
        customer_country_code: "+91",
        assigned_number: assignedNumber
      }
    }
  ];

  for (const v of variants) {
    console.log(`\nTesting: ${v.name}`);
    console.log("Payload:", JSON.stringify(v.body));

    try {
      const res = await fetch(`${vomyraBaseUrl}/v1/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": vomyraApiKey
        },
        body: JSON.stringify(v.body)
      });

      const status = res.status;
      const responseText = await res.text();
      console.log(`Status ${status}:`, responseText);
      if (status === 200 || status === 201) {
        console.log("\n🎉 🎉 🎉 PHONE CALL SUCCESSFULLY PLACED TO MOBILE NUMBER! 🎉 🎉 🎉");
        return;
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
}

testBonvoiceCall();
