import { BaseConnector } from '../../core/BaseConnector';
import { 
  ConnectorToolDefinition, 
  ExecutionContext, 
  ToolExecutionResult, 
  AuthType, 
  ExecutionType, 
  HealthCheckResult 
} from '../../types';
import { WebhookDispatcher, VoicePilotEventType } from '../../utils/webhookDispatcher';
import { SSRFGuard } from '../../utils/ssrfGuard';
import { ProviderError, InvalidArgumentsError } from '../../core/errors';

export class ZapierConnector extends BaseConnector {
  public readonly slug = 'zapier';
  public readonly name = 'Zapier';
  public readonly description = 'Trigger custom Zapier webhooks and automated multi-step workflows on VoicePilot call events';
  public readonly authType: AuthType = 'webhook';
  public readonly executionType: ExecutionType = 'webhook';

  public listTools(): ConnectorToolDefinition[] {
    return [
      {
        name: 'zapier.test_webhook',
        connectorSlug: this.slug,
        description: 'Send a test ping event to verify your Zapier Webhook URL',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_url: { type: 'string', description: 'Target Zapier Catch Hook URL (https://hooks.zapier.com/hooks/catch/...)' },
            secret: { type: 'string', description: 'Optional HMAC secret key' },
          },
          required: ['webhook_url'],
        },
        executionType: 'webhook',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'read',
      },
      {
        name: 'zapier.trigger_webhook',
        connectorSlug: this.slug,
        description: 'Dispatch custom call data to Zapier workflow',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_url: { type: 'string', description: 'Target Zapier Catch Hook URL' },
            event: { type: 'string', description: 'VoicePilot event name (e.g. call.completed, lead.qualified)', default: 'call.completed' },
            customer_name: { type: 'string' },
            customer_phone: { type: 'string' },
            summary: { type: 'string' },
            outcome: { type: 'string' },
          },
          required: ['webhook_url'],
        },
        executionType: 'webhook',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
      {
        name: 'zapier.dispatch_event',
        connectorSlug: this.slug,
        description: 'Asynchronously dispatch a standardized call event payload to Zapier webhook endpoint',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_url: { type: 'string', description: 'Target Zapier Webhook URL' },
            event: { type: 'string', description: 'Event type (e.g. call.started, call.completed, lead.qualified)' },
            call_id: { type: 'string' },
            customer_name: { type: 'string' },
            customer_phone: { type: 'string' },
            summary: { type: 'string' },
            outcome: { type: 'string' },
          },
          required: ['webhook_url', 'event'],
        },
        executionType: 'webhook',
        realtimeSuitability: true,
        timeoutMs: 8000,
        permissionCategory: 'write',
      },
    ];
  }

  public async healthCheck(credentials: Record<string, any>): Promise<HealthCheckResult> {
    const webhookUrl = credentials.webhook_url || credentials.destination_url;
    if (!webhookUrl) {
      return { healthy: false, status: 'error', message: 'No target webhook URL configured' };
    }

    try {
      SSRFGuard.validateDestinationUrl(webhookUrl);
      return { healthy: true, status: 'connected', message: 'Zapier Webhook URL is valid' };
    } catch (e: any) {
      return { healthy: false, status: 'error', message: e.message };
    }
  }

  public async executeTool(
    toolName: string,
    args: Record<string, any>,
    context: ExecutionContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    if (toolName === 'zapier.test_webhook') {
      this.validateRequiredArgs(args, ['webhook_url']);
      const webhookUrl = String(args.webhook_url).trim();
      const secret = args.secret ? String(args.secret).trim() : null;

      const payload = WebhookDispatcher.buildStandardPayload({
        event: 'zapier.ping',
        workspaceId: context.workspaceId,
        agentId: context.assistantId,
        callId: context.callId,
        summary: 'VoicePilot Zapier Webhook Connectivity Test',
        outcome: 'test_successful',
      });

      const dispatchResult = await WebhookDispatcher.executeDispatch(payload, {
        destinationUrl: webhookUrl,
        secret,
        maxRetries: 2,
        timeoutMs: 6000,
      });

      if (!dispatchResult.success) {
        throw new ProviderError(`Zapier test webhook failed: ${dispatchResult.error || 'Connection failed'}`);
      }

      return {
        success: true,
        data: {
          ok: true,
          event_id: payload.event_id,
          status_code: dispatchResult.lastStatusCode,
          attempts: dispatchResult.attempts,
          message: 'Test ping delivered to Zapier Webhook successfully',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    if (toolName === 'zapier.trigger_webhook' || toolName === 'zapier.dispatch_event') {
      this.validateRequiredArgs(args, ['webhook_url']);
      const webhookUrl = String(args.webhook_url || context.credentials.webhook_url || '').trim();
      const eventName = (args.event || 'call.completed') as VoicePilotEventType;

      const payload = WebhookDispatcher.buildStandardPayload({
        event: eventName,
        workspaceId: context.workspaceId,
        agentId: context.assistantId,
        callId: args.call_id || context.callId,
        customerName: args.customer_name,
        customerPhone: args.customer_phone,
        summary: args.summary,
        outcome: args.outcome,
      });

      // Non-blocking asynchronous dispatch
      WebhookDispatcher.dispatchAsync(payload, {
        destinationUrl: webhookUrl,
        secret: context.credentials.secret,
        maxRetries: 3,
        timeoutMs: 8000,
      });

      return {
        success: true,
        data: {
          ok: true,
          event_id: payload.event_id,
          event: payload.event,
          status: 'dispatched_async',
          message: 'Event payload queued for asynchronous delivery to Zapier',
        },
        latencyMs: Date.now() - startTime,
      };
    }

    throw new ProviderError(`Unknown tool '${toolName}' for Zapier connector`);
  }
}
