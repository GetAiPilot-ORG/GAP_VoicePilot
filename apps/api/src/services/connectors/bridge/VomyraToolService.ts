import crypto from 'crypto';
import { VomyraClient } from '../../voice/providers/vomyra/client';
import { ConnectorRegistry } from '../core/ConnectorRegistry';
import { ConnectorToolDefinition } from '../types';

export interface VomyraToolMappingRecord {
  id: string;
  workspace_id: string;
  assistant_id: string;
  workspace_connector_id?: string;
  voicepilot_tool_name: string;
  vomyra_tool_id: string;
  vomyra_assistant_id: string;
  when_to_call: 'beforeCall' | 'onCall' | 'afterCall';
  enabled: boolean;
  bridge_token: string;
  configuration_hash: string;
  last_synced_at: string;
}

export class VomyraToolService {
  private vomyraClient: VomyraClient;
  private registry: ConnectorRegistry;
  private cachedApiRequestTypeId: string | null = null;

  constructor(vomyraClient?: VomyraClient, registry?: ConnectorRegistry) {
    this.vomyraClient = vomyraClient || new VomyraClient();
    this.registry = registry || ConnectorRegistry.getInstance();
  }

  /**
   * Discover and cache the Vomyra 'apiRequest' tool type ObjectId.
   */
  public async getApiRequestToolTypeId(): Promise<string> {
    if (this.cachedApiRequestTypeId) {
      return this.cachedApiRequestTypeId;
    }

    try {
      const toolTypes = await this.vomyraClient.getToolTypes();
      const apiReqType = toolTypes.find(
        (t: any) => t.type === 'apiRequest' || t.name?.toLowerCase().includes('apirequest') || t.name === 'API Request'
      );

      if (apiReqType && (apiReqType.id || apiReqType._id)) {
        this.cachedApiRequestTypeId = apiReqType.id || apiReqType._id;
        return this.cachedApiRequestTypeId!;
      }
    } catch (err: any) {
      console.warn('[VomyraToolService] Failed to fetch /v1/tool-types, fallback to default:', err.message);
    }

    // Fallback default ObjectID for apiRequest tool type
    this.cachedApiRequestTypeId = '60a71f000000000000000001';
    return this.cachedApiRequestTypeId;
  }

  /**
   * Convert a VoicePilot Tool Definition into a Vomyra apiRequest Tool Payload.
   */
  public buildVomyraToolPayload(
    toolDef: ConnectorToolDefinition,
    bridgeUrl: string,
    bridgeToken: string,
    apiRequestTypeId: string,
    whenToCall: 'beforeCall' | 'onCall' | 'afterCall' = 'onCall'
  ): Record<string, any> {
    const rawProperties = toolDef.inputSchema?.properties || {};
    const requiredFields = toolDef.inputSchema?.required || [];

    const parameters = Object.entries(rawProperties).map(([propName, propSchema]: [string, any]) => ({
      name: propName,
      type: propSchema.type || 'string',
      description: propSchema.description || `Parameter '${propName}'`,
      required: requiredFields.includes(propName),
    }));

    return {
      name: `VoicePilot ${toolDef.name}`,
      description: toolDef.description,
      type: apiRequestTypeId,
      when_to_call: whenToCall,
      function: {
        request_url: bridgeUrl,
        request_http_method: 'POST',
        authentication: {
          type: 'bearer',
          bearer_token: bridgeToken,
        },
        parameters,
      },
    };
  }

  /**
   * Compute a deterministic hash of the tool configuration to enforce idempotency.
   */
  public computeConfigurationHash(toolName: string, schema: any, whenToCall: string): string {
    const rawStr = JSON.stringify({ toolName, schema, whenToCall });
    return crypto.createHash('md5').update(rawStr).digest('hex');
  }

  /**
   * Generate a high-entropy secret token for Vomyra -> VoicePilot bridge authentication.
   */
  public generateBridgeToken(): string {
    return `vp_br_${crypto.randomBytes(24).toString('hex')}`;
  }
}
