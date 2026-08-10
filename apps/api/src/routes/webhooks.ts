import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabaseAdmin as supabase } from '../config/supabase';

export const webhookRouter = Router();

function isValidSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (e) {
    return false;
  }
}

// POST /api/v1/webhooks/vomyra - Ingest Real-time Call Events from Vomyra
webhookRouter.post('/vomyra', async (req: Request, res: Response) => {
  const sig = req.headers['x-vomyra-signature'] as string;
  const secret = process.env.VOMYRA_WEBHOOK_SECRET;

  if (secret && sig) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!isValidSignature(rawBody, sig, secret)) {
      console.warn('[Webhook] Invalid X-Vomyra-Signature received');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  // Acknowledge event immediately within 2 seconds
  res.status(200).json({ received: true });

  // Process event asynchronously
  try {
    const { event, data } = req.body;
    console.log(`[Vomyra Webhook] Received event: ${event}`, data?.call_id || '');

    if (!data) return;

    const callId = data.call_id;

    if (event === 'call.started') {
      console.log(`[Webhook] Call ${callId} started with assistant ${data.assistant_id}`);
    } else if (event === 'call.ended') {
      const {
        status,
        ended_reason,
        duration_seconds,
        cost,
        transcript_url,
        recording_url,
        caller
      } = data;

      console.log(`[Webhook] Call ${callId} ended. Duration: ${duration_seconds}s, Reason: ${ended_reason}`);

      // Try updating call record in DB if exists
      try {
        await supabase
          .from('call_records')
          .upsert({
            provider_resource_id: callId,
            status: status || 'completed',
            ended_reason: ended_reason || 'normal',
            duration_seconds: duration_seconds || 0,
            cost: cost || 0,
            recording_url: recording_url || null,
            transcript_url: transcript_url || null,
            caller_number: caller?.number || null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'provider_resource_id' });
      } catch (dbErr: any) {
        console.warn('[Webhook] Could not write call_records table:', dbErr.message);
      }
    } else if (event === 'call.transferred') {
      console.log(`[Webhook] Call ${callId} transferred to ${data.transfer_destination}`);
    } else if (event === 'call.tool_invoked') {
      console.log(`[Webhook] Call ${callId} invoked tool: ${data.tool_name}`);
    }
  } catch (err: any) {
    console.error('[Vomyra Webhook] Error processing event:', err);
  }
});
