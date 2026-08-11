const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const env = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: users } = await supabase.from('workspace_members').select('user_id').eq('workspace_id', 'e7d5d195-a881-4e09-83d5-c64cd3b3e4bd').limit(1);
  const userId = users[0]?.user_id;

  const { data: dbAssistants } = await supabase
    .from("assistants")
    .select("id, name")
    .in("workspace_id", ['e7d5d195-a881-4e09-83d5-c64cd3b3e4bd'])
    .is("deleted_at", null);

  console.log("Assistants:", dbAssistants);

  const userAssistantIds = new Set(dbAssistants?.map(a => a.id) || []);
  const userAssistantNames = new Set(dbAssistants?.map(a => a.name) || []);

  const res = await fetch(`${env.VOMYRA_BASE_URL}/v1/calls?limit=100`, {
    headers: { 'x-api-key': env.VOMYRA_API_KEY },
  });
  
  if (res.ok) {
    const data = await res.json();
    const rawCalls = data.data || data.calls || (Array.isArray(data) ? data : []);
    console.log("Total Raw Calls from API:", rawCalls.length);

    if (rawCalls.length > 0) {
      console.log("Sample Raw Call Assistant Info:", {
        id: rawCalls[0].assistant?.id,
        name: rawCalls[0].assistant?.name,
        campaign_name: rawCalls[0].additional_data?.campaign_name
      });
    }

    const filteredCalls = rawCalls.filter((c) => {
      const astId = c.assistant?.id || "";
      const astName = c.assistant?.name || (c.additional_data?.campaign_name || "");
      return userAssistantIds.has(astId) || userAssistantNames.has(astName);
    });

    console.log("Filtered Calls Count:", filteredCalls.length);
  } else {
    console.log("Vomyra API Error:", res.status, await res.text());
  }
}
run();
