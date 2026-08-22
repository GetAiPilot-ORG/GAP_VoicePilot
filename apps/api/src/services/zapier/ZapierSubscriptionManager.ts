import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin as supabase } from '../../config/supabase';
import { ConnectorError } from '../connectors/core/errors';
import { EventBus } from '../events/EventBus';
import { NormalizedVoicePilotEvent } from '../events/types';

export interface ZapierSubscription {
  id: string;
  workspace_id: string;
  user_id: string;
  hook_url: string;
  event_type: 'call.completed';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ZapierCallCompletedPayload {
  id: string;
  event: 'call.completed';
  event_id: string;
  call_id: string;
  status: string;
  duration_seconds: number;
  customer_name: string;
  customer_phone: string;
  assistant_id: string;
  assistant_name: string;
  summary: string;
  outcome: string;
  created_at: string;
}

export class ZapierSubscriptionManager {
  private static instance: ZapierSubscriptionManager;

  private memorySubscriptions: Map<string, ZapierSubscription> = new Map();
  private deliveredEventIds: Set<string> = new Set();
  private diskStorePath = path.resolve(__dirname, '../../../../../../.zapier_subscriptions.json');

  private constructor() {
    this.loadFromDisk();
    this.setupEventBusListener();
  }

  public static getInstance(): ZapierSubscriptionManager {
    if (!ZapierSubscriptionManager.instance) {
      ZapierSubscriptionManager.instance = new ZapierSubscriptionManager();
    }
    return ZapierSubscriptionManager.instance;
  }

  private saveToDisk() {
    try {
      const array = Array.from(this.memorySubscriptions.values());
      fs.writeFileSync(this.diskStorePath, JSON.stringify(array, null, 2), 'utf-8');
    } catch (e) {
      // Ignore disk write error
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.diskStorePath)) {
        const content = fs.readFileSync(this.diskStorePath, 'utf-8');
        const array: ZapierSubscription[] = JSON.parse(content || '[]');
        for (const sub of array) {
          if (sub.id && sub.status === 'active') {
            this.memorySubscriptions.set(sub.id, sub);
          }
        }
      }
    } catch (e) {
      // Ignore disk read error
    }
  }

  /**
   * Register a new REST Hook subscription for Zapier
   */
  public async createSubscription(params: {
    workspaceId: string;
    userId: string;
    hookUrl: string;
    eventType?: string;
  }): Promise<{ id: string; event_type: string; status: string }> {
    const { workspaceId, userId, hookUrl, eventType } = params;

    if (!hookUrl || !hookUrl.startsWith('http')) {
      throw new ConnectorError('invalid_request', 'Valid hookUrl starting with http:// or https:// is required', 400);
    }

    const targetEvent = 'call.completed';
    const subId = `zap_sub_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date().toISOString();

    const record: ZapierSubscription = {
      id: subId,
      workspace_id: workspaceId,
      user_id: userId,
      hook_url: hookUrl,
      event_type: targetEvent,
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    this.memorySubscriptions.set(subId, record);
    this.saveToDisk();

    try {
      await supabase.from('zapier_subscriptions').insert(record);

      const { data: zapDef } = await supabase.from('connector_definitions').select('id').eq('slug', 'zapier').maybeSingle();
      await supabase.from('workspace_connectors').upsert({
        workspace_id: workspaceId,
        connector_definition_id: zapDef?.id || 'def_zapier',
        name: 'Zapier',
        status: 'connected',
        connected_account_email: 'Zapier Automation',
        metadata: {
          provider: 'zapier',
          authorized_at: now,
        },
        updated_at: now,
      }, { onConflict: 'workspace_id,connector_definition_id' });
    } catch (e) {
      // Fallback to durable file/memory store if table not migrated
    }

    return {
      id: subId,
      event_type: targetEvent,
      status: 'active',
    };
  }

  /**
   * Delete an existing REST Hook subscription with workspace authorization check
   */
  public async deleteSubscription(subId: string, workspaceId: string): Promise<boolean> {
    const existing = this.memorySubscriptions.get(subId);

    if (existing) {
      if (existing.workspace_id !== workspaceId) {
        throw new ConnectorError('unauthorized', 'Subscription does not belong to your workspace', 403);
      }
      this.memorySubscriptions.delete(subId);
      this.saveToDisk();
    }

    try {
      await supabase
        .from('zapier_subscriptions')
        .delete()
        .eq('id', subId)
        .eq('workspace_id', workspaceId);
    } catch (e) {
      // Ignore DB error
    }

    return true;
  }

  /**
   * List active subscriptions for a workspace
   */
  public async getSubscriptionsForWorkspace(workspaceId: string): Promise<ZapierSubscription[]> {
    const memorySubs = Array.from(this.memorySubscriptions.values()).filter(
      (s) => s.workspace_id === workspaceId && s.status === 'active'
    );

    try {
      const { data, error } = await supabase
        .from('zapier_subscriptions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('status', 'active');

      if (!error && data && data.length > 0) {
        const map = new Map<string, ZapierSubscription>();
        memorySubs.forEach((s) => map.set(s.id, s));
        data.forEach((s) => map.set(s.id, s as ZapierSubscription));
        return Array.from(map.values());
      }
    } catch (e) {
      // Ignore DB error
    }

    return memorySubs;
  }

  /**
   * Deliver call.completed payload to all active Zapier REST hooks for the workspace
   */
  public async deliverCallCompleted(event: {
    workspaceId: string;
    eventId?: string;
    callId: string;
    status?: string;
    durationSeconds?: number;
    customerName?: string;
    customerPhone?: string;
    assistantId?: string;
    assistantName?: string;
    summary?: string;
    outcome?: string;
    createdAt?: string;
  }): Promise<{ deliveredCount: number; errors: string[] }> {
    const eventKey = `${event.callId || 'no_call'}:${event.eventId || 'no_evt'}`;

    // Duplicate event suppression
    if (this.deliveredEventIds.has(eventKey)) {
      console.log(`[ZapierHook] Duplicate event suppressed: ${eventKey}`);
      return { deliveredCount: 0, errors: [] };
    }
    this.deliveredEventIds.add(eventKey);

    // Keep deliveredEventIds set bounded
    if (this.deliveredEventIds.size > 5000) {
      const first = this.deliveredEventIds.values().next().value;
      if (first) this.deliveredEventIds.delete(first);
    }

    const subs = await this.getSubscriptionsForWorkspace(event.workspaceId);
    if (subs.length === 0) {
      return { deliveredCount: 0, errors: [] };
    }

    const payload: ZapierCallCompletedPayload = {
      id: event.callId || event.eventId || `evt_${Date.now()}`,
      event: 'call.completed',
      event_id: event.eventId || `evt_${Date.now()}`,
      call_id: event.callId,
      status: event.status || 'completed',
      duration_seconds: Number(event.durationSeconds || 0),
      customer_name: event.customerName || 'Customer',
      customer_phone: event.customerPhone || '',
      assistant_id: event.assistantId || '',
      assistant_name: event.assistantName || 'VoicePilot AI Calling Agent',
      summary: event.summary || 'Call successfully completed with customer.',
      outcome: event.outcome || 'completed',
      created_at: event.createdAt || new Date().toISOString(),
    };

    let deliveredCount = 0;
    const errors: string[] = [];

    for (const sub of subs) {
      // Asynchronous delivery with bounded exponential backoff retries
      this.deliverWithRetry(sub.hook_url, payload, 3)
        .then(() => {
          console.log(`[ZapierHook] Delivered event to ${sub.hook_url} for sub ${sub.id}`);
        })
        .catch((err) => {
          console.error(`[ZapierHook] Delivery failed to ${sub.hook_url}:`, err.message);
        });

      deliveredCount++;
    }

    return { deliveredCount, errors };
  }

  /**
   * Async HTTP POST with bounded retries and exponential backoff
   */
  private async deliverWithRetry(url: string, payload: any, maxAttempts = 3): Promise<void> {
    let attempt = 0;
    let delay = 500;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'VoicePilot-Zapier-Hook/1.0',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          return;
        }

        // Retry on 429 Rate Limit or 5xx Server Error
        if (res.status === 429 || res.status >= 500) {
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
        }

        throw new Error(`Zapier target URL responded with status ${res.status}`);
      } catch (err: any) {
        if (attempt >= maxAttempts) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Listen to EventBus for call.completed events
   */
  private setupEventBusListener(): void {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe('call.completed', async (event: NormalizedVoicePilotEvent) => {
      await this.deliverCallCompleted({
        workspaceId: event.workspace_id,
        eventId: event.event_id,
        callId: event.call_id || event.event_id,
        status: event.call?.status || 'completed',
        durationSeconds: event.call?.duration_seconds || 0,
        customerName: event.customer?.name || undefined,
        customerPhone: event.customer?.phone || undefined,
        assistantId: event.assistant_id || undefined,
        summary: event.summary || undefined,
        outcome: event.outcome || undefined,
        createdAt: event.timestamp,
      });
    });
  }
}
