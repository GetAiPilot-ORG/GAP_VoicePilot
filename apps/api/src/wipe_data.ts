import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeData() {
  const email = 'mylogins817@gmail.com';
  
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email);
    
  if (profileErr || !profiles || profiles.length === 0) {
    console.error("Could not find user profile for", email, profileErr);
    process.exit(1);
  }
  
  const userId = profiles[0].id;
  
  const { data: workspaces, error: wsErr } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId);
    
  if (wsErr || !workspaces || workspaces.length === 0) {
    console.error("Could not find workspace for user", wsErr);
    process.exit(1);
  }
  
  const workspaceIds = workspaces.map(w => w.id);
  console.log("Found Workspace IDs:", workspaceIds);
  
  for (const workspaceId of workspaceIds) {
    console.log(`\n--- Wiping ALL Data for Workspace ${workspaceId} ---`);
    
    // Order matters to avoid foreign key constraint errors
    await supabase.from('calls').delete().eq('workspace_id', workspaceId);
    await supabase.from('campaign_contacts').delete().eq('workspace_id', workspaceId);
    await supabase.from('campaigns').delete().eq('workspace_id', workspaceId);
    await supabase.from('contacts').delete().eq('workspace_id', workspaceId);
    
    // Some tables might reference assistants
    await supabase.from('assistant_tools').delete().eq('workspace_id', workspaceId);
    await supabase.from('assistants').delete().eq('workspace_id', workspaceId);
    
    // Telecom and billing
    await supabase.from('kyc_requests').delete().eq('workspace_id', workspaceId);
    await supabase.from('phone_numbers').delete().eq('workspace_id', workspaceId);
    await supabase.from('number_claims').delete().eq('workspace_id', workspaceId);
    await supabase.from('payment_intents').delete().eq('workspace_id', workspaceId);
    await supabase.from('credit_ledger').delete().eq('workspace_id', workspaceId);
    await supabase.from('workspace_subscriptions').delete().eq('workspace_id', workspaceId);
    
    // Reset entitlements
    await supabase.from('workspaces').update({ dedicated_number_entitlements: 0 }).eq('id', workspaceId);
    console.log("Completely wiped all data.");
  }
  
  console.log("\nData wipe complete!");
}

wipeData().catch(console.error);
