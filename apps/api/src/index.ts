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

app.use('/api/v1/calls', callRouter);
app.use('/api/v1/campaigns', campaignRouter);
app.use('/api/v1/assistants', assistantRouter);
app.use('/api/v1/phone-numbers', phoneNumberRouter);
app.use('/api/v1/payments', paymentRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', provider: 'vomyra' });
});

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Backend</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6; }
        h1 { border-bottom: 2px solid #eaeaea; padding-bottom: 0.5rem; }
        .endpoint-list { background: #f9f9f9; padding: 1.5rem 3rem; border-radius: 8px; border: 1px solid #eaeaea; }
        li { margin-bottom: 0.75rem; font-family: monospace; font-size: 1.1rem; }
        a { color: #0070f3; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .tag { background: #0070f3; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-right: 0.5rem; font-family: sans-serif; }
      </style>
    </head>
    <body>
      <h1>API Server Running 🚀</h1>
      <p>Welcome to the backend server. Here are the available base API endpoints you can interact with:</p>
      
      <div class="endpoint-list">
        <ul>
          <li><span class="tag">GET</span> <a href="/health">/health</a> - API Health Check</li>
          <li><span class="tag">API</span> <a href="/api/v1/calls">/api/v1/calls</a> - Calls operations</li>
          <li><span class="tag">API</span> <a href="/api/v1/campaigns">/api/v1/campaigns</a> - Campaigns operations</li>
          <li><span class="tag">API</span> <a href="/api/v1/assistants">/api/v1/assistants</a> - Assistants operations</li>
          <li><span class="tag">API</span> <a href="/api/v1/phone-numbers">/api/v1/phone-numbers</a> - Phone numbers operations</li>
          <li><span class="tag">API</span> <a href="/api/v1/payments">/api/v1/payments</a> - Payments operations</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
