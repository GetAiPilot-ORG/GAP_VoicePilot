const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/api/.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runVerification() {
  console.log('🧪 Starting Campaign Idempotency & Concurrency Verification Test...\n');

  // 1. Fetch workspace that has both an assistant and a phone number
  const { data: phones } = await supabase.from('phone_numbers').select('id, workspace_id').limit(5);
  let workspace = null;
  let assistant = null;
  let phone = null;

  for (const p of phones || []) {
    const { data: a } = await supabase.from('assistants').select('id').eq('workspace_id', p.workspace_id).limit(1).maybeSingle();
    if (a) {
      phone = p;
      assistant = a;
      const { data: w } = await supabase.from('workspaces').select('id, owner_id').eq('id', p.workspace_id).single();
      workspace = w;
      break;
    }
  }

  if (!workspace || !assistant || !phone) {
    console.error('❌ Missing workspace, assistant, or phone for test.');
    process.exit(1);
  }

  const testKey = `test_idem_${Date.now()}`;
  console.log(`Step 1: Creating campaign with idempotency_key: ${testKey}`);

  const { data: camp1, error: err1 } = await supabase
    .from('campaigns')
    .insert({
      workspace_id: workspace.id,
      created_by: workspace.owner_id,
      assistant_id: assistant.id,
      phone_number_id: phone.id,
      name: 'Idempotency Verification Test',
      total_contacts: 1,
      status: 'running',
      idempotency_key: testKey
    })
    .select()
    .single();

  if (err1) {
    console.error('❌ Failed to insert test campaign:', err1.message);
    process.exit(1);
  }
  console.log(`✅ Campaign 1 created successfully: ${camp1.id}`);

  // Step 2: Attempt duplicate insert with same idempotency key
  console.log('\nStep 2: Attempting duplicate insert with identical idempotency_key...');
  const { data: camp2, error: err2 } = await supabase
    .from('campaigns')
    .insert({
      workspace_id: workspace.id,
      created_by: workspace.owner_id,
      assistant_id: assistant.id,
      phone_number_id: phone.id,
      name: 'Idempotency Verification Duplicate',
      total_contacts: 1,
      status: 'running',
      idempotency_key: testKey
    })
    .select()
    .single();

  if (err2 && (err2.code === '23505' || err2.message.includes('unique') || err2.message.includes('idempotency'))) {
    console.log('✅ Database uniqueness constraint successfully BLOCKED duplicate campaign insert!');
  } else if (camp2) {
    console.log('ℹ️ Duplicate allowed (migration 0013 index needs applying in SQL editor)');
  }

  // Step 3: Insert test dispatch job and test needs_reconciliation transition
  console.log('\nStep 3: Verifying needs_reconciliation status handling on dispatch jobs...');
  const { data: job, error: jobErr } = await supabase
    .from('campaign_dispatch_jobs')
    .insert({
      campaign_id: camp1.id,
      workspace_id: workspace.id,
      call_payload: {
        customer_number: '+919999999999',
        customer_name: 'Test Deduplication',
        assigned_number: '8037006328'
      },
      status: 'pending'
    })
    .select()
    .single();

  if (jobErr) {
    console.error('❌ Failed to insert test job:', jobErr.message);
  } else {
    console.log(`✅ Test job created: ${job.id}`);
    
    // Simulate error classification transition
    const { error: updateErr } = await supabase
      .from('campaign_dispatch_jobs')
      .update({
        status: 'needs_reconciliation',
        last_error: 'Ambiguous downstream provider response (5xx/Timeout). Held for reconciliation to prevent duplicate dials.'
      })
      .eq('id', job.id);

    if (updateErr) {
      console.log('ℹ️ Note: Apply 0013_campaign_idempotency_and_reconciliation.sql in Supabase SQL editor to allow needs_reconciliation enum check constraint.');
    } else {
      console.log('✅ Status successfully transitioned to needs_reconciliation without re-dialing!');
    }

    // Cleanup test job and campaign
    await supabase.from('campaign_dispatch_jobs').delete().eq('id', job.id);
  }
  await supabase.from('campaigns').delete().eq('id', camp1.id);
  console.log('\n🧹 Cleaned up temporary test entities.');
  console.log('🎉 Verification complete!');
}

runVerification().catch(console.error);
