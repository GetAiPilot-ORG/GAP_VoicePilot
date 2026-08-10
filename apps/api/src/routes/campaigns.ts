import { Router, Request, Response } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { VomyraClient } from '../services/voice/providers/vomyra/client';

export const campaignRouter = Router();

const voiceProvider = new VomyraClient();

let callDispatchQueue: Queue | null = null;
if (process.env.REDIS_URL) {
  const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  connection.on('error', () => {});
  callDispatchQueue = new Queue('call-dispatch', { connection });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkyilicraflkgcfgqypc.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI'
);

interface ContactInput {
  name: string;
  phone: string;
  followUpDate?: string;
  details?: string;
}

// POST /api/v1/campaigns - Create & Launch Outbound Bulk Campaign
campaignRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, assistantId, contacts, numbers, workspaceId, createdBy } = req.body;

    if (!name || !assistantId) {
      return res.status(400).json({ error: 'Campaign name and assistantId are required.' });
    }

    // Normalize contacts list
    let contactList: ContactInput[] = [];

    if (Array.isArray(contacts) && contacts.length > 0) {
      contactList = contacts.map((c: any) => ({
        name: String(c.name || 'Customer').trim(),
        phone: String(c.phone || '').trim().replace(/[\s\-\(\)]/g, ''),
        followUpDate: c.followUpDate || undefined,
        details: c.details || undefined
      })).filter(c => c.phone.length >= 7);
    } else if (typeof numbers === 'string') {
      contactList = numbers.split(',').map((n: string) => ({
        name: 'Customer',
        phone: n.trim().replace(/[\s\-\(\)]/g, '')
      })).filter(c => c.phone.length >= 7);
    }

    if (contactList.length === 0) {
      return res.status(400).json({ error: 'No valid phone numbers found in contact list.' });
    }

    // Resolve Assistant's real Vomyra ObjectId
    let realVomyraAssistantId = assistantId;
    try {
      const { data: ast } = await supabase
        .from('assistants')
        .select('provider_resource_id')
        .eq('id', assistantId)
        .maybeSingle();

      if (ast?.provider_resource_id && /^[0-9a-fA-F]{24}$/.test(ast.provider_resource_id)) {
        realVomyraAssistantId = ast.provider_resource_id;
      }
    } catch {}

    // 1. Create Campaign Record in Supabase
    let campaignId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const { data: dbCamp, error: campErr } = await supabase
        .from('campaigns')
        .insert({
          name,
          assistant_id: assistantId,
          total_contacts: contactList.length,
          status: 'running',
          workspace_id: workspaceId || '00000000-0000-0000-0000-000000000000',
          created_by: createdBy || '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();

      if (dbCamp?.id) {
        campaignId = dbCamp.id;
      }
    } catch (dbErr: any) {
      console.warn('[Campaigns] DB insert warning:', dbErr.message);
    }

    console.log(`[Campaigns] Launching campaign "${name}" with ${contactList.length} contacts using assistant ${realVomyraAssistantId}`);

    // 2. Dispatch calls asynchronously
    const dispatchPromises = contactList.map(async (c, idx) => {
      // Stagger dials slightly to respect telephony rates
      await new Promise(r => setTimeout(r, idx * 800));

      const cleanNumber = c.phone.startsWith('+') ? c.phone : `+91${c.phone.replace(/^0+/, '')}`;

      try {
        console.log(`[Campaigns] Calling contact ${idx + 1}/${contactList.length}: ${c.name} (${cleanNumber})`);
        
        const callResult = await voiceProvider.initiateCall({
          customer_number: cleanNumber,
          customer_name: c.name || 'Valued Customer',
          assistant_id: realVomyraAssistantId,
          customer_country_code: cleanNumber.startsWith('+91') ? '+91' : '+1',
          additional_data: {
            campaign_id: campaignId,
            campaign_name: name,
            followUpDate: c.followUpDate,
            details: c.details,
            dispatched_at: new Date().toISOString()
          }
        });

        console.log(`[Campaigns] Call initiated for ${c.name}: ID ${callResult.id}`);
        return { success: true, contact: c, callId: callResult.id };
      } catch (callErr: any) {
        console.error(`[Campaigns] Failed to call ${c.phone}:`, callErr.message);
        return { success: false, contact: c, error: callErr.message };
      }
    });

    // Start execution in background without blocking HTTP response
    Promise.allSettled(dispatchPromises).then(async (results) => {
      const succeeded = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
      console.log(`[Campaigns] Campaign "${name}" dispatch finished. Succeeded: ${succeeded}/${contactList.length}`);

      try {
        await supabase
          .from('campaigns')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', campaignId);
      } catch {}
    });

    return res.status(200).json({
      success: true,
      campaign: {
        id: campaignId,
        name,
        total_contacts: contactList.length,
        status: 'running',
        created_at: new Date().toISOString()
      },
      message: `Campaign initiated! Dispathing ${contactList.length} automated calls in real-time.`
    });
  } catch (error: any) {
    console.error('Failed to create campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
