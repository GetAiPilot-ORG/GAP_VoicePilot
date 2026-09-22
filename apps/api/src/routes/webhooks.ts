import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { IdempotencyManager } from '../services/events/IdempotencyManager';
import { VomyraNormalizer } from '../services/events/VomyraNormalizer';
import { EventBus } from '../services/events/EventBus';
import { supabaseAdmin as supabase } from '../config/supabase';

export const webhookRouter = Router();

// POST /api/v1/webhooks/vomyra - Ingest Real-time Call Events from Vomyra
webhookRouter.post('/vomyra', async (req: Request, res: Response) => {
  const sig = req.headers['x-vomyra-signature'] as string;
  const secret = process.env.VOMYRA_WEBHOOK_SECRET;

  // 1. Strict Signature Verification
  if (!secret) {
    console.error('[Webhook] VOMYRA_WEBHOOK_SECRET is not configured');
    return res.status(503).json({ error: 'Webhook verification is not configured' });
  }
  {
    if (!sig) {
      console.warn('[Webhook] Missing X-Vomyra-Signature header');
      return res.status(401).json({ error: 'Missing X-Vomyra-Signature header' });
    }
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

// Razorpay Webhook Handler
// This must be mounted with express.raw() in index.ts BEFORE express.json()
export const razorpayWebhookHandler = async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('[Razorpay Webhook] Secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return res.status(400).send('Missing signature');
    }

    // req.body should be a Buffer because of express.raw()
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Razorpay Webhook] Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString('utf8'));
    console.log(`[Razorpay Webhook] Received event: ${event.event}`);

    // We only process payment.captured
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      
      const { error: rpcError } = await supabase.rpc(
        "process_payment_intent",
        {
          p_razorpay_order_id: payment.order_id,
          p_razorpay_payment_id: payment.id,
        },
      );

      if (rpcError) {
        console.error("[Razorpay Webhook] RPC Error:", rpcError);
        // Note: we still return 200 so Razorpay doesn't retry indefinitely if it's a permanent failure,
        // but if it's a temporary DB issue, maybe return 500 to allow retry. We'll stick to 500 for true DB errors.
        return res.status(500).send('Database error processing payment');
      }
      
      console.log(`[Razorpay Webhook] Successfully processed payment ${payment.id} for order ${payment.order_id}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Error:', err);
    res.status(500).send('Webhook Error');
  }
};

// POST /api/v1/webhooks/contacts/ingest - Inbound Webhook to auto-add leads from Web forms, Zapier, Typeform
webhookRouter.post('/contacts/ingest', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, company, tags, metadata, workspaceId: bodyWsId } = req.body;
    const token = (req.query.token as string) || (req.headers['x-api-token'] as string);
    const ingestSecret = process.env.CONTACT_INGEST_SECRET;
    if (!ingestSecret) {
      return res.status(503).json({ success: false, error: 'Contact ingestion is not configured.' });
    }
    const suppliedToken = Buffer.from(token || '');
    const expectedToken = Buffer.from(ingestSecret);
    if (suppliedToken.length !== expectedToken.length || !crypto.timingSafeEqual(suppliedToken, expectedToken)) {
      return res.status(401).json({ success: false, error: 'Invalid or missing ingestion token.' });
    }
    const workspaceId = (req.query.workspaceId as string) || bodyWsId || process.env.DEFAULT_WORKSPACE_ID;

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'workspaceId is required for lead ingestion.' });
    }

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const cleanPhone = String(phone).trim().replace(/[\s\-()]/g, '');
    if (cleanPhone.length < 7) {
      return res.status(400).json({ success: false, error: 'Valid phone number with country code is required.' });
    }

    // Resolve target workspace
    const targetWorkspaceId = workspaceId;

    const normalizedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/^0+/, '')}`;
    const parsedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : ['Webhook Lead']);

    const { data: contact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        workspace_id: targetWorkspaceId,
        name: name?.trim() || 'Website Lead',
        phone: normalizedPhone,
        metadata: {
          email: email?.trim() || '',
          company: company?.trim() || '',
          tags: parsedTags,
          source: 'Inbound Webhook API',
          status: 'active',
          ...(metadata || {})
        },
        ecosystem_sync_source: 'webhook',
        ecosystem_sync_status: 'synced',
        ecosystem_synced_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Inbound Webhook] Insert error:', insertError);
      return res.status(500).json({ success: false, error: insertError.message });
    }

    console.log(`[Inbound Webhook] Successfully ingested lead ${contact.name} (${contact.phone}) into workspace ${targetWorkspaceId}`);

    return res.status(201).json({
      success: true,
      message: 'Contact successfully ingested via Inbound Webhook',
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: email || '',
        company: company || '',
        tags: parsedTags,
        created_at: contact.created_at
      }
    });
  } catch (err: any) {
    console.error('[Inbound Webhook] Ingestion error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});
