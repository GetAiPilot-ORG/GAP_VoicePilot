import { Router, Request, Response } from 'express';
import { IdempotencyManager } from '../services/events/IdempotencyManager';
import { VomyraNormalizer } from '../services/events/VomyraNormalizer';
import { EventBus } from '../services/events/EventBus';
import { supabaseAdmin as supabase } from '../config/supabase';

export const webhookRouter = Router();

// POST /api/v1/webhooks/vomyra - Ingest Real-time Call Events from Vomyra
webhookRouter.post('/vomyra', async (req: Request, res: Response) => {
  const sig = req.headers['x-vomyra-signature'] as string;
  const secret = process.env.VOMYRA_WEBHOOK_SECRET;

  // 1. Signature Verification
  if (secret && sig) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!IdempotencyManager.verifySignature(rawBody, sig, secret)) {
      console.warn('[Webhook] Invalid X-Vomyra-Signature received');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  // 2. Immediate Acknowledgment within 2 seconds (non-blocking)
  res.status(200).json({ received: true });

  // 3. Asynchronous Normalization Pipeline
  try {
    const { event, data } = req.body;
    if (!event || !data) return;

    const callId = data.call_id || data.id || null;
    const idempotencyKey = callId ? `${callId}_${event}` : `${Date.now()}_${event}`;

    // Deduplication check
    const duplicate = await IdempotencyManager.isDuplicate('vomyra', idempotencyKey, event);
    if (duplicate) {
      console.log(`[Vomyra Webhook] Duplicate event ignored: ${idempotencyKey}`);
      return;
    }

    console.log(`[Vomyra Webhook] Processing event: ${event} for call ${callId || 'unknown'}`);

    // Update legacy call_records table to preserve existing behavior
    if (event === 'call.ended' || event === 'call.completed') {
      try {
        await supabase
          .from('call_records')
          .upsert({
            provider_resource_id: callId,
            status: data.status || 'completed',
            ended_reason: data.ended_reason || 'normal',
            duration_seconds: data.duration_seconds || 0,
            cost: data.cost || 0,
            recording_url: data.recording_url || null,
            transcript_url: data.transcript_url || null,
            caller_number: data.caller?.number || data.customer_number || null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'provider_resource_id' });
      } catch (dbErr: any) {
        console.warn('[Webhook] Legacy call_records update warning:', dbErr.message);
      }
    }

    // Normalize Vomyra payload into VoicePilot Events
    const normalizedEvents = await VomyraNormalizer.normalize(req.body);

    // Publish each normalized event to EventBus (Decoupled Subscribers)
    const eventBus = EventBus.getInstance();
    for (const normEvent of normalizedEvents) {
      await eventBus.publish(normEvent, req.body);
    }
  } catch (err: any) {
    console.error('[Vomyra Webhook] Event Normalization Error:', err.message);
  }
});
