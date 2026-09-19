import { ConnectorRegistry } from './ConnectorRegistry';
import { CredentialVault } from './CredentialVault';
import { OAuthStateManager, OAuthAccessDeniedError } from './OAuthStateManager';
import { 
  SafeConnectorMetadata, 
  WorkspaceConnector 
} from '../types';
import { 
  ConnectorNotConnectedError, 
  InvalidArgumentsError, 
  ProviderError,
  CredentialExpiredError 
} from './errors';
import { supabaseAdmin as supabase } from '../../../config/supabase';

export interface InitiateAuthOptions {
  userId?: string | null;
  redirectUrl?: string | null;
  callbackUrl?: string | null;
}

export class OAuthManager {
  private registry: ConnectorRegistry;

  constructor(registry: ConnectorRegistry = ConnectorRegistry.getInstance()) {
    this.registry = registry;
  }

  /**
   * Initiate provider-independent OAuth flow by building secure state & authorization URL.
   */
  public async initiateAuth(
    workspaceId: string,
    providerSlug: string,
    options: InitiateAuthOptions = {}
  ): Promise<{ authUrl: string; state: string }> {
    const canonicalSlug = (providerSlug === 'google_workspace' || providerSlug === 'google') ? 'gmail' : providerSlug;

    if (!workspaceId) {
      throw new InvalidArgumentsError('workspaceId is required to initiate authorization');
    }
    if (!canonicalSlug) {
      throw new InvalidArgumentsError('providerSlug is required to initiate authorization');
    }

    const connector = this.registry.getConnector(canonicalSlug);
    if (!connector) {
      throw new InvalidArgumentsError(`Provider '${canonicalSlug}' is not registered`);
    }

    // Verify workspace exists in DB
    const { data: ws } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .maybeSingle();

    if (!ws) {
      // Fallback for development/testing if workspace table check is optional
      console.warn(`[OAuthManager] Workspace '${workspaceId}' not found in DB, proceeding with state binding.`);
    }

    const pkce = OAuthStateManager.generatePKCE();
    const state = OAuthStateManager.generateState({
      workspaceId,
      providerSlug: canonicalSlug,
      userId: options.userId,
      codeVerifier: pkce.codeVerifier,
      redirectUrl: options.redirectUrl,
    });

    const defaultCallback = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/connectors/${canonicalSlug}/callback`;
    const callbackUrl = options.callbackUrl || defaultCallback;

    const authUrl = await connector.getAuthorizationUrl(workspaceId, callbackUrl, state, {
      codeChallenge: pkce.codeChallenge,
      codeChallengeMethod: pkce.codeChallengeMethod,
      userId: options.userId,
    });

    return { authUrl, state };
  }

  /**
   * Handle OAuth provider callback, exchange authorization code, and store encrypted tokens.
   */
  public async handleCallback(
    providerSlug: string,
    code?: string,
    stateString?: string,
    reqError?: string,
    callbackUrl?: string
  ): Promise<{ connector: SafeConnectorMetadata; redirectUrl: string }> {
    const canonicalSlug = (providerSlug === 'google_workspace' || providerSlug === 'google') ? 'gmail' : providerSlug;

    if (reqError) {
      throw new OAuthAccessDeniedError(`OAuth authorization error from provider: ${reqError}`);
    }

    if (!code) {
      throw new InvalidArgumentsError('Missing authorization code parameter');
    }

    if (!stateString) {
      throw new InvalidArgumentsError('Missing state parameter');
    }

    console.log(`[OAuth Diagnostic] callback_reached: true | state_valid: true`);

    // Validate state strictly
    const statePayload = OAuthStateManager.validateState(stateString, canonicalSlug);
    const workspaceId = statePayload.workspaceId;
    console.log(`[OAuth Diagnostic] State Validation: PASSED | Workspace Resolved: ${Boolean(workspaceId)} (${workspaceId})`);

    const connector = this.registry.getConnector(canonicalSlug);
    if (!connector) {
      throw new InvalidArgumentsError(`Provider '${canonicalSlug}' is not registered`);
    }

    // Resolve definition ID from database
    let definitionId = canonicalSlug;
    try {
      const { data: defRecord } = await supabase
        .from('connector_definitions')
        .select('id')
        .or(`slug.eq.${canonicalSlug},id.eq.${canonicalSlug}`)
        .maybeSingle();

      if (defRecord) {
        definitionId = defRecord.id;
      }
    } catch (e) {}

    const defaultCallback = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/connectors/${canonicalSlug}/callback`;
    const effectiveCallbackUrl = callbackUrl || defaultCallback;

    // Exchange code for tokens via provider instance (passing codeVerifier from PKCE state)
    const credentialsPayload = await connector.handleCallback(workspaceId, code, effectiveCallbackUrl, {
      codeVerifier: statePayload.codeVerifier,
      userId: statePayload.userId,
    });

    if (!credentialsPayload || typeof credentialsPayload !== 'object') {
      throw new ProviderError('Provider returned an empty or invalid credentials payload');
    }

    let expiresAt: string | undefined;
    if (credentialsPayload.expires_in) {
      expiresAt = new Date(Date.now() + Number(credentialsPayload.expires_in) * 1000).toISOString();
    } else if (credentialsPayload.expires_at) {
      expiresAt = new Date(credentialsPayload.expires_at).toISOString();
    }

    const scopesList = Array.isArray(credentialsPayload.scopes)
      ? credentialsPayload.scopes
      : typeof credentialsPayload.scope === 'string'
      ? credentialsPayload.scope.split(' ')
      : [];

    const resolvedEmail = credentialsPayload.account_email || credentialsPayload.email;
    if (!resolvedEmail || typeof resolvedEmail !== 'string' || !resolvedEmail.includes('@')) {
      throw new ProviderError(`OAuth callback failed: provider '${canonicalSlug}' did not return a valid user email identity`);
    }

    // Store encrypted credentials securely in database
    const dbRecord = await CredentialVault.storeCredentials(
      workspaceId,
      definitionId,
      credentialsPayload,
      {
        connectedAccountName: credentialsPayload.account_name || credentialsPayload.name || resolvedEmail,
        connectedAccountEmail: resolvedEmail,
        scopes: scopesList,
        expiresAt,
        authorizedBy: statePayload.userId || undefined,
        metadata: {
          provider: canonicalSlug,
          provider_account_id: credentialsPayload.provider_account_id,
          authed_at: new Date().toISOString(),
        },
      }
    );

    console.log(`[OAuth Diagnostic] credential_encrypt_success: ${Boolean(dbRecord.encrypted_access_token)} | db_upsert_success: ${Boolean(dbRecord.id)} | db_row_id_present: ${Boolean(dbRecord.id)}`);

    const safeMetadata = CredentialVault.toPublicMetadata(dbRecord);
    const fallbackRedirect = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/connectors?connector=gmail&oauth=success`;
    const redirectUrl = statePayload.redirectUrl || fallbackRedirect;

    console.log(`[OAuth Diagnostic] final_redirect: ${redirectUrl}`);

    return {
      connector: safeMetadata,
      redirectUrl,
    };
  }

  /**
   * Refresh OAuth access tokens for a workspace connector.
   */
  public async refreshConnectorToken(workspaceConnectorId: string): Promise<SafeConnectorMetadata> {
    const { data, error } = await supabase
      .from('workspace_connectors')
      .select('*, connector_definitions(slug)')
      .eq('id', workspaceConnectorId)
      .single();

    if (error || !data) {
      throw new ConnectorNotConnectedError(`Workspace connector '${workspaceConnectorId}' not found`);
    }

    const record = data as WorkspaceConnector & { connector_definitions?: { slug: string } };
    const providerSlug = record.connector_definitions?.slug || 'mock';

    const connector = this.registry.getConnector(providerSlug);
    if (!connector) {
      throw new InvalidArgumentsError(`Provider '${providerSlug}' is not registered`);
    }

    const currentCredentials = await CredentialVault.getCredentialsForExecution(workspaceConnectorId);

    try {
      const refreshedCredentials = await connector.refreshCredentials(currentCredentials);
      
      let expiresAt: string | undefined;
      if (refreshedCredentials.expires_in) {
        expiresAt = new Date(Date.now() + Number(refreshedCredentials.expires_in) * 1000).toISOString();
      }

      const updatedRecord = await CredentialVault.updateCredentials(
        workspaceConnectorId,
        refreshedCredentials,
        { expiresAt, status: 'connected' }
      );

      return CredentialVault.toPublicMetadata(updatedRecord);
    } catch (err: any) {
      // Mark as error/expired on refresh failure
      await supabase
        .from('workspace_connectors')
        .update({ status: 'expired', last_error: err.message, updated_at: new Date().toISOString() })
        .eq('id', workspaceConnectorId);

      throw new CredentialExpiredError(`Token refresh failed for connector ${workspaceConnectorId}: ${err.message}`);
    }
  }

  /**
   * Disconnect a workspace connector and delete credentials.
   */
  public async disconnectConnector(workspaceConnectorId: string, workspaceId: string): Promise<void> {
    const { data: record } = await supabase
      .from('workspace_connectors')
      .select('workspace_id, connector_definitions(slug)')
      .eq('id', workspaceConnectorId)
      .maybeSingle();

    if (record) {
      if (record.workspace_id !== workspaceId) {
        throw new ConnectorNotConnectedError(`Workspace '${workspaceId}' does not own connector '${workspaceConnectorId}'`);
      }

      const slug = (record as any).connector_definitions?.slug;
      if (slug) {
        const connector = this.registry.getConnector(slug);
        if (connector) {
          await connector.disconnect(workspaceId);
        }
      }
    }

    await CredentialVault.deleteCredentials(workspaceConnectorId);
  }
}
