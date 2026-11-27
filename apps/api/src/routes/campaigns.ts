import { Router, Request, Response } from 'express';

import { requireFeature, requireMinCredits } from '../middleware/entitlements';
import { supabaseAdmin as supabase } from '../config/supabase';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import { upsertVoiceContactForEcosystem } from '../services/ecosystemSync';
import { reserveCredits, settleCallBilling } from '../services/billing';
import { AuthenticatedUserRequest } from '../middleware/auth';

export const campaignRouter = Router();

const voiceProvider = new VomyraClient();

interface ContactInput {
  name: string;
  phone: string;
  followUpDate?: string;
  details?: string;
}

// GET /api/v1/campaigns - List campaigns
campaignRouter.get('/', async (req: Request, res: Response) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    let query = supabase.from('campaigns').select('*, assistants(name)').order('created_at', { ascending: false });

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data: campaigns, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, data: campaigns || [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/campaigns/:id - Get single campaign
campaignRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*, assistants(name, provider_resource_id)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    return res.status(200).json({ success: true, data: campaign });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/campaigns - Create & Launch Outbound Bulk Campaign
campaignRouter.post(
  '/',
  requireMinCredits(1.0),
  async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const { name, assistantId, phoneNumberId, contacts, numbers, idempotencyKey } = req.body;
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

      // 1. Idempotency Check: Prevent duplicate campaign creation on double-submit
      const effectiveIdempotencyKey = idempotencyKey || `camp_${workspaceId}_${assistantId}_${contactList.map(c => c.phone).sort().join('_').slice(0, 40)}_${Math.floor(Date.now() / 30000)}`;

      const { data: existingCampaign } = await supabase
        .from('campaigns')
        .select('id, name, total_contacts, status, created_at')
        .eq('workspace_id', workspaceId)
        .eq('idempotency_key', effectiveIdempotencyKey)
        .maybeSingle();

      if (existingCampaign) {
        console.log(`[API /campaigns] Duplicate submission detected for key ${effectiveIdempotencyKey}. Returning existing campaign.`);
        return res.status(200).json({
          success: true,
          campaign: existingCampaign,
          message: `Campaign already submitted and active.`
        });
      }

      // 2. Active Recipient Concurrency Guard: Skip numbers already in-flight (pending/processing)
      const { data: inFlightJobs } = await supabase
        .from('campaign_dispatch_jobs')
        .select('call_payload')
        .eq('workspace_id', workspaceId)
        .in('status', ['pending', 'processing']);

      const inFlightNumbers = new Set(
        (inFlightJobs || []).map((j: any) => j.call_payload?.customer_number).filter(Boolean)
      );

      const eligibleContacts = contactList.filter((contact) => {
        const cleanNumber = contact.phone.startsWith('+')
          ? contact.phone
          : `+91${contact.phone.replace(/^0+/, '')}`;
        return !inFlightNumbers.has(cleanNumber);
      });

      if (eligibleContacts.length === 0) {
        return res.status(409).json({
          error: 'Active calls in progress',
          message: 'All recipients in this batch currently have an active call in progress or pending in the queue.'
        });
      }

      // Check and reserve credits for the eligible batch
      const requiredCredits = eligibleContacts.length * 1.0;
      const campaignBatchRef = `camp_batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const creditReservation = await reserveCredits(workspaceId, requiredCredits, campaignBatchRef, `Campaign batch hold for ${eligibleContacts.length} calls`);
      if (!creditReservation.success) {
        return res.status(402).json({
          error: 'Insufficient Credits',
          message: `Insufficient credit balance to launch ${eligibleContacts.length} calls. Required: ${requiredCredits} credits.`
        });
      }

      // Resolve real Vomyra Assistant ID and phone_number_id
      let realVomyraAssistantId = assistantId;
      let actualPhoneNumberId = phoneNumberId || null;
      let assignedPhoneNumber: string | null = null;

      try {
        const { data: assistant } = await supabase
          .from('assistants')
          .select(`
            provider_resource_id,
            phone_numbers ( id, phone_number )
          `)
          .eq('id', assistantId)
          .maybeSingle();

        if (assistant?.provider_resource_id && /^[0-9a-fA-F]{24}$/.test(assistant.provider_resource_id)) {
          realVomyraAssistantId = assistant.provider_resource_id;
        }
        
        if (!actualPhoneNumberId && assistant?.phone_numbers && assistant.phone_numbers.length > 0) {
          actualPhoneNumberId = assistant.phone_numbers[0].id;
          assignedPhoneNumber = assistant.phone_numbers[0].phone_number;
        } else if (actualPhoneNumberId && assistant?.phone_numbers) {
          const found = assistant.phone_numbers.find((p: any) => p.id === actualPhoneNumberId);
          if (found) assignedPhoneNumber = found.phone_number;
        }
      } catch {}

      if (!actualPhoneNumberId) {
        return res.status(400).json({ error: 'The selected assistant must have a phone number assigned before launching a campaign.' });
      }

      if (!assignedPhoneNumber) {
        const { data: phoneRow } = await supabase
          .from('phone_numbers')
          .select('phone_number')
          .eq('id', actualPhoneNumberId)
          .maybeSingle();
        if (phoneRow?.phone_number) {
          assignedPhoneNumber = phoneRow.phone_number.trim();
        }
      }

      let campaignId: string;
      try {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            workspace_id: workspaceId,
            created_by: createdBy,
            assistant_id: assistantId,
            phone_number_id: actualPhoneNumberId,
            name,
            total_contacts: eligibleContacts.length,
            status: 'running',
            idempotency_key: effectiveIdempotencyKey
          })
          .select()
          .single();

        if (campaignError || !campaign?.id) {
          throw new Error(campaignError?.message || 'Failed to record campaign in database');
        }
        campaignId = campaign.id;
      } catch (dbErr: any) {
        console.error('[Campaigns] DB insert failed. Aborting campaign dispatch:', dbErr.message);
        // Release credit hold so user is not penalized for an aborted campaign
        try {
          await settleCallBilling({
            workspaceId,
            reservedAmount: requiredCredits,
            durationSeconds: 0,
            referenceId: campaignBatchRef
          });
        } catch (settleErr: any) {
          console.error('[Campaigns] Failed to release credit reservation hold:', settleErr.message);
        }

        return res.status(500).json({
          error: 'Campaign Initialization Failed',
          message: `Unable to persist campaign: ${dbErr.message}. All held credits have been released.`
        });
      }

      console.log(
        `[Campaigns] Launching campaign "${name}" with ${eligibleContacts.length} contacts using assistant ${realVomyraAssistantId} and caller number ${assignedPhoneNumber}`
      );

      const localContacts = new Map<string, string>();
      await Promise.allSettled(
        eligibleContacts.map(async (contact) => {
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

      const dispatchJobs = eligibleContacts.map((contact) => {
        const cleanNumber = contact.phone.startsWith('+')
          ? contact.phone
          : `+91${contact.phone.replace(/^0+/, '')}`;
        return {
          campaign_id: campaignId,
          workspace_id: workspaceId,
          call_payload: {
            customer_number: cleanNumber,
            customer_name: contact.name || 'Valued Customer',
            assigned_number: assignedPhoneNumber,
            assistant_id: realVomyraAssistantId,
            customer_country_code: cleanNumber.startsWith('+91') ? '+91' : '+1',
            additional_data: {
              campaign_id: campaignId,
              campaign_name: name,
              contact_id: localContacts.get(cleanNumber),
              followUpDate: contact.followUpDate,
              details: contact.details,
              dispatched_at: new Date().toISOString(),
              idempotency_key: `contact_${campaignId}_${cleanNumber}`
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
          total_contacts: eligibleContacts.length,
          status: 'running',
          created_at: new Date().toISOString(),
        },
        message: `Campaign queued. ${eligibleContacts.length} calls will be dispatched by the campaign worker.`,
      });
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
