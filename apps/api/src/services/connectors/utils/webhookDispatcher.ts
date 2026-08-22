import crypto from 'crypto';
import { SSRFGuard } from './ssrfGuard';
import { CredentialManager } from '../core/CredentialManager';
import { supabaseAdmin as supabase } from '../../../config/supabase';

export type VoicePilotEventType = 
  | 'call.started'
  | 'call.answered'
  | 'call.completed'
  | 'call.failed'
  | 'transcript.ready'
  | 'summary.ready'
  | 'lead.qualified'
  | 'zapier.ping';

export interface StandardizedEventPayload {
  event: VoicePilotEventType;
  event_id: string;
  timestamp: string;
  workspace_id: string;
  agent_id: string | null;
  call_id: string | null;
  customer: {
    name: string | null;
    phone: string | null;
  };
  call: {
    duration: number;
    status: string;
  };
  summary: string | null;
  outcome: string | null;
  [key: string]: any;
}

export interface DispatchOptions {
  destinationUrl: string;
  secret?: string | null;
  maxRetries?: number;
  timeoutMs?: number;
  workspaceConnectorId?: string | null;
}

export class WebhookDispatcher {
  /**
   * Build standardized, leak-free event payload structure.
   */
  public static buildStandardPayload(params: {
    event: VoicePilotEventType;
    workspaceId: string;
    agentId?: string | null;
    callId?: string | null;
    customerName?: string | null;
    customerPhone?: string | null;
    duration?: number;
    callStatus?: string;
    summary?: string | null;
    outcome?: string | null;
    additionalData?: Record<string, any>;
  }): StandardizedEventPayload {
    const eventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const rawPayload: StandardizedEventPayload = {
      event: params.event,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      workspace_id: params.workspaceId,
      agent_id: params.agentId || null,
      call_id: params.callId || null,
      customer: {
        name: params.customerName || null,
        phone: params.customerPhone || null,
      },
      call: {
        duration: params.duration || 0,
        status: params.callStatus || 'completed',
      },
      summary: params.summary || null,
      outcome: params.outcome || null,
      ...(params.additionalData ? CredentialManager.sanitizeData(params.additionalData) : {}),
    };

    return CredentialManager.sanitizeData(rawPayload) as StandardizedEventPayload;
  }

  /**
   * Dispatch webhook event asynchronously with SSRF validation, exponential backoff, and retry logic.
   * Returns immediately (non-blocking).
   */
  public static dispatchAsync(
    payload: StandardizedEventPayload,
    options: DispatchOptions
  ): Promise<{ success: boolean; attempts: number; lastStatusCode?: number; error?: string }> {
    // Non-blocking background execution
    return new Promise((resolve) => {
      setImmediate(async () => {
        const result = await this.executeDispatch(payload, options);
        resolve(result);
      });
    });
  }

  /**
   * Execute dispatch synchronously with retries.
   */
  public static async executeDispatch(
    payload: StandardizedEventPayload,
    options: DispatchOptions
  ): Promise<{ success: boolean; attempts: number; lastStatusCode?: number; error?: string }> {
    const startTime = Date.now();
    const maxRetries = options.maxRetries ?? 3;
    const timeoutMs = options.timeoutMs ?? 8000;

    // 1. SSRF Validation
    let validatedUrl: URL;
    try {
      validatedUrl = SSRFGuard.validateDestinationUrl(options.destinationUrl);
    } catch (ssrfErr: any) {
      const errMessage = ssrfErr.message;
      await this.logDelivery({
        workspaceId: payload.workspace_id,
        agentId: payload.agent_id,
        callId: payload.call_id,
        workspaceConnectorId: options.workspaceConnectorId,
        toolName: 'zapier.dispatch_event',
        sanitizedInput: { destination_url: options.destinationUrl, event: payload.event },
        sanitizedOutput: { error: errMessage },
        status: 'failed',
        latencyMs: Date.now() - startTime,
        errorCode: 'ssrf_blocked',
        errorMessage: errMessage,
      });

      return { success: false, attempts: 0, error: errMessage };
    }

    const rawBody = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'VoicePilot-Webhook-Dispatcher/1.0',
      'X-VoicePilot-Event': payload.event,
      'X-VoicePilot-Delivery': payload.event_id,
    };

    if (options.secret) {
      const signature = crypto.createHmac('sha256', options.secret).update(rawBody).digest('hex');
      headers['X-VoicePilot-Signature'] = `sha256=${signature}`;
    }

    let lastError = '';
    let lastStatusCode = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(validatedUrl.toString(), {
          method: 'POST',
          headers,
          body: rawBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        lastStatusCode = res.status;

        if (res.ok || (res.status >= 200 && res.status < 300)) {
          const latencyMs = Date.now() - startTime;
          const sanitizedOutput = { status: res.status, ok: true, attempts: attempt };

          await this.logDelivery({
            workspaceId: payload.workspace_id,
            agentId: payload.agent_id,
            callId: payload.call_id,
            workspaceConnectorId: options.workspaceConnectorId,
            toolName: 'zapier.dispatch_event',
            sanitizedInput: CredentialManager.sanitizeData(payload),
            sanitizedOutput,
            status: 'success',
            latencyMs,
            errorCode: null,
            errorMessage: null,
          });

          return { success: true, attempts: attempt, lastStatusCode };
        }

        lastError = `HTTP ${res.status}: ${res.statusText}`;

        // Don't retry client 4xx errors (except 429 Rate Limit)
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          break;
        }
      } catch (err: any) {
        lastError = err.name === 'AbortError' ? `Request timed out after ${timeoutMs}ms` : err.message;
      }

      // Exponential backoff delay before retry
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }

    const latencyMs = Date.now() - startTime;
    const sanitizedOutput = { error: lastError, lastStatusCode, attempts: maxRetries };

    await this.logDelivery({
      workspaceId: payload.workspace_id,
      agentId: payload.agent_id,
      callId: payload.call_id,
      workspaceConnectorId: options.workspaceConnectorId,
      toolName: 'zapier.dispatch_event',
      sanitizedInput: CredentialManager.sanitizeData(payload),
      sanitizedOutput,
      status: 'failed',
      latencyMs,
      errorCode: 'webhook_delivery_failed',
      errorMessage: lastError,
    });

    return { success: false, attempts: maxRetries, lastStatusCode, error: lastError };
  }

  private static async logDelivery(logPayload: Record<string, any>): Promise<void> {
    try {
      await supabase.from('connector_execution_logs').insert({
        workspace_id: logPayload.workspaceId,
        assistant_id: logPayload.agentId || null,
        call_id: logPayload.callId || null,
        workspace_connector_id: logPayload.workspaceConnectorId || null,
        tool_name: logPayload.toolName,
        sanitized_input: logPayload.sanitizedInput,
        sanitized_output: logPayload.sanitizedOutput,
        status: logPayload.status,
        latency_ms: logPayload.latencyMs,
        error_code: logPayload.errorCode,
        error_message: logPayload.errorMessage,
        created_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn('[WebhookDispatcher] Could not log delivery to DB:', e.message);
    }
  }
}
