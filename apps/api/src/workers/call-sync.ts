import { Worker, Job } from 'bullmq';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import IORedis from 'ioredis';

// Assuming local Redis for now
const connection = new IORedis({ maxRetriesPerRequest: null });
connection.on('error', (err) => {
  // Ignore connection errors to prevent app crash if Redis isn't running locally
});
const voiceProvider = new VomyraClient();

export const callSyncWorker = new Worker('call-sync', async (job: Job) => {
  const { providerResourceId } = job.data;
  
  console.log(`[Worker] Polling call status for provider id: ${providerResourceId}`);
  
  const callStatus = await voiceProvider.getCall(providerResourceId);
  console.log(`[Worker] Call status:`, callStatus);

  if (callStatus.status === 'completed' || callStatus.status === 'failed') {
    console.log(`[Worker] Call reached terminal state. Settling billing...`);
    
    // 1. Release reservation
    // await db.query(`INSERT INTO credit_ledger (workspace_id, type, amount, call_id) VALUES ($1, 'reservation_release', $2, $3)`, [workspaceId, estimatedCost, callId]);
    
    // 2. Charge actual cost
    // const actualCost = calculateCost(callStatus.duration_seconds);
    // await db.query(`INSERT INTO credit_ledger (workspace_id, type, amount, call_id) VALUES ($1, 'charge', $2, $3)`, [workspaceId, -actualCost, callId]);
    
    // 3. Write usage event
    // await db.query(`INSERT INTO usage_events (workspace_id, call_id, duration_seconds, provider_cost, customer_cost) VALUES (...)`);
    
    return callStatus;
  }
  
  // If not terminal, throw an error to let BullMQ retry based on backoff config,
  // or re-enqueue a delayed job.
  throw new Error('Call not yet completed. Retrying...');
}, {
  connection,
  limiter: {
    max: 10,
    duration: 1000,
  }
});

callSyncWorker.on('completed', (job: Job) => {
  console.log(`Job ${job.id} completed successfully`);
});

callSyncWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.log(`Job ${job?.id} failed with ${err.message}`);
});
