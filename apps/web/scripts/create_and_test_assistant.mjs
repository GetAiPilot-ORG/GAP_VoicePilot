const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

async function createAndTest() {
  console.log("=== Creating fresh Vomyra Assistant ===");
  const createPayload = {
    name: "VoicePilot Public Demo Agent 2026",
    model: "gpt-4o-mini",
    prompt: "You are VoicePilot AI Assistant. Greet the customer and explain that this is a 60-second live test call for GAP VoicePilot. Speak in friendly Hindi and English.",
    voice: {
      provider: "vomyra",
      voice_id: "hindi_female_1",
      speed: 1.0
    },
    first_message: "Namaste! Hello from GAP VoicePilot. This is your live 60-second AI test call. How are you doing today?",
    silence_timeout_ms: 5000,
    max_duration_seconds: 60
  };

  try {
    const res = await fetch(`${vomyraBaseUrl}/v1/assistants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": vomyraApiKey
      },
      body: JSON.stringify(createPayload)
    });

    const createText = await res.text();
    console.log("Create assistant HTTP:", res.status);
    console.log("Create assistant response:", createText);

    let createdData = {};
    try { createdData = JSON.parse(createText); } catch {}
    const newAst = createdData.data || createdData;
    const newAstId = newAst.id || newAst._id;

    if (newAstId) {
      console.log(`\nCreated New Assistant ID: ${newAstId}`);
      console.log("=== Initiating call with new assistant ===");

      const callRes = await fetch(`${vomyraBaseUrl}/v1/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": vomyraApiKey
        },
        body: JSON.stringify({
          customer_number: "+919343418163",
          customer_name: "Harshit Sharma",
          customer_country_code: "+91",
          assistant_id: newAstId
        })
      });

      console.log("Call initiation HTTP:", callRes.status);
      console.log("Call initiation response:", await callRes.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

createAndTest();
