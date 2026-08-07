import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

import { callRouter } from './routes/calls';
import { campaignRouter } from './routes/campaigns';
import { assistantRouter } from './routes/assistants';
import { phoneNumberRouter } from './routes/phoneNumbers';

app.use('/api/v1/calls', callRouter);
app.use('/api/v1/campaigns', campaignRouter);
app.use('/api/v1/assistants', assistantRouter);
app.use('/api/v1/phone-numbers', phoneNumberRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', provider: 'vomyra' });
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
