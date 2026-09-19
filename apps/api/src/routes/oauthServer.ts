import { Router, Request, Response } from 'express';
import { OAuthServerService } from '../services/oauth-server/OAuthServerService';
import { ConnectorError } from '../services/connectors/core/errors';
import { supabaseAdmin as supabase } from '../config/supabase';

export const oauthServerRouter = Router();
import { IntegrationAvailabilityManager } from '../services/connectors/core/IntegrationAvailabilityManager';
const availabilityManager = IntegrationAvailabilityManager.getInstance();

const oauthService = OAuthServerService.getInstance();

/**
 * GET /oauth/authorize Handler
 */
export async function handleOAuthAuthorize(req: Request, res: Response) {
  try {
    const {
      response_type,
      client_id,
      redirect_uri,
      state,
      scope,
      workspaceId,
      userId,
    } = req.query as {
      response_type?: string;
      client_id?: string;
      redirect_uri?: string;
      state?: string;
      scope?: string;
      workspaceId?: string;
      userId?: string;
    };

    if (response_type !== 'code') {
      return res.status(400).json({
        error: 'unsupported_response_type',
        error_description: "response_type must be 'code'",
      });
    }

    if (!client_id) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'client_id is required' });
    }

    if (!redirect_uri) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'redirect_uri is required' });
    }

    // Validate client and exact redirect_uri match
    const client = await oauthService.validateClient(client_id, undefined, redirect_uri);

    // If client requested JSON response directly (testing mode or headless auth)
    if (req.headers.accept?.includes('application/json') || req.query.json === 'true') {
      // If workspaceId and userId provided, generate code directly
      if (workspaceId && userId) {
        const code = await oauthService.createAuthorizationCode({
          clientId: client_id,
          userId,
          workspaceId,
          redirectUri: redirect_uri,
          scope,
        });

        const callbackUrl = new URL(redirect_uri);
        callbackUrl.searchParams.set('code', code);
        if (state) callbackUrl.searchParams.set('state', state);

        return res.redirect(callbackUrl.toString());
      }

      return res.json({
        success: true,
        client: { id: client.client_id, name: client.name },
        redirect_uri,
        scope: scope || 'profile:read assistants:read calls:read calls:write contacts:read contacts:write zapier:subscribe',
        state,
      });
    }

    // Direct automated flow if workspaceId and userId provided via query
    if (workspaceId && userId) {
      const code = await oauthService.createAuthorizationCode({
        clientId: client_id,
        userId,
        workspaceId,
        redirectUri: redirect_uri,
        scope,
      });

      const callbackUrl = new URL(redirect_uri);
      callbackUrl.searchParams.set('code', code);
      if (state) callbackUrl.searchParams.set('state', state);

      return res.redirect(callbackUrl.toString());
    }

    // Render Web Consent UI page
    const webUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const consentUrl = new URL(`${webUrl}/oauth/authorize`);
    consentUrl.searchParams.set('client_id', client_id);
    consentUrl.searchParams.set('redirect_uri', redirect_uri);
    if (state) consentUrl.searchParams.set('state', state);
    if (scope) consentUrl.searchParams.set('scope', scope);

    return res.redirect(consentUrl.toString());
  } catch (error: any) {
    const statusCode = error instanceof ConnectorError ? error.statusCode : 400;
    return res.status(statusCode).json({
      error: 'invalid_request',
      error_description: error.message,
    });
  }
}

/**
 * POST /oauth/approve Handler
 */
export async function handleOAuthApprove(req: Request, res: Response) {
  try {
    const { clientId, userId, workspaceId, redirectUri, state, scope } = req.body;

    if (!clientId || !redirectUri) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'clientId and redirectUri are required' });
    }

    // If workspaceId not provided, fallback to user's first workspace
    let targetWorkspaceId = workspaceId;
    let targetUserId = userId;

    if (!targetWorkspaceId || !targetUserId) {
      const { data: ws } = await supabase.from('workspaces').select('id, owner_id').limit(1).single();
      if (ws) {
        targetWorkspaceId = targetWorkspaceId || ws.id;
        targetUserId = targetUserId || ws.owner_id;
      }
    }

    if (!targetWorkspaceId || !targetUserId) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Valid workspace and user identity required' });
    }

    const code = await oauthService.createAuthorizationCode({
      clientId,
      userId: targetUserId,
      workspaceId: targetWorkspaceId,
      redirectUri,
      scope,
    });

    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', code);
    if (state) callbackUrl.searchParams.set('state', state);

    if (req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        redirectUrl: callbackUrl.toString(),
        code,
        state,
      });
    }

    return res.redirect(callbackUrl.toString());
  } catch (error: any) {
    const statusCode = error instanceof ConnectorError ? error.statusCode : 400;
    return res.status(statusCode).json({
      error: 'invalid_request',
      error_description: error.message,
    });
  }
}

/**
 * POST /oauth/token Handler
 */
export async function handleOAuthToken(req: Request, res: Response) {
  try {
    const userAgent = req.headers['user-agent'] || 'none';
    const contentType = req.headers['content-type'] || 'none';
    const authHeader = req.headers.authorization;
    let authScheme = 'none';
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) authScheme = 'Bearer';
      else if (authHeader.startsWith('Basic ')) authScheme = 'Basic';
      else authScheme = 'other';
    }

    const body = req.body || {};
    const grantType = body.grant_type;

    console.log(`[REAL ZAPIER TRACE] timestamp=${new Date().toISOString()} | method=${req.method} | path=${req.path} | user_agent="${userAgent}" | content_type="${contentType}" | auth_header_present=${!!authHeader} | auth_scheme=${authScheme} | grant_type=${grantType || 'none'} | client_id=${body.client_id || 'none'} | redirect_uri=${body.redirect_uri || 'none'}`);

    if (!grantType) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'grant_type is required' });
    }

    // Support parameters in body or HTTP Basic Authentication
    let clientId = body.client_id;
    let clientSecret = body.client_secret;

    if (authHeader && authHeader.startsWith('Basic ')) {
      const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8').split(':');
      clientId = clientId || credentials[0];
      clientSecret = clientSecret || credentials[1];
    }

    if (grantType === 'authorization_code') {
      const code = body.code;
      const redirect_uri = body.redirect_uri;

      if (!code) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'code is required' });
      }
      if (!redirect_uri) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'redirect_uri is required' });
      }

      const tokens = await oauthService.exchangeCodeForTokens({
        clientId,
        clientSecret,
        code,
        redirectUri: redirect_uri,
      });

      console.log(`[REAL ZAPIER TRACE] POST /oauth/token SUCCESS | status=200 | response_shape_keys=${Object.keys(tokens).join(',')}`);
      res.setHeader('Content-Type', 'application/json');
      return res.json(tokens);
    } else if (grantType === 'refresh_token') {
      const refresh_token = body.refresh_token;
      if (!refresh_token) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'refresh_token is required' });
      }

      const tokens = await oauthService.refreshAccessToken({
        clientId,
        clientSecret,
        refreshToken: refresh_token,
      });

      res.setHeader('Content-Type', 'application/json');
      return res.json(tokens);
    } else {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: `grant_type '${grantType}' is not supported`,
      });
    }
  } catch (error: any) {
    const statusCode = error instanceof ConnectorError ? error.statusCode : 400;
    return res.status(statusCode).json({
      error: 'invalid_grant',
      error_description: error.message,
    });
  }
}

// Router mounts
oauthServerRouter.get('/', handleOAuthAuthorize);
oauthServerRouter.get('/authorize', handleOAuthAuthorize);
oauthServerRouter.post('/approve', handleOAuthApprove);
oauthServerRouter.post('/token', handleOAuthToken);
oauthServerRouter.post('/', handleOAuthToken);
