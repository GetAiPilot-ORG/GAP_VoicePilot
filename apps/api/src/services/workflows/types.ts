export interface WorkflowAction {
  id: string;
  tool_name: string;
  config: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowDefinition {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  trigger_type: string; // 'call.completed', 'call.failed', 'transcript.ready', 'summary.ready'
  conditions?: Record<string, any> | WorkflowCondition[];
  actions: WorkflowAction[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowActionResult {
  action_id: string;
  tool_name: string;
  success: boolean;
  data?: any;
  error?: string;
  latency_ms: number;
}

export interface WorkflowExecutionSummary {
  execution_id: string;
  workflow_id: string;
  workspace_id: string;
  trigger_event_id: string;
  trigger_event_type: string;
  status: 'completed' | 'partial_failure' | 'failed';
  action_results: WorkflowActionResult[];
  started_at: string;
  completed_at: string;
}
