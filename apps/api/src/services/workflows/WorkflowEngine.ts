import { NormalizedVoicePilotEvent } from '../events/types';
import { EventBus } from '../events/EventBus';
import { ToolExecutor } from '../connectors/core/ToolExecutor';
import { ConnectorRegistry } from '../connectors/core/ConnectorRegistry';
import { TemplateInterpolator } from './TemplateInterpolator';
import { 
  WorkflowDefinition, 
  WorkflowAction, 
  WorkflowActionResult, 
  WorkflowExecutionSummary 
} from './types';
import { supabaseAdmin as supabase } from '../../config/supabase';

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private toolExecutor: ToolExecutor;
  private executedIdempotencyCache = new Set<string>();

  private constructor() {
    this.toolExecutor = new ToolExecutor(ConnectorRegistry.getInstance());
    this.registerEventBusSubscriber();
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * Automatically subscribe Workflow Engine to normalized VoicePilot events via EventBus.
   */
  private registerEventBusSubscriber(): void {
    const eventBus = EventBus.getInstance();
    eventBus.subscribe('*', async (event: NormalizedVoicePilotEvent) => {
      try {
        await this.handleIncomingEvent(event);
      } catch (err: any) {
        console.error(`[WorkflowEngine] Event processing error for ${event.event_id}:`, err.message);
      }
    });
  }

  /**
   * Process incoming normalized event against active workspace workflows.
   */
  public async handleIncomingEvent(
    event: NormalizedVoicePilotEvent,
    options?: { mockWorkflows?: WorkflowDefinition[]; bypassDbChecks?: boolean; mockDbStore?: any }
  ): Promise<WorkflowExecutionSummary[]> {
    if (!event || !event.workspace_id || !event.event_type) {
      return [];
    }

    // 1. Find matching enabled workflows for this workspace and trigger_type
    const workflows = await this.getMatchingWorkflows(event.workspace_id, event.event_type, options);
    if (workflows.length === 0) {
      return [];
    }

    const summaries: WorkflowExecutionSummary[] = [];

    for (const workflow of workflows) {
      // 2. Idempotency Check (prevent duplicate workflow execution per event)
      const idempotencyKey = `wf_exec:${workflow.id}:${event.event_id}`;
      if (this.executedIdempotencyCache.has(idempotencyKey)) {
        console.log(`[WorkflowEngine] Skipping duplicate execution for workflow ${workflow.id} on event ${event.event_id}`);
        continue;
      }
      this.executedIdempotencyCache.add(idempotencyKey);

      // Limit memory cache size
      if (this.executedIdempotencyCache.size > 5000) {
        const first = this.executedIdempotencyCache.values().next().value;
        if (first) this.executedIdempotencyCache.delete(first);
      }

      // 3. Evaluate Conditions
      if (!this.evaluateConditions(workflow.conditions, event)) {
        console.log(`[WorkflowEngine] Workflow '${workflow.name}' conditions not met for event ${event.event_id}`);
        continue;
      }

      // 4. Execute Workflow Actions
      const summary = await this.executeWorkflowActions(workflow, event, options);
      summaries.push(summary);
    }

    return summaries;
  }

  /**
   * Execute actions of a workflow with per-action failure isolation.
   */
  private async executeWorkflowActions(
    workflow: WorkflowDefinition,
    event: NormalizedVoicePilotEvent,
    options?: { mockDbStore?: any; bypassDbChecks?: boolean }
  ): Promise<WorkflowExecutionSummary> {
    const startedAt = new Date().toISOString();
    const actionResults: WorkflowActionResult[] = [];
    let hasSuccess = false;
    let hasFailure = false;

    console.log(`[WorkflowEngine] Executing workflow '${workflow.name}' (${workflow.id}) with ${workflow.actions.length} actions`);

    for (const action of workflow.actions) {
      const actionStartTime = Date.now();
      try {
        // Interpolate variables in action config using event data
        const interpolatedConfig = TemplateInterpolator.interpolate(action.config, event);

        // Execute tool via ToolExecutor
        const result = await this.toolExecutor.execute({
          workspace_id: event.workspace_id,
          agent_id: event.assistant_id || undefined,
          call_id: event.call_id || undefined,
          tool: action.tool_name,
          arguments: interpolatedConfig,
        }, {
          bypassDbChecks: options?.bypassDbChecks,
          mockDbStore: options?.mockDbStore,
        });

        actionResults.push({
          action_id: action.id,
          tool_name: action.tool_name,
          success: result.success,
          data: result.data,
          latency_ms: Date.now() - actionStartTime,
        });

        hasSuccess = true;
      } catch (actionErr: any) {
        hasFailure = true;
        console.error(`[WorkflowEngine] Action '${action.tool_name}' failed in workflow '${workflow.name}':`, actionErr.message);

        // Per-action failure isolation: continue execution of subsequent actions!
        actionResults.push({
          action_id: action.id,
          tool_name: action.tool_name,
          success: false,
          error: actionErr.message,
          latency_ms: Date.now() - actionStartTime,
        });
      }
    }

    const completedAt = new Date().toISOString();
    let finalStatus: 'completed' | 'partial_failure' | 'failed' = 'completed';
    if (hasSuccess && hasFailure) finalStatus = 'partial_failure';
    if (!hasSuccess && hasFailure) finalStatus = 'failed';

    const summary: WorkflowExecutionSummary = {
      execution_id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      trigger_event_id: event.event_id,
      trigger_event_type: event.event_type,
      status: finalStatus,
      action_results: actionResults,
      started_at: startedAt,
      completed_at: completedAt,
    };

    // 5. Log Execution to DB
    await this.logWorkflowExecution(summary);

    return summary;
  }

  /**
   * Evaluate conditions array or object against normalized event data.
   */
  public evaluateConditions(conditions: any, event: NormalizedVoicePilotEvent): boolean {
    if (!conditions || (typeof conditions === 'object' && Object.keys(conditions).length === 0)) {
      return true; // No conditions = always match
    }

    if (Array.isArray(conditions)) {
      return conditions.every((cond) => this.evaluateSingleCondition(cond, event));
    }

    if (typeof conditions === 'object') {
      for (const [key, expectedVal] of Object.entries(conditions)) {
        if (key === 'min_duration') {
          if (event.call.duration_seconds < Number(expectedVal)) return false;
        } else if (key === 'outcome') {
          if (event.outcome !== expectedVal) return false;
        } else if (key === 'status') {
          if (event.call.status !== expectedVal) return false;
        }
      }
    }

    return true;
  }

  private evaluateSingleCondition(cond: any, event: NormalizedVoicePilotEvent): boolean {
    const actualVal = TemplateInterpolator.interpolate(`{{${cond.field}}}`, event);
    const expected = cond.value;

    switch (cond.operator) {
      case 'equals':
        return String(actualVal) === String(expected);
      case 'not_equals':
        return String(actualVal) !== String(expected);
      case 'contains':
        return String(actualVal).includes(String(expected));
      case 'greater_than':
        return Number(actualVal) > Number(expected);
      case 'less_than':
        return Number(actualVal) < Number(expected);
      default:
        return true;
    }
  }

  private async getMatchingWorkflows(
    workspaceId: string,
    triggerType: string,
    options?: { mockWorkflows?: WorkflowDefinition[] }
  ): Promise<WorkflowDefinition[]> {
    if (options?.mockWorkflows) {
      return options.mockWorkflows.filter(
        (w) => w.workspace_id === workspaceId && w.trigger_type === triggerType && w.enabled !== false
      );
    }

    try {
      const { data } = await supabase
        .from('workflows')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('trigger_type', triggerType)
        .eq('enabled', true);

      return (data || []) as WorkflowDefinition[];
    } catch (err: any) {
      console.warn('[WorkflowEngine] DB fetch workflows warning:', err.message);
      return [];
    }
  }

  private async logWorkflowExecution(summary: WorkflowExecutionSummary): Promise<void> {
    try {
      await supabase.from('workflow_execution_logs').insert({
        workflow_id: summary.workflow_id,
        workspace_id: summary.workspace_id,
        trigger_event_id: summary.trigger_event_id,
        trigger_event_type: summary.trigger_event_type,
        status: summary.status,
        action_results: summary.action_results,
        started_at: summary.started_at,
        completed_at: summary.completed_at,
      });
    } catch (e: any) {
      console.warn('[WorkflowEngine] Could not write workflow_execution_logs table:', e.message);
    }
  }
}
