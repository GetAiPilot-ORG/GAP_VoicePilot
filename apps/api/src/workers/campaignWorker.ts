import '../config/env';
import { supabaseAdmin as supabase } from '../config/supabase';
import { VomyraClient } from '../services/voice/providers/vomyra/client';

const provider = new VomyraClient();
const pollMs = Number(process.env.CAMPAIGN_WORKER_POLL_MS || 1000);
let stopping = false;

function classifyDispatchError(error: any): { status: 'needs_reconciliation' | 'failed' | 'pending'; reason: string } {
  const msg = String(error?.message || error || '').toLowerCase();
  
  // 1. Ambiguous 5xx responses or timeouts from provider: DO NOT auto-redial
  if (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('etimedout') ||
    msg.includes('esockettimedout') ||
    msg.includes('econnreset') ||
    msg.includes('failed to initiate call') ||
    msg.includes('gateway')
  ) {
    return {
      status: 'needs_reconciliation',
      reason: 'Ambiguous downstream provider response (5xx/Timeout). Held for reconciliation to prevent duplicate dials.'
    };
  }

  // 2. Deterministic client/validation errors: Permanent failure, no retry
  if (
    msg.includes('400') ||
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('404') ||
    msg.includes('invalid') ||
    msg.includes('unauthorized') ||
    msg.includes('forbidden')
  ) {
    return {
      status: 'failed',
      reason: 'Deterministic validation or authorization error.'
    };
  }

  // 3. Known transient local errors before HTTP request sent: Allow retry if attempts < 3
  return {
    status: 'failed',
    reason: 'Non-retryable execution error.'
  };
}

async function processBatch() {
  const { data: jobs, error } = await supabase.rpc('claim_campaign_dispatch_jobs', { p_limit: 10 });
  if (error) throw error;
  if (jobs && jobs.length > 0) {
    console.log(`[CampaignWorker] Claimed ${jobs.length} pending dispatch job(s).`);
  }
  for (const job of jobs || []) {
    try {
      console.log(`[CampaignWorker] Initiating call for job ${job.id} (campaign: ${job.campaign_id}, recipient: ${job.call_payload?.customer_number})`);
      
      // Inject dispatch_job_id and idempotency_key into additional_data
      const payload = {
        ...job.call_payload,
        additional_data: {
          ...(job.call_payload?.additional_data || {}),
          dispatch_job_id: job.id,
          idempotency_key: `job_${job.id}`
        }
      };

      const call = await provider.initiateCall(payload);
      console.log(`[CampaignWorker] Call initiated successfully: ${call.id} for job ${job.id}`);
      
      await supabase
        .from('campaign_dispatch_jobs')
        .update({
          status: 'completed',
          provider_call_id: call.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // Check if campaign is finished
      const { count: pendingCount } = await supabase
        .from('campaign_dispatch_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', job.campaign_id)
        .in('status', ['pending', 'processing']);

      if ((pendingCount || 0) === 0) {
        const { count: reconCount } = await supabase
          .from('campaign_dispatch_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', job.campaign_id)
          .eq('status', 'needs_reconciliation');

        const finalStatus = (reconCount || 0) > 0 ? 'needs_reconciliation' : 'completed';
        console.log(`[CampaignWorker] Campaign ${job.campaign_id} queue finished. Final status: ${finalStatus}`);
        await supabase.from('campaigns').update({ status: finalStatus }).eq('id', job.campaign_id);
      }
    } catch (error: any) {
      const classification = classifyDispatchError(error);
      console.error(
        `[CampaignWorker] Error processing job ${job.id} [Marked: ${classification.status}]:`,
        error.message || error
      );

      await supabase
        .from('campaign_dispatch_jobs')
        .update({
          status: classification.status,
          available_at: new Date(Date.now() + 60_000).toISOString(),
          last_error: `${classification.reason} Details: ${String(error?.message || error).slice(0, 800)}`
        })
        .eq('id', job.id);

      // If all jobs are processed, update campaign status accordingly
      const { count: remainingActive } = await supabase
        .from('campaign_dispatch_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', job.campaign_id)
        .in('status', ['pending', 'processing']);

      if ((remainingActive || 0) === 0) {
        const { count: reconCount } = await supabase
          .from('campaign_dispatch_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', job.campaign_id)
          .eq('status', 'needs_reconciliation');

        const finalStatus = (reconCount || 0) > 0 ? 'needs_reconciliation' : 'completed';
        console.log(`[CampaignWorker] Campaign ${job.campaign_id} queue finished after error. Final status: ${finalStatus}`);
        await supabase.from('campaigns').update({ status: finalStatus }).eq('id', job.campaign_id);
      }
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

