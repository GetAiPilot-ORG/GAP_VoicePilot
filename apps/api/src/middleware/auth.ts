import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';

export interface AuthenticatedUserRequest extends Request {
  user?: any;
  workspaceId?: string;
  isSuperAdmin?: boolean;
}

/**
 * Express Middleware: Validate Supabase JWT and resolve user workspace
 */
export async function authenticateToken(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer <token>',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Empty token provided',
        code: 'UNAUTHORIZED'
      });
    }

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = user;

    // Resolve user's accessible workspaces
    const { data: members } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id);

    const workspaceIds = members?.map((m: any) => m.workspace_id) || [];
    
    // Header or body workspace override (if member has access to it)
    const requestedWsId = (req.headers['x-workspace-id'] || req.body?.workspaceId || req.query?.workspaceId) as string;

    if (requestedWsId && !workspaceIds.includes(requestedWsId)) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have access to the requested workspace', code: 'WORKSPACE_FORBIDDEN' });
    }
    if (requestedWsId) req.workspaceId = requestedWsId;
    else if (workspaceIds.length > 0) req.workspaceId = workspaceIds[0];
    else return res.status(403).json({ success: false, error: 'Forbidden: No workspace membership found', code: 'NO_WORKSPACE_ACCESS' });

    // Check super admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle();

    req.isSuperAdmin = profile?.is_super_admin === true;

    next();
  } catch (err: any) {
    console.error('[Auth Middleware] Authentication error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication error',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Express Middleware: Enforce Super Admin permissions
 */
export async function requireSuperAdmin(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Super administrator privileges required',
      code: 'FORBIDDEN'
    });
  }
  next();
}
