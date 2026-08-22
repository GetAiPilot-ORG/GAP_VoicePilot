import { 
  NormalizedVoicePilotEvent, 
  VoicePilotEventType, 
  EventSubscriberCallback 
} from './types';
import { CredentialManager } from '../connectors/core/CredentialManager';
import { WebhookDispatcher } from '../connectors/utils/webhookDispatcher';
import { supabaseAdmin as supabase } from '../../config/supabase';

export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, Set<EventSubscriberCallback>> = new Map();

  private constructor() {
    // Auto-setup internal decoupled integrations listener (Zapier / Webhooks dispatching)
    this.setupAutomatedIntegrationSubscriber();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to specific VoicePilot event type or wildcard '*' for all events.
   * Returns an unsubscribe function.
   */
  public subscribe(eventType: VoicePilotEventType | '*', callback: EventSubscriberCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    const set = this.subscribers.get(eventType)!;
    set.add(callback);

    return () => {
      set.delete(callback);
    };
  }

  /**
   * Publish normalized VoicePilot event to event bus and persistent DB store.
   */
  public async publish(event: NormalizedVoicePilotEvent, rawPayload?: any): Promise<void> {
    console.log(`[EventBus] Publishing normalized event: ${event.event_type} (${event.event_id})`);

    // 1. Save normalized event to DB store
    try {
      await supabase.from('voicepilot_events').insert({
        event_id: event.event_id,
        event_type: event.event_type,
        provider: event.provider,
        provider_event_id: event.provider_event_id,
        workspace_id: event.workspace_id,
        assistant_id: event.assistant_id,
        call_id: event.call_id,
        sanitized_payload: CredentialManager.sanitizeData(event),
        raw_provider_payload: rawPayload ? CredentialManager.sanitizeData(rawPayload) : null,
        status: 'normalized',
        created_at: new Date().toISOString(),
      });
    } catch (dbErr: any) {
      console.warn('[EventBus] DB save event warning (schema missing or local test):', dbErr.message);
    }

    // 2. Dispatch to subscribers asynchronously
    const callbacksToNotify = new Set<EventSubscriberCallback>();

    const specificSubscribers = this.subscribers.get(event.event_type);
    if (specificSubscribers) {
      specificSubscribers.forEach((cb) => callbacksToNotify.add(cb));
    }

    const wildcardSubscribers = this.subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach((cb) => callbacksToNotify.add(cb));
    }

    let dispatchSuccess = true;

    for (const callback of callbacksToNotify) {
      try {
        await Promise.resolve(callback(event));
      } catch (err: any) {
        dispatchSuccess = false;
        console.error(`[EventBus] Subscriber error for event ${event.event_type}:`, err.message);
      }
    }

    // Update DB status to 'dispatched' or 'failed'
    try {
      await supabase
        .from('voicepilot_events')
        .update({ status: dispatchSuccess ? 'dispatched' : 'failed' })
        .eq('event_id', event.event_id);
    } catch (e) {}
  }

  /**
   * Automated decoupled subscriber connecting active Zapier webhooks to normalized events.
   */
  private setupAutomatedIntegrationSubscriber(): void {
    this.subscribe('*', async (event: NormalizedVoicePilotEvent) => {
      try {
        // Query DB for workspace connectors configured for Zapier or webhooks
        const { data: connectors } = await supabase
          .from('workspace_connectors')
          .select('id, connector_definition_id, metadata, status')
          .eq('workspace_id', event.workspace_id)
          .eq('status', 'connected');

        if (!connectors || connectors.length === 0) return;

        for (const conn of connectors) {
          const webhookUrl = conn.metadata?.webhook_url || conn.metadata?.destination_url;
          if (webhookUrl && conn.connector_definition_id === 'def_zapier') {
            const standardPayload = WebhookDispatcher.buildStandardPayload({
              event: event.event_type as any,
              workspaceId: event.workspace_id,
              agentId: event.assistant_id,
              callId: event.call_id,
              customerName: event.customer.name,
              customerPhone: event.customer.phone,
              duration: event.call.duration_seconds,
              callStatus: event.call.status,
              summary: event.summary,
              outcome: event.outcome,
            });

            // Dispatch in background
            WebhookDispatcher.dispatchAsync(standardPayload, {
              destinationUrl: webhookUrl,
              secret: conn.metadata?.secret,
              maxRetries: 3,
              timeoutMs: 8000,
              workspaceConnectorId: conn.id,
            });
          }
        }
      } catch (err: any) {
        // Silently capture background integration errors
      }
    });
  }

  public clearSubscribers(): void {
    this.subscribers.clear();
    this.setupAutomatedIntegrationSubscriber();
  }
}
