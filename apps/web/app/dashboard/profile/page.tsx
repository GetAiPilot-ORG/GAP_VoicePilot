import { getAdminClient, requireCurrentWorkspace } from "@/lib/workspace";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { verifyRouteAccess } from "@/app/actions/adminSidebarPermissions";
import { cookies } from "next/headers";
import Link from "next/link";
import { PhoneCall, Fingerprint, Crown, Calendar, Zap } from "lucide-react";

export const metadata = {
  title: "Profile | GAP Voice Pilot",
};

export default async function ProfilePage() {
  await verifyRouteAccess("/dashboard/profile");
  
  const cookieStore = await cookies();
  const supabase = await createServerSupabaseClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  const adminClient = await getAdminClient();
  const { workspaceId } = await requireCurrentWorkspace();
  
  const { data: balanceData } = await adminClient.rpc("get_workspace_credit_balance", { p_workspace_id: workspaceId });
  const balance = Number(balanceData || 0);

  const { data: sub } = await adminClient
    .from("workspace_subscriptions")
    .select("*, plans(*)")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const { data: phoneNumbersData } = await adminClient
    .from("phone_numbers")
    .select("id, phone_number, created_at, assigned_assistant_id")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order('created_at', { ascending: false });

  const { data: assistantsData } = await adminClient
    .from("assistants")
    .select("id, name")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);

  const assistantsMap = new Map();
  assistantsData?.forEach(ast => assistantsMap.set(ast.id, ast.name));

  const planName = sub?.plans?.name || "Free Tier";
  const planStatus = sub?.status || "active";
  const includedCredits = sub?.plans?.included_credits || 0;
  
  const startDate = sub?.current_period_start ? new Date(sub.current_period_start) : null;
  const endDate = sub?.current_period_end ? new Date(sub.current_period_end) : null;
  
  const planStarted = startDate ? startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A";
  const planValidity = endDate ? endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Lifetime Access";
  
  let daysLeft = null;
  let planProgress = 0;
  if (startDate && endDate) {
    const timeDiff = endDate.getTime() - new Date().getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = new Date().getTime() - startDate.getTime();
    planProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  // Calculate balance progress
  const maxCredits = Math.max(includedCredits, balance, 1);
  const creditsPercent = Math.min(100, Math.max(0, (balance / maxCredits) * 100));
  
  const name = user?.user_metadata?.full_name || "Voice Pilot User";
  const initial = name.charAt(0).toUpperCase();
  const joinedDate = new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">Account Profile</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your identity details, subscription status, and purchased assets.</p>
        </div>
        <Link href="/dashboard/billing" className="inline-flex items-center justify-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0">
          Manage Billing
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Identity Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-700 font-semibold text-lg border border-neutral-200/60 shadow-inner">
                {initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-neutral-900 truncate">{name}</h2>
                <p className="text-sm text-neutral-500 truncate">{user?.email || "No Email Attached"}</p>
              </div>
            </div>
            
            <div className="mt-auto">
              
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Joined Date</p>
                  <p className="text-sm font-medium text-neutral-700">{joinedDate}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-neutral-500 flex items-center gap-1.5"><Crown className="w-4 h-4 text-indigo-400"/> Current Plan</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                {planStatus}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-semibold text-neutral-900 capitalize tracking-tight">{planName}</p>
               <span className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">Monthly</span>
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-100 mt-5">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Started: {planStarted}</p>
                {daysLeft !== null ? (
                  <p className="text-sm font-medium text-neutral-700">
                    {daysLeft > 0 ? `${daysLeft} Days Remaining` : "Expired"}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-neutral-700">Lifetime</p>
                )}
              </div>
            </div>
            {/* Sleek Progress Bar */}
            {daysLeft !== null && (
              <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${planProgress}%` }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Wallet & Usage Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-400"/> Credit Balance</h2>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-semibold text-neutral-900 tracking-tight">{balance}</p>
              <span className="text-sm font-medium text-neutral-500">AI Mins available</span>
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-100 mt-5">
             <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Usage Capacity</p>
                <p className="text-[10px] font-bold text-neutral-400">{creditsPercent.toFixed(0)}% Left</p>
             </div>
             {/* Credit Progress Bar */}
             <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden mb-4">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${creditsPercent}%` }}></div>
             </div>
             
             <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-900">{assistantsData?.length || 0}</span> Assistants</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <p className="text-xs text-neutral-600"><span className="font-semibold text-neutral-900">{phoneNumbersData?.length || 0}</span> Numbers</p>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* Phone Numbers Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Phone Numbers Registry</h3>
            <p className="text-xs text-neutral-500 mt-0.5">List of all your purchased assets and their assigned AI agents.</p>
          </div>
        </div>
        
        {(!phoneNumbersData || phoneNumbersData.length === 0) ? (
          <div className="px-6 py-12 text-center flex flex-col items-center">
            <PhoneCall className="w-8 h-8 text-neutral-300 mb-3" />
            <h4 className="text-sm font-medium text-neutral-900">No Phone Numbers</h4>
            <p className="text-sm text-neutral-500 mt-1">You haven't purchased any phone numbers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-neutral-200">
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Connected On</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-right">Assigned Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {phoneNumbersData.map((num) => (
                  <tr key={num.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-neutral-900">{num.phone_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-600">
                        {new Date(num.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {num.assigned_assistant_id && assistantsMap.has(num.assigned_assistant_id) ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
                          {assistantsMap.get(num.assigned_assistant_id)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-medium">
                          Unassigned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
