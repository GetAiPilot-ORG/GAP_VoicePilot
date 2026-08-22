export type AuthType = 'oauth2' | 'api_key' | 'bearer_token' | 'webhook' | 'none';
export type ExecutionType = 'native' | 'webhook' | 'mcp';
export type ConnectorStatus = 'active' | 'beta' | 'deprecated' | 'disabled';
export type ConnectionAccountStatus = 'connected' | 'error' | 'expired' | 'disabled';
export type ExecutionPolicy = 'automatic' | 'confirm' | 'disabled';
export type ExecutionLogStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type PermissionCategory = 'read' | 'write' | 'admin';

export interface ConnectorDefinition {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  auth_type: AuthType;
  execution_type: ExecutionType;
  status: ConnectorStatus;
  supports_realtime: boolean;
  supports_async: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceConnector {
  id: string;
  workspace_id: string;
  connector_definition_id: string;
  name: string | null;
  status: ConnectionAccountStatus;
  connected_account_name: string | null;
  connected_account_email: string | null;
  encrypted_access_token: string | null;
  encrypted_refresh_token: string | null;
  token_expires_at: string | null;
  scopes: string[];
  metadata: Record<string, any>;
  authorized_by: string | null;
  authorized_at: string;
  last_health_check_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafeConnectorMetadata {
  id: string;
  workspace_id: string;
  connector_definition_id: string;
  provider_slug?: string;
  name: string | null;
  status: ConnectionAccountStatus;
  connected_account_name: string | null;
  connected_account_email: string | null;
  token_expires_at: string | null;
  scopes: string[];
  metadata: Record<string, any>;
  authorized_by: string | null;
  authorized_at: string;
  last_health_check_at: string | null;
  last_error: string | null;
  needs_reauthorization: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssistantConnector {
  id: string;
  assistant_id: string;
  workspace_connector_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectorToolPermission {
  id: string;
  workspace_connector_id: string;
  assistant_id: string | null;
  tool_name: string;
  enabled: boolean;
  execution_policy: ExecutionPolicy;
  created_at: string;
  updated_at: string;
}

export interface ConnectorExecutionLog {
  id: string;
  workspace_id: string;
  assistant_id: string | null;
  call_id: string | null;
  workspace_connector_id: string | null;
  tool_name: string;
  sanitized_input: Record<string, any>;
  sanitized_output: Record<string, any>;
  status: ExecutionLogStatus;
  latency_ms: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ConnectorToolDefinition {
  name: string; // e.g. "gmail.send_email", "mock.echo"
  connectorSlug: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  executionType: ExecutionType;
  realtimeSuitability: boolean;
  timeoutMs: number;
  permissionCategory: PermissionCategory;
}

export interface ExecutionContext {
  workspaceId: string;
  assistantId?: string;
  callId?: string;
  credentials: Record<string, any>;
}

export interface ToolExecutionRequest {
  workspace_id: string;
  agent_id?: string;
  assistant_id?: string; // fallback alias for agent_id
  call_id?: string;
  tool: string; // e.g. "mock.echo"
  arguments: Record<string, any>;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  latencyMs?: number;
}

export interface HealthCheckResult {
  healthy: boolean;
  status: ConnectionAccountStatus;
  message?: string;
  details?: Record<string, any>;
}
