const fs = require('fs');
const path = require('path');

const filesToFix = [
  'phoneNumbers.ts',
  'calls.ts',
  'billing.ts'
];

for (const file of filesToFix) {
  const filePath = path.join(__dirname, '../apps/web/app/actions', file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the anyWs logic with just creating a new one
  const searchPattern = /const \{ data: anyWs \} = await adminClient\.from\('workspaces'\)\.select\('id'\)\.limit\(1\)\.maybeSingle\(\);\s+if \(anyWs\?\.id\) return anyWs\.id;/g;

  const replaceText = `// Fallback to ANY workspace removed to prevent random assignment`;

  content = content.replace(searchPattern, replaceText);

  // also fix missing order by created_at
  const missingOrder = /\.eq\('user_id', user\.id\)\s+\.limit\(1\)/g;
  content = content.replace(missingOrder, ".eq('user_id', user.id)\n      .order('created_at', { ascending: true })\n      .limit(1)");

  // make sure the newWs creation adds to workspace_members (in these files it didn't)
  const insertPattern = /const \{ data: newWs \} = await adminClient\.from\('workspaces'\)\.insert\(\{ name: 'Default Workspace', owner_id: user\?\.id \|\| '00000000-0000-0000-0000-000000000000' \}\)\.select\(\)\.single\(\);\s+return newWs\.id;/g;

  const replaceInsert = `const { data: newWs } = await adminClient.from('workspaces').insert({ name: \`\${user?.email?.split('@')[0] || 'Default'}'s Workspace\`, owner_id: user?.id || '00000000-0000-0000-0000-000000000000' }).select().single();
  
  if (newWs?.id && user?.id) {
    try {
      await adminClient.from('workspace_members').insert({
        workspace_id: newWs.id,
        user_id: user.id,
        role: 'owner'
      });
    } catch(e) {}
  }
  return newWs.id;`;

  content = content.replace(insertPattern, replaceInsert);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', file);
}
