import { Router, Request, Response, NextFunction } from "express";
import {
  createOrder,
  fetchPayment,
  verifySignature,
} from "../services/razorpay";
import { supabaseAdmin as supabase } from "../config/supabase";

export const paymentRouter = Router();

// Middleware to authenticate via Supabase JWT
async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: Invalid token" });
  }

  (req as any).user = user;
  next();
}

async function getOwnedWorkspaceId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  return error ? null : data?.id || null;
}

/**
 * POST /api/v1/payments/create-order
 */
paymentRouter.post("/create-order", authenticateUser, async (req, res) => {
  try {
    const { planId, type } = req.body;
    const user = (req as any).user;

    const workspaceId = await getOwnedWorkspaceId(user.id);
    if (!workspaceId) {
      return res
        .status(403)
        .json({ success: false, error: "No workspace found for user" });
    }

    if (type !== "plan_purchase" && type !== "top_up" && type !== "number_purchase") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid purchase type" });
    }

    let amountPaise = 0;
    
    const DEDICATED_NUMBER_PRICE_PAISE = 149900;

    if (type === "number_purchase") {
      amountPaise = DEDICATED_NUMBER_PRICE_PAISE;
    } else if (type === "plan_purchase") {
      if (!planId)
        return res
          .status(400)
          .json({ success: false, error: "Missing planId" });

      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("price_monthly")
        .eq("id", planId)
        .single();
      if (planError || !plan)
        return res
          .status(404)
          .json({ success: false, error: "Plan not found" });

      amountPaise = Math.round(plan.price_monthly * 100);
    } else {
      // Top up validation
      const requestedAmount = req.body.amount;
      if (
        !requestedAmount ||
        requestedAmount < 500 ||
        requestedAmount > 25000
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Top-up amount must be between ₹500 and ₹25000",
          });
      }
      amountPaise = Math.round(requestedAmount * 100);
    }

    // Call Razorpay API to create order
    const orderData = await createOrder(amountPaise / 100, {
      workspaceId,
      planId: planId || "custom",
      type,
    });

    // Save intent before returning
    const { error: intentError } = await supabase
      .from("payment_intents")
      .insert({
        razorpay_order_id: orderData.orderId,
        workspace_id: workspaceId,
        plan_id: type === "plan_purchase" ? planId : null,
        amount_paise: amountPaise,
        purchase_type: type,
        status: "pending",
      });

    if (intentError) {
      console.error("Failed to create payment intent:", intentError);
      return res
        .status(500)
        .json({
          success: false,
          error: "Failed to initialize payment tracking",
        });
    }

    res.json({
      success: true,
      data: orderData,
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: error.message || "Failed to create payment order",
      });
  }
});

/**
 * POST /api/v1/payments/verify-payment
 */
paymentRouter.post("/verify-payment", authenticateUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const user = (req as any).user;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Missing required verification signatures",
        });
    }

    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Invalid payment signature. Verification failed.",
        });
    }

    // The stored intent, not the browser callback, is authoritative.
    const { data: intent, error: intentError } = await supabase
      .from("payment_intents")
      .select("workspace_id, amount_paise, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (intentError || !intent) {
      return res
        .status(404)
        .json({ success: false, error: "Payment intent not found" });
    }

    const workspaceId = await getOwnedWorkspaceId(user.id);
    if (workspaceId !== intent.workspace_id) {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized workspace access" });
    }

    const payment = await fetchPayment(razorpay_payment_id);
    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      Number(payment.amount) !== Number(intent.amount_paise) ||
      payment.currency !== "INR"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Payment is not captured or does not match the order intent",
        });
    }

    // Call atomic Postgres RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "process_payment_intent",
      {
        p_razorpay_order_id: razorpay_order_id,
        p_razorpay_payment_id: razorpay_payment_id,
      },
    );

    if (rpcError) {
      console.error("RPC Error processing payment:", rpcError);
      return res
        .status(500)
        .json({
          success: false,
          error: "Failed to process payment atomically",
        });
    }

    // Profile synchronization is performed inside process_payment_intent.
    if (rpcResult.type === "plan_purchase") {
      return res.json({
        success: true,
        type: "plan_purchase",
        message: `Plan activated successfully!`,
        creditsGranted: rpcResult.credits_granted,
      });
    }

    if (rpcResult.type === "top_up") {
      return res.json({
        success: true,
        type: "top_up",
        message: `Successfully topped up wallet!`,
        creditsGranted: rpcResult.credits_granted,
      });
    }

    if (rpcResult.type === "number_purchase" || rpcResult.type === "number_renewal") {
      // Check if this workspace has an expired phone line that should be renewed
      const { data: workspacePhones } = await supabase
        .from("phone_numbers")
        .select("id, current_period_end, assigned_assistant_id")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      const targetExpired = (workspacePhones || []).find(
        (n: any) => !n.current_period_end || new Date(n.current_period_end).getTime() <= Date.now()
      );

      if (targetExpired) {
        // Renew the existing line
        await supabase
          .from("phone_numbers")
          .update({
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: targetExpired.assigned_assistant_id ? "active" : "unassigned"
          })
          .eq("id", targetExpired.id);

        // Deduct entitlement added by RPC so entitlements remain 0
        const { data: currentWs } = await supabase
          .from("workspaces")
          .select("dedicated_number_entitlements")
          .eq("id", workspaceId)
          .single();

        if (currentWs && (currentWs.dedicated_number_entitlements || 0) > 0) {
          await supabase
            .from("workspaces")
            .update({
              dedicated_number_entitlements: Math.max(0, currentWs.dedicated_number_entitlements - 1)
            })
            .eq("id", workspaceId);
        }

        return res.json({
          success: true,
          type: "number_renewal",
          message: "Dedicated number renewed successfully!",
          phoneId: targetExpired.id
        });
      }

      return res.json({
        success: true,
        type: "number_purchase",
        message: "Dedicated number purchased successfully!",
        entitlementsGranted: rpcResult.entitlements_granted,
      });
    }

    throw new Error(`Unsupported payment fulfillment type: ${rpcResult.type}`);
  } catch (error: any) {
    console.error("Razorpay verify-payment error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: error.message || "Payment verification failed",
      });
  }
});
