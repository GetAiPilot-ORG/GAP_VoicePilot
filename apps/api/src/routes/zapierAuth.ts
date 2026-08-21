import { Router, Request, Response } from 'express';
import { OAuthServerService } from '../services/oauth-server/OAuthServerService';
import { supabaseAdmin as supabase } from '../config/supabase';
import { ConnectorError } from '../services/connectors/core/errors';

export const zapierAuthRouter = Router();
const oauthService = OAuthServerService.getInstance();

/**
 * GET /api/v1/zapier/auth/test - Zapier Authentication Test Endpoint
 * Requires: Authorization: Bearer <VoicePilot OAuth Access Token>
 */
zapierAuthRouter.get('/auth/test', async (req: Request, res: Response) => {
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

    console.log(`[REAL ZAPIER TRACE] timestamp=${new Date().toISOString()} | method=${req.method} | path=${req.path} | user_agent="${userAgent}" | content_type="${contentType}" | auth_header_present=${!!authHeader} | auth_scheme=${authScheme}`);

    const hasAuthHeader = !!(authHeader && authHeader.startsWith('Bearer '));

    if (!hasAuthHeader) {
      console.log('[REAL ZAPIER TRACE] GET /api/v1/zapier/auth/test FAILED | status=401 | reason="Missing or invalid Bearer header"');
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header. Expected Bearer <token>',
      });
    }

    const token = authHeader!.split(' ')[1].trim();
    const tokenContext = await oauthService.validateAccessToken(token);

    let profileEmail = 'user@voicepilot.ai';
    let profileName = 'Kundan Yadav';

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('id', tokenContext.user_id)
        .maybeSingle();
      if (profile?.email) profileEmail = profile.email;
      if (profile?.name) profileName = profile.name;
    } catch (e) {}

    const payload = {
      id: tokenContext.user_id,
      email: profileEmail,
      name: profileName,
    };

    console.log(`[REAL ZAPIER TRACE] GET /api/v1/zapier/auth/test SUCCESS | status=200 | response_shape_keys=${Object.keys(payload).join(',')}`);

    return res.json(payload);
  } catch (error: any) {
    const statusCode = error instanceof ConnectorError ? error.statusCode : 401;
    console.log(`[REAL ZAPIER TRACE] GET /api/v1/zapier/auth/test FAILED | status=${statusCode} | reason="${error.message}"`);
    return res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});
