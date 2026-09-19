export type VoicePilotEventType =
  | 'call.started'
  | 'call.answered'
  | 'call.completed'
  | 'call.failed'
  | 'transcript.ready'
  | 'recording.ready'
  | 'summary.ready';

export interface CustomerMetadata {
  name: string | null;
  phone: string | null;
}

export interface CallMetrics {
  duration_seconds: number;
  status: string;
  ended_reason: string | null;
  cost: number | null;
}

export interface NormalizedVoicePilotEvent {
  event_id: string;
  event_type: VoicePilotEventType;
  provider: string; // 'vomyra'
  provider_event_id: string | null;
  timestamp: string;
  workspace_id: string;
  assistant_id: string | null;
  call_id: string | null;
  customer: CustomerMetadata;
  call: CallMetrics;
  transcript: string | null;
  transcript_url: string | null;
  recording_url: string | null;
  summary: string | null;
  outcome: string | null;
  metadata?: Record<string, any>;
}

export interface VomyraWebhookPayload {
  event: string;
  data?: {
    call_id?: string;
    assistant_id?: string;
    status?: string;
    ended_reason?: string;
    duration_seconds?: number;
    cost?: number;
    transcript?: string;
    transcript_url?: string;
    recording_url?: string;
    summary?: string;
    outcome?: string;
    caller?: {
      number?: string;
      name?: string;
    };
    customer_number?: string;
    customer_name?: string;
    transfer_destination?: string;
    tool_name?: string;
    [key: string]: any;
  };
  timestamp?: string | number;
}

export type EventSubscriberCallback = (event: NormalizedVoicePilotEvent) => Promise<void> | void;
