import { Router } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { requireFeature, requireMinCredits } from '../middleware/entitlements';
import { supabaseAdmin as supabase } from '../config/supabase';

export const campaignRouter = Router();

let callDispatchQueue: Queue | null = null;

if (process.env.REDIS_URL) {
  const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  connection.on('error', (err) => {
    // Ignore connection errors to prevent app crash if Redis isn't running locally
  });
  callDispatchQueue = new Queue('call-dispatch', { connection });
} else {
  console.warn('REDIS_URL is not set. Campaigns dispatching will be disabled.');
}

campaignRouter.post('/', requireFeature('campaigns'), requireMinCredits(1.0), async (req, res) => {
  try {
    const { name, assistantId, phoneNumberId, numbers, workspaceId, createdBy } = req.body;

    if (!workspaceId || !createdBy || !name || !assistantId || !numbers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const phoneList = numbers.split(',').map((n: string) => n.trim()).filter(Boolean);

    // 1. Create Campaign
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .insert({
        workspace_id: workspaceId,
        created_by: createdBy,
        assistant_id: assistantId,
        phone_number_id: phoneNumberId || null, // Optional for now
        name,
        total_contacts: phoneList.length,
        status: 'running'
      })
      .select()
      .single();

    if (campError) throw campError;

    // 2. Add contacts and queue jobs
    for (const phone of phoneList) {
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert({ workspace_id: workspaceId, phone })
        .select()
        .single();
      
      if (contactError) throw contactError;

      const { data: campContact, error: ccError } = await supabase
        .from('campaign_contacts')
        .insert({
          campaign_id: campaign.id,
          contact_id: contact.id,
          status: 'queued'
        })
        .select()
        .single();

      if (ccError) throw ccError;

      // Queue for dispatch
      if (callDispatchQueue) {
        await callDispatchQueue.add('dispatch', {
          campaignContactId: campContact.id,
          to: phone,
          from: '+1234567890', // Hardcoded default for V1
          assistantId,
          idempotencyKey: `camp_${campaign.id}_contact_${contact.id}`
        });
      } else {
        console.warn('Skipping dispatch queueing for contact because Redis is not configured.');
      }
    }

    res.status(200).json({ success: true, campaign });
  } catch (error: any) {
    console.error('Failed to create campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
