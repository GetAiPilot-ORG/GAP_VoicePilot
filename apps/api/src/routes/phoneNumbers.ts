import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { VomyraClient } from '../services/voice/providers/vomyra/client';

export const phoneNumberRouter = Router();
const vomyraClient = new VomyraClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const DEFAULT_WORKSPACE_ID = "df2a5118-9106-4124-9cea-bcaadc13f2ef";

// GET /api/v1/phone-numbers/my - Get user's purchased phone numbers
phoneNumberRouter.get('/my', async (req: Request, res: Response) => {
  try {
    const workspaceId = (req.query.workspaceId as string) || DEFAULT_WORKSPACE_ID;

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

// POST /api/v1/phone-numbers/buy - Buy / Claim a Phone Number with workspace balance
phoneNumberRouter.post('/buy', async (req: Request, res: Response) => {
  try {
    const { numberId, phoneNumber, workspaceId = DEFAULT_WORKSPACE_ID, price = 2.00 } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    // 1. Check workspace balance
    const { data: ws } = await supabase
      .from('workspaces')
      .select('id, balance')
      .eq('id', workspaceId)
      .single();

    const currentBalance = typeof ws?.balance === 'number' ? ws.balance : 0.00;

    if (currentBalance < price) {
      return res.status(400).json({ error: `Insufficient workspace credit balance ($${currentBalance.toFixed(2)}). Price is $${price.toFixed(2)}` });
    }

    // 2. Deduct balance
    const newBalance = Math.max(0, currentBalance - price);
    await supabase
      .from('workspaces')
      .update({ balance: newBalance })
      .eq('id', workspaceId);

    // 3. Claim ownership in database
    const cleanNum = phoneNumber.replace(/[^\d+]/g, "");
    const { data: purchasedNum, error: insertErr } = await supabase
      .from('phone_numbers')
      .insert({
        workspace_id: workspaceId,
        provider: 'vomyra',
        provider_resource_id: `pn_${cleanNum}`,
        phone_number: phoneNumber,
        status: 'unassigned'
      })
      .select('*, assistants(id, name)')
      .single();

    if (insertErr && insertErr.code === '23505') {
      const { data: updatedNum } = await supabase
        .from('phone_numbers')
        .update({ workspace_id: workspaceId, status: 'unassigned' })
        .eq('phone_number', phoneNumber)
        .select('*, assistants(id, name)')
        .single();

      return res.status(200).json({
        success: true,
        phone_number: updatedNum,
        new_balance: newBalance,
        message: `Successfully purchased ${phoneNumber}!`
      });
    }

    res.status(200).json({
      success: true,
      phone_number: purchasedNum,
      new_balance: newBalance,
      message: `Successfully purchased ${phoneNumber}!`
    });
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
