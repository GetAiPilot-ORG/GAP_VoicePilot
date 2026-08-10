const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../apps/web/app/actions');

if (!fs.existsSync(actionsDir)) {
  console.log("Actions dir not found");
  process.exit(1);
}

const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(actionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to replace the fallback logic in getWorkspaceId / getOrCreateWorkspace
  // Let's look for the pattern where it queries 'workspaces' with limit(1) and replace it.
  
  if (content.includes("from('workspaces')") && content.includes("limit(1)")) {
    // This is a bit tricky to regex. I'll just do string replacement for the known blocks.
    
    // Pattern 1: phoneNumbers.ts, calls.ts, billing.ts, campaigns.ts, kyc.ts
    const pattern1 = `  const { data: anyWs } = await adminClient.from('workspaces').select('id').limit(1).maybeSingle();
  if (anyWs?.id) return anyWs.id;

  const { data: newWs } = await adminClient.from('workspaces').insert({ name: 'Default Workspace', owner_id: user?.id || '00000000-0000-0000-0000-000000000000' }).select().single();
  return newWs.id;`;

    // Pattern 2: assistants.ts (getOrCreateWorkspace)
    const pattern2 = `  const { data: anyWs } = await adminClient
    .from('workspaces')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (anyWs?.id) {
    try {
      await adminClient.from('workspace_members').upsert({
        workspace_id: anyWs.id,
        user_id: user.id,
        role: 'owner'
      }, { onConflict: 'workspace_id,user_id' });
    } catch (e) {}
    return anyWs.id;
  }`;

    const newFallback = `  const { data: newWs } = await adminClient.from('workspaces').insert({ 
    name: \`\${user?.email?.split('@')[0] || 'Default'}'s Workspace\`, 
    owner_id: user?.id || '00000000-0000-0000-0000-000000000000',
    status: 'active'
  }).select('id').single();

  if (newWs?.id && user?.id) {
    try {
      await adminClient.from('workspace_members').insert({
        workspace_id: newWs.id,
        user_id: user.id,
        role: 'owner'
      });
    } catch (e) {}
    return newWs.id;
  }
  return newWs?.id || '';`;

    if (content.includes(pattern1)) {
        content = content.replace(pattern1, newFallback);
        console.log(`Fixed pattern 1 in ${file}`);
    } else if (content.includes(pattern2)) {
        content = content.replace(pattern2, newFallback);
        console.log(`Fixed pattern 2 in ${file}`);
    } else {
        console.log(`Pattern not matched exactly in ${file}, you may need to check it.`);
    }

    // Also replace the missing order('created_at', { ascending: true }) in some files
    const missingOrderPattern = `.eq('user_id', user.id)
      .limit(1)`;
    const newOrderPattern = `.eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)`;
      
    if (content.includes(missingOrderPattern)) {
        content = content.replace(missingOrderPattern, newOrderPattern);
        console.log(`Added order by created_at in ${file}`);
    }
    
    // For assistants.ts where it might use user.id directly
    const missingOrderPattern2 = `.eq('user_id', user.id)
    .limit(1)`;
    const newOrderPattern2 = `.eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)`;
    
    if (content.includes(missingOrderPattern2)) {
        content = content.replace(missingOrderPattern2, newOrderPattern2);
        console.log(`Added order by created_at (pattern 2) in ${file}`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
}
