import { Router, Request, Response } from 'express';

import { requireFeature, requireMinCredits } from '../middleware/entitlements';
import { supabaseAdmin as supabase } from '../config/supabase';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import { upsertVoiceContactForEcosystem } from '../services/ecosystemSync';

export const campaignRouter = Router();

const voiceProvider = new VomyraClient();



interface ContactInput {
  name: string;
  phone: string;
  followUpDate?: string;
  details?: string;
}

import { reserveCredits } from '../services/billing';
import { AuthenticatedUserRequest } from '../middleware/auth';

// POST /api/v1/campaigns - Create & Launch Outbound Bulk Campaign
campaignRouter.post(
  '/',
  requireMinCredits(1.0),
  async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const { name, assistantId, phoneNumberId, contacts, numbers } = req.body;
      const workspaceId = req.workspaceId;
      const createdBy = req.user?.id;

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

      // Check and reserve credits for the batch
      const requiredCredits = contactList.length * 1.0;
      const campaignBatchRef = `camp_batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const creditReservation = await reserveCredits(workspaceId, requiredCredits, campaignBatchRef, `Campaign batch hold for ${contactList.length} calls`);
      if (!creditReservation.success) {
        return res.status(402).json({
          error: 'Insufficient Credits',
          message: `Insufficient credit balance to launch ${contactList.length} calls. Required: ${requiredCredits} credits.`
        });
      }

      // Resolve real Vomyra Assistant ID and phone_number_id
      let realVomyraAssistantId = assistantId;
      let actualPhoneNumberId = phoneNumberId || null;

      try {
        const { data: assistant } = await supabase
          .from('assistants')
          .select(`
            provider_resource_id,
            phone_numbers ( id )
          `)
          .eq('id', assistantId)
          .maybeSingle();

        if (assistant?.provider_resource_id && /^[0-9a-fA-F]{24}$/.test(assistant.provider_resource_id)) {
          realVomyraAssistantId = assistant.provider_resource_id;
        }
        
        if (!actualPhoneNumberId && assistant?.phone_numbers && assistant.phone_numbers.length > 0) {
          actualPhoneNumberId = assistant.phone_numbers[0].id;
        }
      } catch {}

      if (!actualPhoneNumberId) {
        return res.status(400).json({ error: 'The selected assistant must have a phone number assigned before launching a campaign.' });
      }

      let campaignId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            workspace_id: workspaceId,
            created_by: createdBy,
            assistant_id: assistantId,
            phone_number_id: actualPhoneNumberId,
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

      const localContacts = new Map<string, string>();
      await Promise.allSettled(
        contactList.map(async (contact) => {
          const cleanNumber = contact.phone.startsWith('+')
            ? contact.phone
            : `+91${contact.phone.replace(/^0+/, '')}`;
          const row = await upsertVoiceContactForEcosystem(supabase, {
            workspaceId,
            userId: createdBy,
            name: contact.name || 'Customer',
            phone: cleanNumber,
            metadata: {
              followUpDate: contact.followUpDate,
              details: contact.details,
              source: 'campaign_launch',
            },
          });
          if (row?.id) localContacts.set(cleanNumber, row.id);
        })
      );

      const dispatchJobs = contactList.map((contact) => {
        const cleanNumber = contact.phone.startsWith('+')
          ? contact.phone
          : `+91${contact.phone.replace(/^0+/, '')}`;
        return {
          campaign_id: campaignId,
          workspace_id: workspaceId,
          call_payload: {
            customer_number: cleanNumber,
            customer_name: contact.name || 'Valued Customer',
            assistant_id: realVomyraAssistantId,
            customer_country_code: cleanNumber.startsWith('+91') ? '+91' : '+1',
            additional_data: {
              campaign_id: campaignId,
              campaign_name: name,
              contact_id: localContacts.get(cleanNumber),
              followUpDate: contact.followUpDate,
              details: contact.details,
              dispatched_at: new Date().toISOString(),
            },
          }
        };
      });
      const { error: queueError } = await supabase.from('campaign_dispatch_jobs').insert(dispatchJobs);
      if (queueError) throw new Error(`Could not queue campaign calls: ${queueError.message}`);

      return res.status(200).json({
        success: true,
        campaign: {
          id: campaignId,
          name,
          total_contacts: contactList.length,
          status: 'running',
          created_at: new Date().toISOString(),
        },
        message: `Campaign queued. ${contactList.length} calls will be dispatched by the campaign worker.`,
      });
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
