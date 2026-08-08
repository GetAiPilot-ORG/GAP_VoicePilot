import { Request, Response, NextFunction } from 'express';
import { checkFeaturePermission, getWorkspaceBalance } from '../services/billing';

export interface AuthenticatedRequest extends Request {
  workspaceId?: string;
  userId?: string;
}

/**
 * Express Middleware: Enforce Sub-Feature Entitlement
 */
export function requireFeature(featureKey: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = (req.body?.workspaceId || req.headers['x-workspace-id'] || req.query?.workspaceId) as string;

      if (!workspaceId) {
        // If workspace ID isn't passed in header or body, proceed for now or return 400
        return next();
      }

      const hasAccess = await checkFeaturePermission(workspaceId, featureKey);

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Feature Access Denied',
          feature: featureKey,
          message: `Your workspace plan does not include access to '${featureKey}'. Upgrade your subscription plan to unlock this feature.`
        });
      }

      next();
    } catch (err: any) {
      console.error(`Entitlement check error for ${featureKey}:`, err);
      next(); // Fail open or closed depending on preference; failing open with log for dev stability
    }
  };
}

/**
 * Express Middleware: Require Minimum Credit Balance
 */
export function requireMinCredits(minCredits: number = 1.0) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = (req.body?.workspaceId || req.headers['x-workspace-id'] || req.query?.workspaceId) as string;

      if (!workspaceId) {
        return next();
      }

      const balance = await getWorkspaceBalance(workspaceId);

      if (balance < minCredits) {
        return res.status(402).json({
          error: 'Payment Required',
          message: `Insufficient credit balance (${balance.toFixed(2)} credits available). Minimum required: ${minCredits} credits. Please top up your wallet.`,
          currentBalance: balance
        });
      }

      next();
    } catch (err: any) {
      console.error('Credit balance check error:', err);
      next();
    }
  };
}
