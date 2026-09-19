import { ConnectorRegistry } from './ConnectorRegistry';
import { CredentialManager } from './CredentialManager';
import { 
  ConnectorNotConnectedError, 
  PermissionDeniedError, 
  ToolDisabledError, 
  ConfirmationRequiredError, 
  TimeoutError, 
  InvalidArgumentsError, 
  ProviderError,
  ConnectorError 
} from './errors';
import { ToolExecutionRequest, ToolExecutionResult, ExecutionContext } from '../types';
import { supabaseAdmin as supabase } from '../../../config/supabase';

export interface ToolExecutorOptions {
  bypassDbChecks?: boolean; // Used for unit testing without a live database connection
  mockDbStore?: {
    workspaceConnectors?: Array<{
      id: string;
      workspace_id: string;
      connector_definition_id: string;
      status: string;
      encrypted_access_token: string | null;
    }>;
    assistantConnectors?: Array<{
      assistant_id: string;
      workspace_connector_id: string;
      enabled: boolean;
    }>;
    toolPermissions?: Array<{
      workspace_connector_id: string;
      assistant_id: string | null;
      tool_name: string;
      enabled: boolean;
      execution_policy: string;
    }>;
  };
}

export class ToolExecutor {
  private registry: ConnectorRegistry;

  constructor(registry: ConnectorRegistry = ConnectorRegistry.getInstance()) {
    this.registry = registry;
  }

  /**
   * Execute a tool request following the 12-step secure connector execution flow.
   */
  public async execute(
    request: ToolExecutionRequest,
    options?: ToolExecutorOptions
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const sanitizedInput = CredentialManager.sanitizeData(request.arguments || {});

    const workspaceId = request.workspace_id;
    const assistantId = request.agent_id || request.assistant_id;
    const callId = request.call_id;
    const toolName = request.tool;

    let workspaceConnectorId: string | null = null;

    try {
      // Step 1 & 2: Validate Server Request & Resolve Workspace
      if (!workspaceId) {
        throw new InvalidArgumentsError('workspace_id is required for tool execution');
      }

      if (!toolName) {
        throw new InvalidArgumentsError('tool name is required for tool execution');
      }

      // Step 3: Resolve Tool from Registry
      const toolMatch = this.registry.getTool(toolName);
      if (!toolMatch) {
        throw new InvalidArgumentsError(`Tool '${toolName}' is unknown or not registered in the system`);
      }

      const { connector, tool } = toolMatch;

      // Step 4: Verify Connector is Connected in DB or Mock Store
      let decryptedCredentials: Record<string, any> = {};

      if (!options?.bypassDbChecks) {
        // Query DB for definition ID
        const { data: defRecord } = await supabase
          .from('connector_definitions')
          .select('id')
          .eq('slug', connector.slug)
          .maybeSingle();

        if (!defRecord) {
          throw new ConnectorNotConnectedError(`Connector '${connector.slug}' definition not found`);
        }

        // Query workspace_connectors table
        const { data: connRecord } = await supabase
          .from('workspace_connectors')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('connector_definition_id', defRecord.id)
          .eq('status', 'connected')
          .maybeSingle();

        if (!connRecord) {
          throw new ConnectorNotConnectedError(`Connector '${connector.slug}' is not connected for workspace ${workspaceId}`);
        }

        workspaceConnectorId = connRecord.id;

        // Step 5: Verify Agent Has Access (if agent_id provided)
        if (assistantId) {
          const { data: astConn } = await supabase
            .from('assistant_connectors')
            .select('enabled')
            .eq('assistant_id', assistantId)
            .eq('workspace_connector_id', connRecord.id)
            .maybeSingle();

          if (!astConn || !astConn.enabled) {
            throw new PermissionDeniedError(`Agent '${assistantId}' does not have access to connector '${connector.slug}'`);
          }
        }

        // Step 6 & 7: Verify Tool Permission & Execution Policy
        const { data: permRecord } = await supabase
          .from('connector_tool_permissions')
          .select('enabled, execution_policy')
          .eq('workspace_connector_id', connRecord.id)
          .eq('tool_name', toolName)
          .maybeSingle();

        if (permRecord) {
          if (!permRecord.enabled || permRecord.execution_policy === 'disabled') {
            throw new ToolDisabledError(toolName);
          }
          if (permRecord.execution_policy === 'confirm') {
            throw new ConfirmationRequiredError(toolName);
          }
        }

        // Step 8: Load Credentials Securely
        if (connRecord.encrypted_access_token) {
          decryptedCredentials = CredentialManager.decrypt(connRecord.encrypted_access_token);
        }
      } else if (options?.mockDbStore) {
        // Evaluate against mock store for testing environment
        const mockStore = options.mockDbStore;
        const connRecord = mockStore.workspaceConnectors?.find(
          (c) => c.workspace_id === workspaceId && c.status === 'connected'
        );

        if (!connRecord) {
          throw new ConnectorNotConnectedError(`Connector '${connector.slug}' is not connected for workspace ${workspaceId}`);
        }

        workspaceConnectorId = connRecord.id;

        if (assistantId) {
          const astConn = mockStore.assistantConnectors?.find(
            (ac) => ac.assistant_id === assistantId && ac.workspace_connector_id === connRecord.id
          );
          if (!astConn || !astConn.enabled) {
            throw new PermissionDeniedError(`Agent '${assistantId}' does not have access to connector '${connector.slug}'`);
          }
        }

        const permRecord = mockStore.toolPermissions?.find(
          (tp) => tp.workspace_connector_id === connRecord.id && tp.tool_name === toolName
        );

        if (permRecord) {
          if (!permRecord.enabled || permRecord.execution_policy === 'disabled') {
            throw new ToolDisabledError(toolName);
          }
          if (permRecord.execution_policy === 'confirm') {
            throw new ConfirmationRequiredError(toolName);
          }
        }

        if (connRecord.encrypted_access_token) {
          decryptedCredentials = CredentialManager.decrypt(connRecord.encrypted_access_token);
        }
      }

      // Step 9: Execute Connector Tool with Timeout Protection
      const executionContext: ExecutionContext = {
        workspaceId,
        assistantId,
        callId,
        credentials: decryptedCredentials,
      };

      const timeoutMs = tool.timeoutMs || 10000;

      const rawResult = await Promise.race([
        connector.executeTool(toolName, request.arguments || {}, executionContext),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new TimeoutError(toolName, timeoutMs)), timeoutMs)
        ),
      ]);

      const latencyMs = Date.now() - startTime;

      // Step 10: Sanitize Result (Never leak tokens to LLM or caller)
      const sanitizedOutput = CredentialManager.sanitizeData(rawResult.data || rawResult);

      const finalResult: ToolExecutionResult = {
        success: true,
        data: sanitizedOutput,
        latencyMs,
      };

      // Step 11: Log Execution to DB
      await this.logExecution({
        workspace_id: workspaceId,
        assistant_id: assistantId || null,
        call_id: callId || null,
        workspace_connector_id: workspaceConnectorId,
        tool_name: toolName,
        sanitized_input: sanitizedInput,
        sanitized_output: sanitizedOutput,
        status: 'success',
        latency_ms: latencyMs,
        error_code: null,
        error_message: null,
      });

      // Step 12: Return Normalized Result
      return finalResult;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const errorCode = err instanceof ConnectorError ? err.code : 'provider_error';
      const errorMessage = err.message || 'Unknown tool execution failure';

      // Log execution failure to DB
      await this.logExecution({
        workspace_id: workspaceId,
        assistant_id: assistantId || null,
        call_id: callId || null,
        workspace_connector_id: workspaceConnectorId,
        tool_name: toolName,
        sanitized_input: sanitizedInput,
        sanitized_output: { error: errorMessage },
        status: 'failed',
        latency_ms: latencyMs,
        error_code: errorCode,
        error_message: errorMessage,
      });

      // Re-throw normalized ConnectorError
      if (err instanceof ConnectorError) {
        throw err;
      }
      throw new ProviderError(errorMessage);
    }
  }

  /**
   * Write log entry to database safely without failing primary tool execution if logging hits DB issues.
   */
  private async logExecution(logPayload: Record<string, any>): Promise<void> {
    try {
      await supabase.from('connector_execution_logs').insert({
        workspace_id: logPayload.workspace_id,
        assistant_id: logPayload.assistant_id,
        call_id: logPayload.call_id,
        workspace_connector_id: logPayload.workspace_connector_id,
        tool_name: logPayload.tool_name,
        sanitized_input: logPayload.sanitized_input,
        sanitized_output: logPayload.sanitized_output,
        status: logPayload.status,
        latency_ms: logPayload.latency_ms,
        error_code: logPayload.error_code,
        error_message: logPayload.error_message,
        created_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn(`[ToolExecutor] Could not write execution log to database:`, e.message);
    }
  }
}
