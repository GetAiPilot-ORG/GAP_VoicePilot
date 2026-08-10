import { Router, Request, Response } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { requireFeature, requireMinCredits } from '../middleware/entitlements';
import { supabaseAdmin as supabase } from '../config/supabase';
import { VomyraClient } from '../services/voice/providers/vomyra/client';

export const campaignRouter = Router();

const voiceProvider = new VomyraClient();

let callDispatchQueue: Queue | null = null;
if (process.env.REDIS_URL) {
  const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  connection.on('error', () => {});
  callDispatchQueue = new Queue('call-dispatch', { connection });
}

interface ContactInput {
  name: string;
  phone: string;
  followUpDate?: string;
  details?: string;
}

// POST /api/v1/campaigns - Create & Launch Outbound Bulk Campaign
campaignRouter.post(
  '/',
  requireFeature('campaigns'),
  requireMinCredits(1.0),
  async (req: Request, res: Response) => {
    try {
      const { name, assistantId, phoneNumberId, contacts, numbers, workspaceId, createdBy } = req.body;

      if (!workspaceId || !createdBy || !name || !assistantId) {
        return res.status(400).json({ error: 'workspaceId, createdBy, name, and assistantId are required.' });
      }

      let contactList: ContactInput[] = [];

      if (Array.isArray(contacts) && contacts.length > 0) {
        contactList = contacts
          .map((contact: any) => ({
            name: String(contact.name || 'Customer').trim(),
            phone: String(contact.phone || '').trim().replace(/[\s\-()]/g, ''),
            followUpDate: contact.followUpDate || undefined,
            details: contact.details || undefined,
          }))
          .filter((contact) => contact.phone.length >= 7);
      } else if (typeof numbers === 'string') {
        contactList = numbers
          .split(',')
          .map((number: string) => ({
            name: 'Customer',
            phone: number.trim().replace(/[\s\-()]/g, ''),
          }))
          .filter((contact) => contact.phone.length >= 7);
      }

      if (contactList.length === 0) {
        return res.status(400).json({ error: 'No valid phone numbers found in contact list.' });
      }

      let realVomyraAssistantId = assistantId;
      try {
        const { data: assistant } = await supabase
          .from('assistants')
          .select('provider_resource_id')
          .eq('id', assistantId)
          .maybeSingle();

        if (assistant?.provider_resource_id && /^[0-9a-fA-F]{24}$/.test(assistant.provider_resource_id)) {
          realVomyraAssistantId = assistant.provider_resource_id;
        }
      } catch {}

      let campaignId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            workspace_id: workspaceId,
            created_by: createdBy,
            assistant_id: assistantId,
            phone_number_id: phoneNumberId || null,
            name,
            total_contacts: contactList.length,
            status: 'running',
          })
          .select()
          .single();

        if (campaignError) throw campaignError;
        if (campaign?.id) campaignId = campaign.id;
      } catch (dbErr: any) {
        console.warn('[Campaigns] DB insert warning:', dbErr.message);
      }

      console.log(
        `[Campaigns] Launching campaign "${name}" with ${contactList.length} contacts using assistant ${realVomyraAssistantId}`
      );

      const dispatchPromises = contactList.map(async (contact, index) => {
        await new Promise((resolve) => setTimeout(resolve, index * 800));

        const cleanNumber = contact.phone.startsWith('+')
          ? contact.phone
          : `+91${contact.phone.replace(/^0+/, '')}`;

        try {
          console.log(
            `[Campaigns] Calling contact ${index + 1}/${contactList.length}: ${contact.name} (${cleanNumber})`
          );

          const callResult = await voiceProvider.initiateCall({
            customer_number: cleanNumber,
            customer_name: contact.name || 'Valued Customer',
            assistant_id: realVomyraAssistantId,
            customer_country_code: cleanNumber.startsWith('+91') ? '+91' : '+1',
            additional_data: {
              campaign_id: campaignId,
              campaign_name: name,
              followUpDate: contact.followUpDate,
              details: contact.details,
              dispatched_at: new Date().toISOString(),
            },
          });

          console.log(`[Campaigns] Call initiated for ${contact.name}: ID ${callResult.id}`);
          return { success: true, contact, callId: callResult.id };
        } catch (callErr: any) {
          console.error(`[Campaigns] Failed to call ${contact.phone}:`, callErr.message);
          return { success: false, contact, error: callErr.message };
        }
      });

      Promise.allSettled(dispatchPromises).then(async (results) => {
        const succeeded = results.filter(
          (result) => result.status === 'fulfilled' && (result.value as any).success
        ).length;

        console.log(
          `[Campaigns] Campaign "${name}" dispatch finished. Succeeded: ${succeeded}/${contactList.length}`
        );

        try {
          await supabase
            .from('campaigns')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
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
          created_at: new Date().toISOString(),
        },
        message: `Campaign initiated! Dispatching ${contactList.length} automated calls in real-time.`,
      });
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
