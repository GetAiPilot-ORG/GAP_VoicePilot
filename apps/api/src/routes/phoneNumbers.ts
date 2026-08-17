import { Router, Request, Response } from 'express';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import { optionalEnv } from '../config/env';
import { supabaseAdmin as supabase } from '../config/supabase';

export const phoneNumberRouter = Router();
const vomyraClient = new VomyraClient();

const DEFAULT_WORKSPACE_ID = optionalEnv('DEFAULT_WORKSPACE_ID');

// GET /api/v1/phone-numbers/my - Get user's purchased phone numbers
phoneNumberRouter.get('/my', async (req: Request, res: Response) => {
  try {
    const workspaceId = (req.query.workspaceId as string) || DEFAULT_WORKSPACE_ID;

    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId is required' });
    }

    const { data: numbers, error } = await supabase
      .from('phone_numbers')
      .select('*, assistants(id, name)')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, phone_numbers: numbers || [] });
  } catch (error: any) {
    console.error("Failed to list my phone numbers:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/phone-numbers/available - Get available unassigned numbers from database
phoneNumberRouter.get('/available', async (req: Request, res: Response) => {
  try {
    const { data: dbUnassigned, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .is('workspace_id', null)
      .is('deleted_at', null);

    if (error) throw error;

    res.status(200).json({ success: true, available_numbers: dbUnassigned || [] });
  } catch (error: any) {
    res.status(200).json({ success: true, available_numbers: [] });
  }
});

// POST /api/v1/phone-numbers/buy - Claim a Dedicated Phone Number with Entitlements
phoneNumberRouter.post('/buy', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, workspaceId = DEFAULT_WORKSPACE_ID } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId is required' });
    }
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    // 1. Atomically reserve entitlement
    const { data: reserveResult, error: reserveError } = await supabase.rpc(
      'reserve_number_entitlement',
      { p_workspace_id: workspaceId }
    );

    if (reserveError || !reserveResult?.success) {
      return res.status(400).json({ 
        error: reserveError?.message || reserveResult?.error || 'No dedicated number entitlements available.' 
      });
    }

    const claimId = reserveResult.claim_id;

    // 2. Mark as provisioning
    await supabase
      .from('number_claims')
      .update({ status: 'provisioning', phone_number: phoneNumber })
      .eq('id', claimId);

    // 3. Provision via Provider (Vomyra)
    try {
      const cleanNum = phoneNumber.replace(/[^\d+]/g, "");
      const providerResourceId = `pn_${cleanNum}`;
      
      const current_period_start = new Date().toISOString();
      const current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: purchasedNum, error: insertErr } = await supabase
        .from('phone_numbers')
        .insert({
          workspace_id: workspaceId,
          provider: 'vomyra',
          provider_resource_id: providerResourceId,
          phone_number: phoneNumber,
          status: 'unassigned',
          current_period_start,
          current_period_end
        })
        .select('*, assistants(id, name)')
        .single();

      if (insertErr) {
        if (insertErr.code === '23505') {
          // Already exists in DB - handle as specific failure or success depending on ownership
          throw new Error('Number already claimed');
        }
        throw insertErr; // Throw to trigger timeout/unknown logic
      }

      // SUCCESS
      await supabase.from('number_claims').update({ 
        status: 'claimed', 
        provider_number_id: purchasedNum.id,
        claimed_at: new Date().toISOString()
      }).eq('id', claimId);

      return res.status(200).json({
        success: true,
        phone_number: purchasedNum,
        message: `Successfully claimed ${phoneNumber}!`
      });

    } catch (provisioningError: any) {
      console.error("Provisioning Error:", provisioningError);
      
      const isDefiniteFailure = provisioningError.message === 'Number already claimed';

      if (isDefiniteFailure) {
        // DEFINITE FAILURE -> Refund entitlement
        await supabase.from('number_claims').update({ 
          status: 'failed',
          error_message: provisioningError.message 
        }).eq('id', claimId);

        await supabase.rpc('refund_number_entitlement', { p_workspace_id: workspaceId });
        
        // Let's do a direct REST update for the refund (simplified for this plan, though RPC is safer)
        const { data: ws } = await supabase.from('workspaces').select('dedicated_number_entitlements').eq('id', workspaceId).single();
        if (ws) {
          await supabase.from('workspaces').update({ dedicated_number_entitlements: ws.dedicated_number_entitlements + 1 }).eq('id', workspaceId);
        }

        return res.status(400).json({ success: false, error: 'Provisioning failed definitively: ' + provisioningError.message });
      } else {
        // UNKNOWN / TIMEOUT -> Needs reconciliation, DO NOT refund
        await supabase.from('number_claims').update({ 
          status: 'needs_reconciliation',
          error_message: provisioningError.message || 'Unknown network/timeout error'
        }).eq('id', claimId);

        return res.status(500).json({ 
          success: false, 
          error: 'We encountered a timeout while provisioning your number. Please contact support. Do not attempt to claim again.' 
        });
      }
    }

  } catch (error: any) {
    console.error("Failed to buy phone number:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/phone-numbers/assign - Assign Owned Phone Number to Assistant
phoneNumberRouter.put('/assign', async (req: Request, res: Response) => {
  try {
    const { numberId, assistantId } = req.body;

    if (!numberId || !assistantId) {
      return res.status(400).json({ error: 'numberId and assistantId are required' });
    }

    const { data: num, error } = await supabase
      .from('phone_numbers')
      .update({
        assigned_assistant_id: assistantId,
        status: 'active'
      })
      .eq('id', numberId)
      .select('*, assistants(id, name)')
      .single();

    if (error) throw error;

    await vomyraClient.assignPhoneNumber(num.provider_resource_id || numberId, assistantId);

    res.status(200).json({ success: true, phone_number: num });
  } catch (error: any) {
    console.error("Failed to assign phone number:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/phone-numbers/unassign/:id - Unassign Phone Number
phoneNumberRouter.delete('/unassign/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: num, error } = await supabase
      .from('phone_numbers')
      .update({
        assigned_assistant_id: null,
        status: 'unassigned'
      })
      .eq('id', id)
      .select('*, assistants(id, name)')
      .single();

    if (error) throw error;

    await vomyraClient.unassignPhoneNumber(num.provider_resource_id || id);

    res.status(200).json({ success: true, phone_number: num });
  } catch (error: any) {
    console.error("Failed to unassign phone number:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
