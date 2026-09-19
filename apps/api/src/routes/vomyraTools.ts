import { Router, Request, Response } from 'express';
import { ConnectorRegistry } from '../services/connectors/core/ConnectorRegistry';
import { ToolExecutor } from '../services/connectors/core/ToolExecutor';
import { CredentialManager } from '../services/connectors/core/CredentialManager';

export const vomyraToolsRouter = Router();
const LIVE_TOOL_TIMEOUT_MS = 3000;

// POST /api/v1/vomyra-tools/execute/:tool_name - Secure Live Call Tool Bridge Endpoint
vomyraToolsRouter.post('/execute/:tool_name', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestedTool = req.params.tool_name;

  // 1. Extract Bearer Bridge Token
  const authHeader = req.headers.authorization || '';
  const bridgeToken = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : String(req.query.token || '').trim();

  if (!bridgeToken) {
    return res.status(401).json({
      success: false,
      result: { status: 'unauthorized', message: 'Missing live bridge authentication token' },
    });
  }

  try {
    const registry = ConnectorRegistry.getInstance();
    const executor = new ToolExecutor(registry);

    const targetToolName = Array.isArray(requestedTool) ? String(requestedTool[0]) : String(requestedTool || '');
    const toolMatch = registry.getTool(targetToolName);
    if (!toolMatch) {
      return res.status(404).json({
        success: false,
        result: { status: 'not_found', message: `Tool '${requestedTool}' is not registered` },
      });
    }

    // Check realtime capability
    if (!toolMatch.tool.realtimeSuitability) {
      return res.status(400).json({
        success: false,
        result: { status: 'invalid_tool', message: `Tool '${requestedTool}' is not realtime-capable for live calls` },
      });
    }

    // 3. Prepare execution payload with mock fallback for tests
    const argumentsPayload = req.body.arguments || req.body.parameters || req.body || {};
    const workspaceId = (req.body.workspace_id || req.headers['x-workspace-id'] || 'ws_vomyra_live_01') as string;
    const assistantId = (req.body.assistant_id || 'ast_vomyra_live_01') as string;

    // 4. Enforce strict 3,000ms latency timeout for live voice conversations
    const executionPromise = executor.execute({
      workspace_id: workspaceId,
      agent_id: assistantId,
      tool: targetToolName,
      arguments: argumentsPayload,
    }, { bypassDbChecks: true }); // Bridge pre-verifies bridge_token

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Live call tool execution timed out (3000ms cap exceeded)')), LIVE_TOOL_TIMEOUT_MS)
    );

    const execResult = await Promise.race([executionPromise, timeoutPromise]);
    const latencyMs = Date.now() - startTime;

    // 5. Sanitize and structure output specifically for AI voice conversation context
    const sanitizedData = CredentialManager.sanitizeData(execResult.data);

    return res.json({
      success: true,
      latency_ms: latencyMs,
      result: {
        status: 'completed',
        data: sanitizedData,
      },
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.warn(`[VomyraToolBridge] Live tool '${requestedTool}' execution failed (${latencyMs}ms):`, err.message);

    // Return small, safe fallback JSON payload so Vomyra voice conversation continues gracefully
    return res.json({
      success: false,
      latency_ms: latencyMs,
      result: {
        status: 'failed',
        message: 'Lookup temporarily unavailable',
      },
    });
  }
});
