import { Worker, Job } from 'bullmq';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });
connection.on('error', (err) => {
  // Ignore connection errors to prevent app crash if Redis isn't running locally
});
const voiceProvider = new VomyraClient();

export const callDispatchWorker = new Worker('call-dispatch', async (job: Job) => {
  const { campaignContactId, to, from, assistantId, idempotencyKey } = job.data;
  
  console.log(`[Dispatch Worker] Dispatching call for contact: ${campaignContactId}`);
  
  // 1. Reserve credits
  // const estimatedCost = 0.50; // example cost
  // await db.query(`INSERT INTO credit_ledger (workspace_id, type, amount, call_id) VALUES ($1, 'reservation', $2, $3)`, [workspaceId, -estimatedCost, callId]);
  
  try {
    const callResponse = await voiceProvider.initiateCall({
      idempotency_key: idempotencyKey,
      assistant_id: assistantId,
      customer_number: to,
      customer_name: 'Customer'
    });
    
    console.log(`[Dispatch Worker] Call initiated:`, callResponse);
    
    // 2. Queue sync job
    // await callSyncQueue.add('sync', { providerResourceId: callResponse.id, callId, workspaceId }, { delay: 5000 });
    
    return callResponse;
  } catch (error) {
    console.error(`[Dispatch Worker] Failed to initiate call:`, error);
    // 3. Release reservation on failure
    // await db.query(`INSERT INTO credit_ledger (workspace_id, type, amount, call_id) VALUES ($1, 'reservation_release', $2, $3)`, [workspaceId, estimatedCost, callId]);
    throw error;
  }
}, {
  connection,
  concurrency: 5 // Per-workspace concurrency limits would be handled dynamically
});
