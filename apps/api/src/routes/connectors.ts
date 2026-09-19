import { Router, Request, Response } from 'express';
import { OAuthManager } from '../services/connectors/core/OAuthManager';
import { CredentialVault } from '../services/connectors/core/CredentialVault';
import { ConnectorRegistry } from '../services/connectors/core/ConnectorRegistry';
import { MockConnector } from '../services/connectors/mock/MockConnector';
import { GmailConnector } from '../services/connectors/providers/gmail/GmailConnector';
import { SlackConnector } from '../services/connectors/providers/slack/SlackConnector';
import { ZapierConnector } from '../services/connectors/providers/zapier/ZapierConnector';
import { SalesforceConnector } from '../services/connectors/providers/salesforce/SalesforceConnector';
import { NotionConnector } from '../services/connectors/providers/notion/NotionConnector';
import { LinearConnector } from '../services/connectors/providers/linear/LinearConnector';
import { HubSpotConnector } from '../services/connectors/providers/hubspot/HubSpotConnector';
import { MCPConnector } from '../services/connectors/providers/mcp/MCPConnector';
import { ConnectorError } from '../services/connectors/core/errors';
import { supabaseAdmin as supabase } from '../config/supabase';

import { oauthServerRouter, handleOAuthAuthorize, handleOAuthApprove, handleOAuthToken } from '../routes/oauthServer';
import { zapierAuthRouter } from '../routes/zapierAuth';

export const connectorRouter = Router();

// Explicit OAuth 2.0 Authorization Server routes
connectorRouter.get('/oauth/authorize', handleOAuthAuthorize);
connectorRouter.post('/oauth/token', handleOAuthToken);
connectorRouter.post('/oauth/approve', handleOAuthApprove);
connectorRouter.use('/oauth', oauthServerRouter);
connectorRouter.use('/zapier', zapierAuthRouter);

// Ensure registry has all native and MCP connectors registered with fresh instances
const registry = ConnectorRegistry.getInstance();
registry.registerConnector(new MockConnector());
registry.registerConnector(new GmailConnector());
registry.registerConnector(new SlackConnector());
registry.registerConnector(new ZapierConnector());
registry.registerConnector(new SalesforceConnector());
registry.registerConnector(new HubSpotConnector());
registry.registerConnector(new NotionConnector());
registry.registerConnector(new LinearConnector());
registry.registerConnector(new MCPConnector());

// POST /api/v1/connectors/mcp/discover - Discover Tools on External MCP Server
connectorRouter.post('/mcp/discover', async (req: Request, res: Response) => {
  try {
    const { server_url, auth_type, credential } = req.body;
    if (!server_url) {
      return res.status(400).json({ success: false, error: 'server_url is required for MCP discovery' });
    }

    const mcpConnector = registry.getConnector('mcp') as MCPConnector;
    if (!mcpConnector) {
      return res.status(500).json({ success: false, error: 'MCP Connector is not registered' });
    }

    const discoveryResult = await mcpConnector.discoverTools(server_url, auth_type || 'none', credential);
    return res.json(discoveryResult);
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});




const oauthManager = new OAuthManager(registry);

import { IntegrationAvailabilityManager } from '../services/connectors/core/IntegrationAvailabilityManager';
const availabilityManager = IntegrationAvailabilityManager.getInstance();

// GET /api/v1/connectors/admin/availability - Admin List Integration Availability
connectorRouter.get('/admin/availability', async (req: Request, res: Response) => {
  try {
    await availabilityManager.syncFromDatabase();
    const availabilities = availabilityManager.getAllAvailabilities();
    return res.json({ success: true, availabilities });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/connectors/admin/availability - Admin Update Integration Availability
connectorRouter.post('/admin/availability', async (req: Request, res: Response) => {
  try {
    const { slug, availability_status, is_visible, internal_note } = req.body;
    if (!slug) {
      return res.status(400).json({ success: false, error: 'slug is required' });
    }

    const updated = await availabilityManager.updateAvailability(slug, {
      availability_status,
      is_visible,
      internal_note,
    });

    return res.json({ success: true, record: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/connectors/:provider/authorize - Initiate OAuth Flow
connectorRouter.get('/:provider/authorize', async (req: Request, res: Response, next: any) => {
  try {
    const provider = String(req.params.provider || '');
    if (!availabilityManager.isAllowedToAuthorize(provider)) {
      return res.status(403).json({
        success: false,
        error: 'This integration is currently unavailable.',
      });
    }

    if (provider === 'oauth' || provider === 'zapier') {
      return handleOAuthAuthorize(req, res);
    }
    if (provider === 'slack') {
      registry.registerConnector(new SlackConnector());
    }
    const { workspaceId, userId, redirectUrl } = req.query as {
      workspaceId?: string;
      userId?: string;
      redirectUrl?: string;
    };

    const targetWorkspaceId = Array.isArray(workspaceId) ? String(workspaceId[0]) : workspaceId ? String(workspaceId) : '';
    const targetUserId = Array.isArray(userId) ? String(userId[0]) : userId ? String(userId) : undefined;
    const targetRedirectUrl = Array.isArray(redirectUrl) ? String(redirectUrl[0]) : redirectUrl ? String(redirectUrl) : undefined;

    if (!targetWorkspaceId) {
      return res.status(400).json({ success: false, error: 'workspaceId query parameter is required' });
    }

    const { authUrl, state } = await oauthManager.initiateAuth(targetWorkspaceId, provider, {
      userId: targetUserId,
      redirectUrl: targetRedirectUrl,
    });

    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, authUrl, state });
    }

    return res.redirect(authUrl);
  } catch (error: any) {
    const statusCode = error instanceof ConnectorError ? error.statusCode : 500;
    return res.status(statusCode).json({ success: false, error: error.message });
  }
});

// POST /api/v1/connectors/:provider/token - OAuth Server Token Exchange
connectorRouter.post('/:provider/token', (req: Request, res: Response, next: any) => {
  const provider = String(req.params.provider || '');
  if (provider === 'oauth' || provider === 'zapier') {
    return handleOAuthToken(req, res);
  }
  next();
});

// GET /api/v1/connectors/:provider/callback - Handle OAuth Callback
connectorRouter.get('/:provider/callback', async (req: Request, res: Response) => {
  try {
    const provider = String(req.params.provider || '');
    const { code, state, error: reqError } = req.query;

    const codeStr = Array.isArray(code) ? String(code[0]) : code ? String(code) : undefined;
    const stateStr = Array.isArray(state) ? String(state[0]) : state ? String(state) : undefined;
    const errorStr = Array.isArray(reqError) ? String(reqError[0]) : reqError ? String(reqError) : undefined;

    const result = await oauthManager.handleCallback(provider, codeStr, stateStr, errorStr);



    // If client requested JSON response (API mode), return JSON metadata, otherwise redirect to frontend settings
    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, connector: result.connector, redirectUrl: result.redirectUrl });
    }

    return res.redirect(result.redirectUrl);
  } catch (error: any) {
    console.error(`[OAuth Callback Error] Provider '${req.params.provider}':`, error.message);
    const fallbackFrontendUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/connectors?connector=${req.params.provider}&status=error&message=${encodeURIComponent(error.message)}`;
    
    if (req.headers.accept?.includes('application/json')) {
      const statusCode = error instanceof ConnectorError ? error.statusCode : 400;
      return res.status(statusCode).json({ success: false, error: error.message });
    }

    return res.redirect(fallbackFrontendUrl);
  }
});

import { ConnectorConfigManager } from '../config/connectorConfig';

// GET /api/v1/connectors - List Workspace Connectors & Definitions
connectorRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query as { workspaceId?: string };

    await availabilityManager.syncFromDatabase();
    const allDbAvailabilities = availabilityManager.getAllAvailabilities();

    const registrySlugs = new Set<string>();
    const definitions: any[] = registry
      .listConnectors()
      .filter((c) => c.slug !== 'mock')
      .map((c) => {
        registrySlugs.add(c.slug);
        const config = ConnectorConfigManager.getProviderConfig(c.slug);
        const avail = availabilityManager.getAvailability(c.slug);
        return {
          slug: c.slug,
          name: c.name,
          description: c.description,
          authType: c.authType,
          executionType: c.executionType,
          available: config.isConfigured,
          configurationStatus: config.configurationStatus,
          availabilityStatus: avail?.availability_status || 'enabled',
          isVisible: avail?.is_visible !== false,
          internalNote: avail?.internal_note || '',
          updatedAt: avail?.updated_at || new Date().toISOString(),
          tools: c.listTools(),
        };
      });

    const redundantSlugs = new Set(['google_calendar', 'google_sheets', 'google_contacts', 'google_drive', 'google_meet', 'vomyra_crm', 'api']);
    for (const avail of allDbAvailabilities) {
      if (!registrySlugs.has(avail.slug) && avail.slug !== 'mock' && !redundantSlugs.has(avail.slug)) {
        const config = ConnectorConfigManager.getProviderConfig(avail.slug);
        definitions.push({
          slug: avail.slug,
          name: avail.name || avail.slug,
          description: avail.internal_note || `${avail.name} Integration`,
          authType: 'oauth2',
          executionType: 'native',
          available: config.isConfigured,
          configurationStatus: config.configurationStatus,
          availabilityStatus: avail.availability_status || 'enabled',
          isVisible: avail.is_visible !== false,
          internalNote: avail.internal_note || '',
          updatedAt: avail.updated_at || new Date().toISOString(),
          tools: [],
        });
      }
    }

    let connectedAccounts: any[] = [];
    if (workspaceId && workspaceId !== 'default') {
      const { data: connData } = await supabase
        .from('workspace_connectors')
        .select('*, connector_definitions(slug)')
        .eq('workspace_id', workspaceId);

      if (connData && connData.length > 0) {
        connectedAccounts = connData.map((item: any) => {
          const meta = CredentialVault.toPublicMetadata(item);
          const resolvedSlug = item.connector_definitions?.slug || item.metadata?.provider || item.connector_definition_id || '';
          return {
            ...meta,
            provider_slug: resolvedSlug,
            provider: resolvedSlug,
            slug: resolvedSlug,
          };
        });
      }
    }

    console.log(`[OAuth Diagnostic] connector_status_lookup_found: ${Boolean(connectedAccounts.length > 0)} | count: ${connectedAccounts.length}`);

    return res.json({
      success: true,
      definitions,
      connectedAccounts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/connectors/:provider/status - Get Status for Workspace Connector
connectorRouter.get('/:provider/status', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { workspaceId } = req.query as { workspaceId?: string };

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'workspaceId query parameter is required' });
    }

    const { data: def } = await supabase
      .from('connector_definitions')
      .select('id')
      .eq('slug', provider)
      .maybeSingle();

    if (!def) {
      return res.status(404).json({ success: false, error: `Connector provider '${provider}' not found` });
    }

    const { data: connRecord } = await supabase
      .from('workspace_connectors')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_definition_id', def.id)
      .maybeSingle();

    if (!connRecord) {
      return res.json({
        success: true,
        connected: false,
        status: 'disconnected',
        connector: null,
      });
    }

    const safeMetadata = CredentialVault.toPublicMetadata(connRecord);
    return res.json({
      success: true,
      connected: safeMetadata.status === 'connected',
      status: safeMetadata.status,
      connector: safeMetadata,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/connectors/:provider/disconnect - Disconnect Workspace Connector
connectorRouter.post('/:provider/disconnect', async (req: Request, res: Response) => {
  try {
    const { workspaceId, workspaceConnectorId } = req.body;

    if (!workspaceId || !workspaceConnectorId) {
      return res.status(400).json({ success: false, error: 'workspaceId and workspaceConnectorId are required' });
    }

    await oauthManager.disconnectConnector(workspaceConnectorId, workspaceId);

    return res.json({
      success: true,
      message: `Connector '${workspaceConnectorId}' disconnected successfully`,
    });
  } catch (error: any) {
    const statusCode = error instanceof ConnectorError ? error.statusCode : 500;
    return res.status(statusCode).json({ success: false, error: error.message });
  }
});

// POST /api/v1/connectors/:provider/refresh - Refresh OAuth Access Token
connectorRouter.post('/:provider/refresh', async (req: Request, res: Response) => {
  try {
    const { workspaceConnectorId } = req.body;

    if (!workspaceConnectorId) {
      return res.status(400).json({ success: false, error: 'workspaceConnectorId is required' });
    }

    const updatedMetadata = await oauthManager.refreshConnectorToken(workspaceConnectorId);

    return res.json({
      success: true,
      connector: updatedMetadata,
    });
  } catch (error: any) {
    const statusCode = error instanceof ConnectorError ? error.statusCode : 400;
    return res.status(statusCode).json({ success: false, error: error.message });
  }
});
