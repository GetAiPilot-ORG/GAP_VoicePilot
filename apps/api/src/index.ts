import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from apps/api/.env and root .env before importing any routes
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkyilicraflkgcfgqypc.supabase.co';
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) process.env.NEXT_PUBLIC_SUPABASE_URL = DEFAULT_SUPABASE_URL;
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = DEFAULT_SUPABASE_KEY;

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

import { callRouter } from './routes/calls';
import { campaignRouter } from './routes/campaigns';
import { assistantRouter } from './routes/assistants';
import { phoneNumberRouter } from './routes/phoneNumbers';
import { paymentRouter } from './routes/payments';
import { webhookRouter } from './routes/webhooks';

app.use('/api/v1/calls', callRouter);
app.use('/api/v1/campaigns', campaignRouter);
app.use('/api/v1/assistants', assistantRouter);
app.use('/api/v1/phone-numbers', phoneNumberRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/webhooks', webhookRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', provider: 'vomyra' });
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
