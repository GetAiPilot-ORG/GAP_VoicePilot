import { Router } from 'express';
import { createOrder, verifySignature } from '../services/razorpay';
import { supabaseAdmin } from '../services/billing';

export const paymentRouter = Router();

/**
 * POST /api/v1/payments/create-order
 */
paymentRouter.post('/create-order', async (req, res) => {
  try {
    const { amount, workspaceId, planId, type = 'top_up' } = req.body;

    if (!amount || amount <= 0 || !workspaceId) {
      return res.status(400).json({ success: false, error: 'workspaceId and valid amount in ₹ are required' });
    }

    const orderData = await createOrder(amount, {
      workspaceId,
      planId: planId || 'custom',
      type
    });

    res.json({
      success: true,
      data: orderData
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create payment order' });
  }
});

/**
 * POST /api/v1/payments/verify-payment
 */
paymentRouter.post('/verify-payment', async (req, res) => {
  try {
    const {
      workspaceId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type = 'top_up',
      planId,
      amount
    } = req.body;

    if (!workspaceId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing required verification signatures' });
    }

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
    }

    // 1. Process Subscription Purchase
    if (type === 'subscription' && planId) {
      const { data: targetPlan } = await supabaseAdmin.from('plans').select('*').eq('id', planId).single();

      // Upsert subscription
      await supabaseAdmin.from('workspace_subscriptions').upsert({
        workspace_id: workspaceId,
        plan_id: planId,
        status: 'active',
        stripe_subscription_id: razorpay_payment_id,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'workspace_id' });

      // Sync to profiles.current_plan
      const { data: ws } = await supabaseAdmin.from('workspaces').select('owner_id').eq('id', workspaceId).maybeSingle();
      if (ws?.owner_id) {
        await supabaseAdmin.from('profiles').update({ current_plan: planId }).eq('id', ws.owner_id);
      }

      // Grant plan included credits
      const includedCredits = targetPlan?.included_credits || 100;
      await supabaseAdmin.from('credit_ledger').insert({
        workspace_id: workspaceId,
        type: 'grant',
        amount: includedCredits,
        description: `Plan Purchase: ${targetPlan?.name || planId} (Razorpay: ${razorpay_payment_id})`,
        reference_id: razorpay_payment_id
      });

      // Sync to Main GetAiPilot Hub DB
      try {
        let userEmail: string | undefined;
        if (ws?.owner_id) {
          const { data: ownerProf } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', ws.owner_id)
            .maybeSingle();
          userEmail = ownerProf?.email;
        }

        if (userEmail) {
          const hubUrl = process.env.HUB_SUPABASE_URL || "https://uklxlappjcuvdqjvecfh.supabase.co";
          const hubKey = process.env.HUB_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbHhsYXBwamN1dmRxanZlY2ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0NzA4MywiZXhwIjoyMDgzNzIzMDgzfQ.8raDYx4BqeVELD691E720qBORhWEI4L68c_ED2JIt5w";
          const { createClient } = await import('@supabase/supabase-js');
          const hubClient = createClient(hubUrl, hubKey);

          const { data: hubProfile } = await hubClient
            .from("profiles")
            .select("id")
            .ilike("email", userEmail)
            .maybeSingle();

          if (hubProfile) {
            const planLabel = targetPlan?.name || (planId === "gap_enterprise" ? "GAP Enterprise" : planId === "gap_pro" ? "GAP Pro" : planId);
            const pricePaise = (targetPlan?.price_monthly || 4999) * 100;
            const nowIso = new Date().toISOString();
            const expiresIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await hubClient.from("app_user_subscriptions").upsert({
              user_id: hubProfile.id,
              email: userEmail,
              plan_id: planId,
              plan_label: planLabel,
              plan_price_paise: pricePaise,
              plan_duration_days: 30,
              started_at: nowIso,
              expires_at: expiresIso,
              status: "active",
              subscription_status: "active",
              last_payment_id: razorpay_payment_id,
              last_payment_status: "paid",
              last_payment_verified_at: nowIso,
              updated_at: nowIso,
            }, { onConflict: "user_id" });

            await hubClient.from("profiles").update({
              subscription: planLabel,
              updated_at: nowIso,
            }).eq("id", hubProfile.id);
          }
        }
      } catch (hErr) {
        console.warn("Hub sync warning in API route:", hErr);
      }

      return res.json({
        success: true,
        message: `Plan ${targetPlan?.name || planId} activated successfully!`,
        planId,
        creditsGranted: includedCredits
      });
    }

    // 2. Process Wallet Top-Up
    const amountInRupees = Number(amount || 500);
    const minutesGranted = Math.floor(amountInRupees / 5);

    await supabaseAdmin.from('credit_ledger').insert({
      workspace_id: workspaceId,
      type: 'top_up',
      amount: minutesGranted,
      description: `Razorpay Wallet Top-up (₹${amountInRupees} = ${minutesGranted} Mins)`,
      reference_id: razorpay_payment_id
    });

    res.json({
      success: true,
      message: `Successfully topped up ₹${amountInRupees} (${minutesGranted} AI Mins)!`,
      minutesGranted
    });
  } catch (error: any) {
    console.error('Razorpay verify-payment error:', error);
    res.status(500).json({ success: false, error: error.message || 'Payment verification failed' });
  }
});
