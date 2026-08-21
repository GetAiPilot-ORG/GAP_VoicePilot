import { supabaseAdmin as supabase } from '../../../config/supabase';

export type AvailabilityStatus = 'enabled' | 'disabled' | 'coming_soon';

export interface ConnectorAvailabilityRecord {
  slug: string;
  name: string;
  availability_status: AvailabilityStatus;
  is_visible: boolean;
  internal_note?: string;
  updated_at: string;
}

export class IntegrationAvailabilityManager {
  private static instance: IntegrationAvailabilityManager;

  // In-memory cache for fast, zero-latency enforcement
  private availabilityMap: Map<string, ConnectorAvailabilityRecord> = new Map();

  private constructor() {
    this.seedDefaultState();
    this.syncFromDatabase().catch(() => {});
  }

  public static getInstance(): IntegrationAvailabilityManager {
    if (!IntegrationAvailabilityManager.instance) {
      IntegrationAvailabilityManager.instance = new IntegrationAvailabilityManager();
    }
    return IntegrationAvailabilityManager.instance;
  }

  private seedDefaultState() {
    const now = new Date().toISOString();
    const defaults: Array<{ slug: string; name: string; availability_status: AvailabilityStatus; is_visible: boolean; internal_note: string }> = [
      { slug: 'gmail', name: 'Google Workspace', availability_status: 'enabled', is_visible: true, internal_note: 'Primary Unified Google Workspace Connector' },
      { slug: 'slack', name: 'Slack Integration', availability_status: 'enabled', is_visible: true, internal_note: 'Slack Team Integration' },
      { slug: 'zapier_webhook', name: 'Webhooks', availability_status: 'enabled', is_visible: true, internal_note: 'Native Webhook Integration' },
      
      // Additional Connectors - Enabled & Ready
      { slug: 'hubspot', name: 'HubSpot CRM', availability_status: 'enabled', is_visible: true, internal_note: 'HubSpot CRM OAuth 2.1 & Remote MCP Integration' },
      { slug: 'notion', name: 'Notion Workspace', availability_status: 'enabled', is_visible: true, internal_note: 'Notion Workspace OAuth Integration' },
      { slug: 'salesforce', name: 'Salesforce CRM', availability_status: 'enabled', is_visible: true, internal_note: 'Salesforce CRM OAuth 2.0 Integration' },
      { slug: 'linear', name: 'Linear Issue Tracker', availability_status: 'enabled', is_visible: true, internal_note: 'Linear OAuth 2.0 Issue Tracker Integration' },
      { slug: 'mcp', name: 'Custom MCP Server', availability_status: 'disabled', is_visible: true, internal_note: 'Custom MCP Server Integration' },
      
      // Disabled Connectors
      { slug: 'zapier', name: 'Zapier Native App', availability_status: 'disabled', is_visible: false, internal_note: 'Zapier Native OAuth App - Disabled for customers' },
      
      // Coming Soon Connectors
      { slug: 'make', name: 'Make (Integromat)', availability_status: 'coming_soon', is_visible: true, internal_note: 'Make Automation - Coming Soon' },
      { slug: 'n8n', name: 'n8n Workflow Automation', availability_status: 'coming_soon', is_visible: true, internal_note: 'n8n Automation - Coming Soon' },
    ];

    for (const d of defaults) {
      this.availabilityMap.set(d.slug, {
        ...d,
        updated_at: now,
      });
    }
  }

  public async syncFromDatabase() {
    try {
      const { data, error } = await supabase
        .from('connector_definitions')
        .select('slug, name, availability_status, is_visible, internal_note, updated_at');

      if (!error && data && data.length > 0) {
        for (const row of data) {
          if (row.slug && row.slug !== 'outlook') {
            this.availabilityMap.set(row.slug, {
              slug: row.slug,
              name: row.name || row.slug,
              availability_status: (row.availability_status as AvailabilityStatus) || 'enabled',
              is_visible: row.is_visible !== false,
              internal_note: row.internal_note || '',
              updated_at: row.updated_at || new Date().toISOString(),
            });
          }
        }
      }
      this.availabilityMap.delete('outlook');

      // Purge outlook row from DB if still present
      await supabase.from('connector_definitions').delete().eq('slug', 'outlook');
    } catch (e) {
      // Ignore DB schema error, rely on in-memory defaults
    }
  }

  public isAllowedToAuthorize(slug: string): boolean {
    const record = this.availabilityMap.get(slug);
    if (!record) return true; // Default allow if unknown
    return record.availability_status === 'enabled';
  }

  public getAvailability(slug: string): ConnectorAvailabilityRecord | undefined {
    return this.availabilityMap.get(slug);
  }

  public getAllAvailabilities(): ConnectorAvailabilityRecord[] {
    return Array.from(this.availabilityMap.values());
  }

  public async updateAvailability(
    slug: string,
    updates: {
      availability_status?: AvailabilityStatus;
      is_visible?: boolean;
      internal_note?: string;
    }
  ): Promise<ConnectorAvailabilityRecord> {
    const existing = this.availabilityMap.get(slug) || {
      slug,
      name: slug,
      availability_status: 'enabled',
      is_visible: true,
      internal_note: '',
      updated_at: new Date().toISOString(),
    };

    const updatedRecord: ConnectorAvailabilityRecord = {
      ...existing,
      availability_status: updates.availability_status || existing.availability_status,
      is_visible: updates.is_visible !== undefined ? updates.is_visible : existing.is_visible,
      internal_note: updates.internal_note !== undefined ? updates.internal_note : existing.internal_note,
      updated_at: new Date().toISOString(),
    };

    this.availabilityMap.set(slug, updatedRecord);

    try {
      await supabase
        .from('connector_definitions')
        .update({
          availability_status: updatedRecord.availability_status,
          is_visible: updatedRecord.is_visible,
          internal_note: updatedRecord.internal_note,
          updated_at: updatedRecord.updated_at,
        })
        .eq('slug', slug);
    } catch (e) {
      // DB error swallowed, memory map retains updated state
    }

    return updatedRecord;
  }
}
