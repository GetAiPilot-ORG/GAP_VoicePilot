const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(
  envConfig.NEXT_PUBLIC_SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY
);

async function mergeWorkspaces() {
  console.log('--- Merging Workspaces for priyanshgour817@gmail.com ---');
  
  const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers();
  const targetUser = users.find(u => u.email === 'priyanshgour817@gmail.com');
  
  if (!targetUser) {
    console.log('User not found!');
    return;
  }
  
  // 1. Get workspaces
  const { data: members } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', targetUser.id)
    .order('created_at', { ascending: true });
    
  if (!members || members.length < 2) {
    console.log('User has fewer than 2 workspaces. Nothing to merge.');
    return;
  }
  
  const primaryWorkspaceId = members[0].workspace_id;
  const oldWorkspaceId = members[1].workspace_id; // Merging the newer one into the older one
  
  console.log(`Primary Workspace: ${primaryWorkspaceId}`);
  console.log(`Workspace to Merge & Delete: ${oldWorkspaceId}`);
  
  // 2. Transfer Assistants
  const { data: astData, error: astErr } = await supabase
    .from('assistants')
    .update({ workspace_id: primaryWorkspaceId })
    .eq('workspace_id', oldWorkspaceId)
    .select('id, name');
    
  console.log('Transferred Assistants:', astData || astErr);
  
  // 3. Transfer Phone Numbers
  const { data: pnData, error: pnErr } = await supabase
    .from('phone_numbers')
    .update({ workspace_id: primaryWorkspaceId })
    .eq('workspace_id', oldWorkspaceId)
    .select('id, phone_number');
    
  console.log('Transferred Phone Numbers:', pnData || pnErr);

  // 4. Transfer Call Logs
  const { error: callsErr } = await supabase
    .from('call_logs')
    .update({ workspace_id: primaryWorkspaceId })
    .eq('workspace_id', oldWorkspaceId);
  console.log('Transferred Call Logs:', callsErr ? callsErr.message : 'Success');

  // 5. Transfer Campaigns
  const { error: campErr } = await supabase
    .from('campaigns')
    .update({ workspace_id: primaryWorkspaceId })
    .eq('workspace_id', oldWorkspaceId);
  console.log('Transferred Campaigns:', campErr ? campErr.message : 'Success');

  // 6. Transfer Credits (Merge Balances)
  const { data: oldWs } = await supabase.from('workspaces').select('balance').eq('id', oldWorkspaceId).single();
  const { data: primaryWs } = await supabase.from('workspaces').select('balance').eq('id', primaryWorkspaceId).single();
  
  if (oldWs && primaryWs && oldWs.balance > 0) {
    const newBalance = (primaryWs.balance || 0) + (oldWs.balance || 0);
    const { error: balErr } = await supabase.from('workspaces').update({ balance: newBalance }).eq('id', primaryWorkspaceId);
    console.log(`Merged Credits! New Balance: ${newBalance}`, balErr || '');
  } else {
    console.log('No credits to merge.');
  }

  // 7. Delete old workspace_members link
  const { error: delMemErr } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', oldWorkspaceId)
    .eq('user_id', targetUser.id);
  console.log('Deleted old workspace member link:', delMemErr ? delMemErr.message : 'Success');

  // 8. Delete old workspace
  const { error: delWsErr } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', oldWorkspaceId);
  console.log('Deleted old workspace:', delWsErr ? delWsErr.message : 'Success');
  
  console.log('--- Merge Complete! ---');
}

mergeWorkspaces();
