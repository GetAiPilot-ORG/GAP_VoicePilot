import '../config/env';
import { supabaseAdmin as supabase } from '../config/supabase';
import { VomyraClient } from '../services/voice/providers/vomyra/client';

const provider = new VomyraClient();
const pollMs = Number(process.env.CAMPAIGN_WORKER_POLL_MS || 1000);
let stopping = false;

async function processBatch() {
  const { data: jobs, error } = await supabase.rpc('claim_campaign_dispatch_jobs', { p_limit: 10 });
  if (error) throw error;
  if (jobs && jobs.length > 0) {
    console.log(`[CampaignWorker] Claimed ${jobs.length} pending dispatch job(s).`);
  }
  for (const job of jobs || []) {
    try {
      console.log(`[CampaignWorker] Initiating call for job ${job.id} (campaign: ${job.campaign_id})`);
      const call = await provider.initiateCall(job.call_payload);
      console.log(`[CampaignWorker] Call initiated successfully: ${call.id} for job ${job.id}`);
      await supabase.from('campaign_dispatch_jobs').update({ status: 'completed', provider_call_id: call.id, completed_at: new Date().toISOString() }).eq('id', job.id);
      const { count } = await supabase.from('campaign_dispatch_jobs').select('id', { count: 'exact', head: true }).eq('campaign_id', job.campaign_id).in('status', ['pending', 'processing']);
      if ((count || 0) === 0) {
        console.log(`[CampaignWorker] All jobs finished for campaign ${job.campaign_id}. Setting campaign to completed.`);
        await supabase.from('campaigns').update({ status: 'completed' }).eq('id', job.campaign_id);
      }
    } catch (error: any) {
      const retry = Number(job.attempts || 0) < 3;
      console.error(`[CampaignWorker] Error processing job ${job.id}:`, error.message);
      await supabase.from('campaign_dispatch_jobs').update({ status: retry ? 'pending' : 'failed', available_at: new Date(Date.now() + 30_000).toISOString(), last_error: String(error?.message || error).slice(0, 1000) }).eq('id', job.id);
    }
  }
}

async function run() {
  console.log(`[CampaignWorker] Campaign worker started. Polling every ${pollMs}ms...`);
  while (!stopping) {
    try { 
      await processBatch(); 
    } catch (error: any) { 
      console.error('[CampaignWorker] Poll error:', error.message || error); 
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  console.log('[CampaignWorker] Campaign worker shutting down gracefully.');
}

process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });
void run();

