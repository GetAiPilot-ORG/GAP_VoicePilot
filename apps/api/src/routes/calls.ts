import { Router } from 'express';
import { VomyraClient } from '../services/voice/providers/vomyra/client';
import { requireMinCredits } from '../middleware/entitlements';
import { reserveCredits, settleCallBilling } from '../services/billing';

export const callRouter = Router();
const voiceProvider = new VomyraClient();

callRouter.post('/', requireMinCredits(1.0), async (req, res) => {
  try {
    const { to, from, assistantId, idempotencyKey, workspaceId } = req.body;
    
    // Reserve estimated 5 minutes credit upfront if workspaceId is present
    let creditReservation: any = null;
    if (workspaceId) {
      creditReservation = await reserveCredits(workspaceId, 5.0, idempotencyKey, 'Single call credit hold');
      if (!creditReservation.success) {
        return res.status(402).json({
          success: false,
          error: creditReservation.error || 'Insufficient credit balance'
        });
      }
    }

    // Call voice provider to initiate call
    let callResponse: any;
    try {
      callResponse = await voiceProvider.initiateCall({
        idempotency_key: idempotencyKey,
        assistant: assistantId,
        to,
        from
      });
    } catch (providerErr: any) {
      // Release credit reservation on failure
      if (workspaceId) {
        await settleCallBilling({
          workspaceId,
          reservedAmount: 5.0,
          durationSeconds: 0,
          referenceId: idempotencyKey
        });
      }
      throw providerErr;
    }

    res.status(201).json({
      success: true,
      data: callResponse
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to initiate call' });
  }
});

