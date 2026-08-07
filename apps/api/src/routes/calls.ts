import { Router } from 'express';
import { VomyraClient } from '../services/voice/providers/vomyra/client';

export const callRouter = Router();
const voiceProvider = new VomyraClient();

callRouter.post('/', async (req, res) => {
  try {
    const { to, from, assistantId, idempotencyKey } = req.body;
    
    // Validate request... (omitted for brevity)
    
    // Call voice provider to initiate call
    const callResponse = await voiceProvider.initiateCall({
      idempotency_key: idempotencyKey,
      assistant: assistantId,
      to,
      from
    });

    res.status(201).json({
      success: true,
      data: callResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to initiate call' });
  }
});
