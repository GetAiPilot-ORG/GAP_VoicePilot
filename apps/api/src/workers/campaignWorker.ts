import '../config/env';
import { supabaseAdmin as supabase } from '../config/supabase';
import { VomyraClient } from '../services/voice/providers/vomyra/client';

const provider = new VomyraClient();
const pollMs = Number(process.env.CAMPAIGN_WORKER_POLL_MS || 1000);
let stopping = false;

async function processBatch() {
  const { data: jobs, error } = await supabase.rpc('claim_campaign_dispatch_jobs', { p_limit: 10 });
  if (error) throw error;
  for (const job of jobs || []) {
    try {
      const call = await provider.initiateCall(job.call_payload);
      await supabase.from('campaign_dispatch_jobs').update({ status: 'completed', provider_call_id: call.id, completed_at: new Date().toISOString() }).eq('id', job.id);
      const { count } = await supabase.from('campaign_dispatch_jobs').select('id', { count: 'exact', head: true }).eq('campaign_id', job.campaign_id).in('status', ['pending', 'processing']);
      if ((count || 0) === 0) await supabase.from('campaigns').update({ status: 'completed' }).eq('id', job.campaign_id);
    } catch (error: any) {
      const retry = Number(job.attempts || 0) < 3;
      await supabase.from('campaign_dispatch_jobs').update({ status: retry ? 'pending' : 'failed', available_at: new Date(Date.now() + 30_000).toISOString(), last_error: String(error?.message || error).slice(0, 1000) }).eq('id', job.id);
    }
  }
}

async function run() {
  while (!stopping) {
    try { await processBatch(); } catch (error) { console.error('[CampaignWorker]', error); }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });
void run();
