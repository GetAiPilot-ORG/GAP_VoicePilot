const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function testNoPlus() {
  const assistantsToTest = [
    { id: "6a7b0170380daa8620b019ba", name: "receptionist hospital" },
    { id: "6a7acfe912df58f68ce4ec97", name: "BOT Number 2" },
    { id: "6a7a09f44c5adbb22549936f", name: "Nia - Misat Vincy v1" },
    { id: "6a7d9fd812df58f68ce4f83c", name: "VoicePilot Public Demo Agent 2026" }
  ];

  const numberFormats = [
    "919343418163",         // 91 + 10 digits (no +)
    "+919343418163",        // +91 + 10 digits
    "9343418163"            // 10 digits
  ];

  for (const ast of assistantsToTest) {
    console.log(`\n=== Testing Assistant: ${ast.name} (${ast.id}) ===`);
    for (const num of numberFormats) {
      try {
        const payload = {
          customer_number: num,
          customer_name: "Harshit Sharma",
          assistant_id: ast.id
        };

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
        console.log(`  Format "${num}" -> Status ${status}: ${text}`);
        if (status === 200 || status === 201) {
          console.log(`\n🎉 SUCCESSFUL CALL CREATED! Assistant: ${ast.id}, Number: ${num}`);
          return;
        }
      } catch (e) {
        console.error(`  Error: ${e.message}`);
      }
    }
  }
}

testNoPlus();
