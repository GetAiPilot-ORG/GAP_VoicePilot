import crypto from 'crypto';
import { NormalizedVoicePilotEvent, VoicePilotEventType, VomyraWebhookPayload } from './types';
import { CredentialManager } from '../connectors/core/CredentialManager';
import { supabaseAdmin as supabase } from '../../config/supabase';

export class VomyraNormalizer {
  /**
   * Normalize raw Vomyra webhook payload into one or more VoicePilot events.
   */
  public static async normalize(payload: VomyraWebhookPayload): Promise<NormalizedVoicePilotEvent[]> {
    if (!payload || !payload.event) {
      throw new Error('Invalid Vomyra payload: missing event field');
    }

    const rawData = payload.data || {};
    const callId = rawData.call_id || (payload as any).call_id || null;
    const assistantId = rawData.assistant_id || (payload as any).assistant_id || null;

    // Resolve workspace ID from DB
    const workspaceId = await this.resolveWorkspaceId(callId, assistantId);

    const callerNumber = rawData.caller?.number || rawData.customer_number || null;
    const callerName = rawData.caller?.name || rawData.customer_name || 'Customer';

    const durationSeconds = Number(rawData.duration_seconds || 0);
    const cost = rawData.cost !== undefined ? Number(rawData.cost) : null;
    const statusStr = String(rawData.status || 'completed').toLowerCase();
    const endedReason = rawData.ended_reason || null;

    const baseEvent: Omit<NormalizedVoicePilotEvent, 'event_id' | 'event_type'> = {
      provider: 'vomyra',
      provider_event_id: callId ? `vomyra_${callId}_${payload.event}` : null,
      timestamp: new Date().toISOString(),
      workspace_id: workspaceId,
      assistant_id: assistantId,
      call_id: callId,
      customer: {
        name: callerName,
        phone: callerNumber,
      },
      call: {
        duration_seconds: durationSeconds,
        status: statusStr,
        ended_reason: endedReason,
        cost,
      },
      transcript: rawData.transcript || null,
      transcript_url: rawData.transcript_url || null,
      recording_url: rawData.recording_url || null,
      summary: rawData.summary || null,
      outcome: rawData.outcome || null,
    };

    const events: NormalizedVoicePilotEvent[] = [];

    // Map primary event
    const primaryType = this.mapPrimaryEventType(payload.event, statusStr, endedReason);
    const primaryEventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const primaryNormalized: NormalizedVoicePilotEvent = {
      ...baseEvent,
      event_id: primaryEventId,
      event_type: primaryType,
    };

    events.push(CredentialManager.sanitizeData(primaryNormalized) as NormalizedVoicePilotEvent);

    // Derive transcript.ready if transcript is present on end of call
    if ((payload.event === 'call.ended' || payload.event === 'call.completed') && (rawData.transcript || rawData.transcript_url)) {
      events.push(CredentialManager.sanitizeData({
        ...baseEvent,
        event_id: `evt_${Date.now()}_tr_${crypto.randomBytes(3).toString('hex')}`,
        event_type: 'transcript.ready',
      }) as NormalizedVoicePilotEvent);
    }

    // Derive recording.ready if recording_url is present on end of call
    if ((payload.event === 'call.ended' || payload.event === 'call.completed') && rawData.recording_url) {
      events.push(CredentialManager.sanitizeData({
        ...baseEvent,
        event_id: `evt_${Date.now()}_rec_${crypto.randomBytes(3).toString('hex')}`,
        event_type: 'recording.ready',
      }) as NormalizedVoicePilotEvent);
    }

    // Derive summary.ready if summary is present on end of call
    if ((payload.event === 'call.ended' || payload.event === 'call.completed') && rawData.summary) {
      events.push(CredentialManager.sanitizeData({
        ...baseEvent,
        event_id: `evt_${Date.now()}_sum_${crypto.randomBytes(3).toString('hex')}`,
        event_type: 'summary.ready',
      }) as NormalizedVoicePilotEvent);
    }

    return events;
  }

  private static mapPrimaryEventType(vomyraEvent: string, status: string, endedReason: string | null): VoicePilotEventType {
    switch (vomyraEvent) {
      case 'call.started':
        return 'call.started';
      case 'call.answered':
        return 'call.answered';
      case 'transcript.ready':
        return 'transcript.ready';
      case 'recording.ready':
        return 'recording.ready';
      case 'summary.ready':
        return 'summary.ready';
      case 'call.failed':
        return 'call.failed';
      case 'call.ended':
      case 'call.completed':
      default:
        if (status === 'failed' || status === 'no-answer' || status === 'busy' || endedReason === 'error') {
          return 'call.failed';
        }
        return 'call.completed';
    }
  }

  private static async resolveWorkspaceId(callId: string | null, assistantId: string | null): Promise<string> {
    if (callId) {
      try {
        const { data } = await supabase
          .from('call_records')
          .select('workspace_id')
          .eq('provider_resource_id', callId)
          .limit(1)
          .maybeSingle();

        if (data?.workspace_id) return data.workspace_id;
      } catch (e) {}
    }

    if (assistantId) {
      try {
        const { data } = await supabase
          .from('assistants')
          .select('workspace_id')
          .eq('provider_resource_id', assistantId)
          .limit(1)
          .maybeSingle();

        if (data?.workspace_id) return data.workspace_id;
      } catch (e) {}
    }

    // Fallback: look up default workspace
    try {
      const { data } = await supabase.from('workspaces').select('id').limit(1).maybeSingle();
      if (data?.id) return data.id;
    } catch (e) {}

    return 'ws_default_voicepilot';
  }
}
