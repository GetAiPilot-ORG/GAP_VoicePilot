"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  createRazorpayOrderAction, 
  verifyRazorpayPaymentAction 
} from "@/app/actions/billing";
import { 
  CheckCircle2, 
  Zap, 
  Plus, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  PhoneCall,
  CreditCard,
  Check,
  ShieldAlert,
  Loader2
} from "lucide-react";

interface BillingClientProps {
  initialData: {
    workspaceId: string;
    balance: number;
    subscription: any;
    plans: any[];
    ledger: any[];
    razorpayKeyId: string;
  };
}

export default function BillingClient({ initialData }: BillingClientProps) {
  const [data, setData] = useState(initialData);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [isPending, startTransition] = useTransition();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userProfile, setUserProfile] = useState<{ email: string; name: string }>({
    email: "",
    name: "Customer"
  });

  // Load Razorpay Script & Auth User dynamically on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const fetchUser = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = user.email || "";
          const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0] || "Customer";
          setUserProfile({ email, name });
        }
      } catch (e) {}
    };
    fetchUser();
  }, []);

  const hasActiveSub = data.subscription && data.subscription.status === 'active';
  const activePlanId = hasActiveSub ? (data.subscription?.plans?.id || data.subscription?.plan_id) : null;

  const pricingTiers = (data.plans && data.plans.length > 0)
    ? data.plans.map((dbPlan) => {
        const feats = dbPlan.features || {};
        const isEnterprise = dbPlan.id === "enterprise" || feats.is_enterprise;
        return {
          id: dbPlan.id,
          audience: feats.audience || (isEnterprise ? "FOR ORGANIZATIONS" : "FOR STARTERS"),
          name: dbPlan.name || (isEnterprise ? "Enterprise" : "Plan"),
          description: feats.description || `${dbPlan.included_credits} AI calling minutes included.`,
          priceNum: dbPlan.price_monthly,
          price: dbPlan.price_monthly > 0 ? `₹${dbPlan.price_monthly.toLocaleString()}` : "Custom",
          period: dbPlan.price_monthly > 0 ? "/mo" : "",
          extraRate: feats.extra_min_rate ? `₹${feats.extra_min_rate}.00 / min` : "Custom",
          feeNote: feats.feeNote || (dbPlan.price_monthly > 0 ? `Includes ${dbPlan.included_credits} mins.` : "Contracted to your volume."),
          features: feats.feature_list || [
            `${dbPlan.included_credits} AI Calling Minutes`,
            `Hindi & English Support`,
            `Dedicated Business Number`
          ],
          isPopular: feats.is_popular || false,
          isEnterprise,
          btnText: isEnterprise ? "Talk to our team" : "Get Started"
        };
      })
    : [];

  // Open Razorpay Modal for Wallet Recharge
  const handleRazorpayTopUp = () => {
    setMessage(null);
    startTransition(async () => {
      const orderRes = await createRazorpayOrderAction({
        amount: topUpAmount,
        type: 'top_up'
      });

      if (!orderRes.success || !orderRes.orderId) {
        setMessage({ type: 'error', text: orderRes.error || 'Failed to initialize payment' });
        return;
      }

      const options = {
        key: orderRes.keyId || initialData.razorpayKeyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'VoicePilot AI',
        description: `AI Calling Minutes Wallet Top-up (₹${topUpAmount})`,
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          setLoadingPlanId('verifying');
          const verifyRes = await verifyRazorpayPaymentAction({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            type: 'top_up',
            amount: topUpAmount
          });

          setLoadingPlanId(null);
          if (verifyRes.success) {
            setIsTopUpOpen(false);
            setMessage({ type: 'success', text: verifyRes.message || 'Payment successful!' });
            const mins = verifyRes.minutesGranted || Math.floor(topUpAmount / 5);
            setData(prev => ({
              ...prev,
              balance: prev.balance + mins,
              ledger: [
                {
                  id: response.razorpay_payment_id,
                  type: 'top_up',
                  amount: mins,
                  description: `Razorpay Wallet Top-up (₹${topUpAmount} = ${mins} Mins)`,
                  created_at: new Date().toISOString()
                },
                ...prev.ledger
              ]
            }));
          } else {
            setMessage({ type: 'error', text: verifyRes.error || 'Payment verification failed' });
          }
        },
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
          contact: ''
        },
        theme: {
          color: '#7c3aed'
        }
      };

      const razorpayWindow = new (window as any).Razorpay(options);
      razorpayWindow.open();
    });
  };

  // Open Razorpay Modal for Plan Subscription
  const handleRazorpaySubscribe = (planId: string, price: number, planName: string) => {
    if (planId === activePlanId) return;
    setMessage(null);
    setLoadingPlanId(planId);

    startTransition(async () => {
      const orderRes = await createRazorpayOrderAction({
        amount: price,
        planId,
        type: 'subscription'
      });

      if (!orderRes.success || !orderRes.orderId) {
        setLoadingPlanId(null);
        setMessage({ type: 'error', text: orderRes.error || 'Failed to initialize plan checkout' });
        return;
      }

      const options = {
        key: orderRes.keyId || initialData.razorpayKeyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'VoicePilot AI',
        description: `Subscription to ${planName} Plan (${planId.toUpperCase()})`,
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyRazorpayPaymentAction({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            type: 'subscription',
            planId,
            amount: price
          });

          setLoadingPlanId(null);
          if (verifyRes.success) {
            const selectedPlan = pricingTiers.find(p => p.id === planId);
            setMessage({ type: 'success', text: verifyRes.message || `Successfully activated ${planName}!` });
            setData(prev => ({
              ...prev,
              subscription: {
                status: 'active',
                plan_id: planId,
                plans: selectedPlan
              }
            }));
          } else {
            setMessage({ type: 'error', text: verifyRes.error || 'Payment verification failed' });
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlanId(null);
          }
        },
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
          contact: ''
        },
        theme: {
          color: '#7c3aed'
        }
      };

      const razorpayWindow = new (window as any).Razorpay(options);
      razorpayWindow.open();
    });
  };

  return (
    <div className="space-y-8 w-full pb-16">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold tracking-tight text-black">Plans & Billing Management</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Select a plan via Razorpay UPI/Cards to activate voice agents, manage AI calling minute credits, and track wallet transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
            <span>Balance: <strong>{Math.floor(data.balance)} AI Mins</strong></span>
          </div>
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="btn-pill-primary rounded-[10px] text-xs px-4 py-2 shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Recharge Mins
          </button>
        </div>
      </div>

      {/* No Active Subscription Banner */}
      {!hasActiveSub && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No active subscription found. Select a plan below to pay via Razorpay UPI/Card and activate AI Voice Agents.</span>
          </div>
        </div>
      )}

      {/* Alert Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Purple Pricing Section */}
      <div className="bg-[#c2b6f4] rounded-3xl p-4 sm:p-8 md:p-12 text-black shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-purple-950 font-extrabold mb-3">
              PRICING
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-none">
              Simple pricing,<br />no surprises.
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-xs md:text-sm text-purple-950 font-medium leading-relaxed">
              Start for free and scale as your volume grows. Every plan includes unlimited agents and full analytics.
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {pricingTiers.map((plan, idx) => {
            const isCurrent = activePlanId !== null && plan.id === activePlanId;
            const isDark = plan.isPopular;
            const isLoading = loadingPlanId === plan.id;
            const currentPlanIndex = pricingTiers.findIndex(p => p.id === activePlanId);
            const isDowngrade = currentPlanIndex !== -1 && idx < currentPlanIndex;

            return (
              <div 
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  isDark 
                    ? "bg-black text-white shadow-2xl ring-2 ring-black" 
                    : "bg-white text-black shadow-sm"
                }`}
              >
                <div>
                  {/* Audience & Name */}
                  <div className="mb-4 text-left">
                    <p className={`text-[10px] font-mono tracking-widest uppercase mb-1 font-bold ${isDark ? "text-amber-400" : "text-black/50"}`}>
                      {plan.audience}
                    </p>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className={`text-[11px] mt-1 font-normal ${isDark ? "text-neutral-300" : "text-black/60"}`}>
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-3 text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className={`text-xs font-semibold ${isDark ? "text-neutral-400" : "text-black/60"}`}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.feeNote && (
                      <p className={`text-[10px] font-medium mt-1 ${isDark ? "text-neutral-400" : "text-black/50"}`}>
                        {plan.feeNote}
                      </p>
                    )}
                  </div>

                  <hr className={`my-4 ${isDark ? "border-neutral-800" : "border-hairline"}`} />

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 mb-6 text-left">
                    {plan.features.map((feat: string, fidx: number) => (
                      <div key={fidx} className="flex items-start gap-2 text-[11px] font-medium">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isDark ? "border-white/40 text-white" : "border-black/30 text-black"
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={isDark ? "text-neutral-200" : "text-neutral-800"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button with Razorpay Integration */}
                <button
                  disabled={!plan.isEnterprise && (isCurrent || isDowngrade || (isPending && isLoading))}
                  onClick={() => {
                    if (plan.isEnterprise) {
                      window.location.href = "/demo";
                      return;
                    }
                    handleRazorpaySubscribe(plan.id, plan.priceNum, plan.name);
                  }}
                  className={`w-full py-2.5 px-4 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-emerald-600 text-white cursor-default"
                      : isDowngrade
                      ? "bg-neutral-200 text-neutral-500 cursor-not-allowed shadow-none border border-neutral-300"
                      : isDark
                      ? "bg-white text-black hover:bg-neutral-100"
                      : "bg-[#1e1e2d] text-white hover:bg-black"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening Razorpay...
                    </>
                  ) : isCurrent ? (
                    "Active Plan"
                  ) : isDowngrade ? (
                    "Included in Plan"
                  ) : (
                    plan.btnText
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Dedicated Phone Number & Calling Channel Card */}
        <div className="mt-8 rounded-2xl border border-black/15 bg-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-[10px] font-bold text-purple-900 uppercase tracking-wider">
              <PhoneCall className="h-3 w-3 text-purple-700" />
              <span>DEDICATED TELEPHONY INFRASTRUCTURE</span>
            </div>
            <h3 className="text-xl font-extrabold text-black">
              Dedicated Phone Number & Concurrent Calling Channel Plan
            </h3>
            <p className="text-xs text-black/70 leading-relaxed font-normal">
              Add dedicated virtual business numbers (080, 022, 011, or 1800 Toll-Free) and dedicated multi-channel call concurrency for inbound call answering & outbound AI campaigns.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-semibold text-black/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>1 Dedicated Business Virtual Number</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Dedicated Calling Concurrency Channel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>TRAI & DLT Compliant SIP Trunking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Instant Setup & Number Activation</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full sm:w-auto text-left md:text-right">
            <div>
              <span className="text-3xl font-extrabold text-black">₹1,499</span>
              <span className="text-xs font-semibold text-black/60"> /month</span>
              <p className="text-[11px] text-black/50 font-medium mt-0.5">Per dedicated channel & number</p>
            </div>
            <a
              href="/dashboard/phone-numbers"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full bg-[#ff4b2f] hover:bg-[#e63e24] text-white px-6 text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
            >
              Get Dedicated Number
            </a>
          </div>
        </div>
      </div>

      {/* Credit Wallet History & Usage Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-black flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            AI Calling Wallet Ledger History
          </h3>
          <span className="text-xs text-neutral-500 font-mono">
            Current Rate: ~₹5/min
          </span>
        </div>

        <div className="bg-white border border-hairline rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-surface-soft text-neutral-600 border-b border-hairline font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Transaction Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Minutes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {data.ledger.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-400 font-medium">
                      No wallet transactions logged yet.
                    </td>
                  </tr>
                ) : (
                  data.ledger.map((item) => {
                    const isPositive = Number(item.amount) > 0;
                    return (
                      <tr key={item.id} className="hover:bg-surface-soft/50 transition-colors">
                        <td className="p-3.5 text-neutral-500 font-mono">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPositive 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                          }`}>
                            {isPositive ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {item.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-black font-medium">
                          {item.description || 'System voice call usage'}
                        </td>
                        <td className={`p-3.5 text-right font-mono font-bold ${isPositive ? "text-emerald-600" : "text-black"}`}>
                          {isPositive ? `+${item.amount}` : `${item.amount}`} Mins
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 text-black">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Recharge AI Calling Minutes (Razorpay UPI/Cards)
              </h3>
              <button 
                onClick={() => setIsTopUpOpen(false)}
                className="text-neutral-400 hover:text-black text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-700">
                Select Recharge Amount (INR ₹)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      topUpAmount === amt
                        ? "border-purple-600 bg-purple-50 text-purple-900 shadow-sm"
                        : "border-hairline text-neutral-700 hover:bg-surface-soft"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-soft space-y-1.5 text-xs border border-hairline">
              <div className="flex justify-between text-neutral-600">
                <span>Recharge Amount:</span>
                <span className="font-bold text-black">₹{topUpAmount}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated AI Calling Minutes:</span>
                <span className="font-bold text-emerald-600">~{Math.floor(topUpAmount / 5)} Minutes</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsTopUpOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-hairline text-xs font-semibold hover:bg-surface-soft text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleRazorpayTopUp}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay ₹${topUpAmount} via Razorpay`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
