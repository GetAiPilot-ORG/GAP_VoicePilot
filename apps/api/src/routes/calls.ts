import { Router } from 'express';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import { requireMinCredits } from '../middleware/entitlements';
import { reserveCredits, settleCallBilling } from '../services/billing';
import { supabaseAdmin as supabase } from '../config/supabase';

export const callRouter = Router();
const voiceProvider = new VomyraClient();

// POST /api/v1/calls - Initiate Outbound Call
callRouter.post('/', requireMinCredits(1.0), async (req, res) => {
  try {
    const { 
      customer_number, 
      customer_name, 
      assistant_id, 
      assigned_number, 
      customer_country_code, 
      additional_data,
      to, 
      from, 
      assistantId, 
      idempotencyKey, 
      workspaceId 
    } = req.body;

    const targetCustomerNumber = (customer_number || to || '').toString().trim();
    const targetCustomerName = (customer_name || 'Customer').toString().trim();
    const targetCountryCode = customer_country_code || (targetCustomerNumber.startsWith('+91') ? '+91' : undefined);

    if (!targetCustomerNumber) {
      return res.status(400).json({ success: false, error: 'customer_number (or to) is required' });
    }

    // Resolve real Vomyra Assistant ID if an internal UUID was passed
    let realVomyraAssistantId = assistant_id || assistantId;

    if (realVomyraAssistantId) {
      try {
        const { data: dbAst } = await supabase
          .from('assistants')
          .select('provider_resource_id')
          .eq('id', realVomyraAssistantId)
          .maybeSingle();

        if (dbAst?.provider_resource_id && !dbAst.provider_resource_id.startsWith('mock_')) {
          realVomyraAssistantId = dbAst.provider_resource_id;
        }
      } catch (e) {}
    }

    const resolvedWorkspaceId = (req as any).workspaceId as string;
    if (!resolvedWorkspaceId) {
      return res.status(400).json({ success: false, error: 'workspaceId is required' });
    }

    // Reserve credits upfront
    const refKey = idempotencyKey || `call_${Date.now()}`;
    const creditReservation = await reserveCredits(resolvedWorkspaceId, 1.0, refKey, 'Single call credit hold');
    if (!creditReservation.success) {
      return res.status(402).json({
        success: false,
        error: creditReservation.error || 'Insufficient credit balance'
      });
    }

    // Prepare Vomyra payload: exactly ONE of assistant_id or assigned_number
    const callInput: any = {
      customer_number: targetCustomerNumber,
      customer_name: targetCustomerName,
      customer_country_code: targetCountryCode,
      additional_data: additional_data || { source: 'GAP_VoicePilot' }
    };

    if (realVomyraAssistantId) {
      callInput.assistant_id = realVomyraAssistantId;
    } else if (assigned_number || from) {
      callInput.assigned_number = (assigned_number || from).toString().trim();
    } else {
      return res.status(400).json({ success: false, error: 'Either assistant_id or assigned_number must be provided.' });
    }

    console.log('[API /calls] Initiating Vomyra Call:', JSON.stringify(callInput));

    // Call Vomyra voice provider to initiate call
    let callResponse: any;
    try {
      callResponse = await voiceProvider.initiateCall(callInput);
    } catch (providerErr: any) {
      if (resolvedWorkspaceId) {
        await settleCallBilling({
          workspaceId: resolvedWorkspaceId,
          reservedAmount: 1.0,
          durationSeconds: 0,
          referenceId: refKey
        });
      }
      throw providerErr;
    }

    res.status(201).json({
      success: true,
      data: callResponse
    });
  } catch (error: any) {
    console.error('[API /calls] Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to initiate call' });
  }
});

// GET /api/v1/calls/whatsapp/numbers - Get Available WhatsApp Business Numbers
callRouter.get('/whatsapp/numbers', async (req, res) => {
  try {
    const numbers = await voiceProvider.getWhatsAppNumbers();
    res.json({ success: true, data: numbers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch WhatsApp numbers' });
  }
});

// POST /api/v1/calls/whatsapp - Initiate Outbound WhatsApp Voice Call
callRouter.post('/whatsapp', requireMinCredits(1.0), async (req, res) => {
  try {
    const {
      customer_number,
      customer_name,
      customer_country_code,
      whatsapp_number,
      additional_data,
      idempotencyKey,
      workspaceId
    } = req.body;

    const resolvedWorkspaceId = (req as any).workspaceId as string;
    if (!resolvedWorkspaceId) {
      return res.status(400).json({ success: false, error: 'workspaceId is required' });
    }

    const targetCustomerNumber = (customer_number || '').toString().trim();
    const targetCustomerName = (customer_name || 'Customer').toString().trim();
    const targetCountryCode = customer_country_code || (targetCustomerNumber.startsWith('+91') ? '+91' : undefined);
    const targetWhatsAppNumber = (whatsapp_number || '').toString().trim();

    if (!targetCustomerNumber) {
      return res.status(400).json({ success: false, error: 'customer_number is required for WhatsApp Voice Call' });
    }

    if (!targetWhatsAppNumber) {
      return res.status(400).json({ success: false, error: 'whatsapp_number (connected caller ID) is required' });
    }

    const refKey = idempotencyKey || `wa_call_${Date.now()}`;
    const creditReservation = await reserveCredits(resolvedWorkspaceId, 1.0, refKey, 'WhatsApp voice call hold');
    if (!creditReservation.success) {
      return res.status(402).json({
        success: false,
        error: creditReservation.error || 'Insufficient credit balance'
      });
    }

    let waCallResponse: any;
    try {
      waCallResponse = await voiceProvider.initiateWhatsAppCall({
        customer_number: targetCustomerNumber,
        customer_country_code: targetCountryCode,
        customer_name: targetCustomerName,
        whatsapp_number: targetWhatsAppNumber,
        additional_data: additional_data || { source: 'VoicePilot_WhatsApp_Voice' }
      });
    } catch (providerErr: any) {
      if (resolvedWorkspaceId) {
        await settleCallBilling({
          workspaceId: resolvedWorkspaceId,
          reservedAmount: 1.0,
          durationSeconds: 0,
          referenceId: refKey
        });
      }
      const rawMsg = providerErr.message || '';
      const cleanMsg = rawMsg.replace(/Vomyra/gi, 'WhatsApp Voice Cloud');
      throw new Error(cleanMsg || 'Failed to dispatch WhatsApp call');
    }

    res.status(201).json({
      success: true,
      data: waCallResponse
    });
  } catch (error: any) {
    console.error('[API /calls/whatsapp] Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to initiate WhatsApp call' });
  }
});

// GET /api/v1/calls/:id - Get Call Details
callRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const call = await voiceProvider.getCall(id);
    res.json({ success: true, data: call });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/calls/:id/transcript - Get Call Transcript
callRouter.get('/:id/transcript', async (req, res) => {
  try {
    const { id } = req.params;
    const transcript = await voiceProvider.getCallTranscript(id);
    res.json({ success: true, data: transcript });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
