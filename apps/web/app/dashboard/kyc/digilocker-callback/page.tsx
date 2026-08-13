import { handleDigiLockerCallback } from "@/app/actions/setu-kyc";
import { CheckCircle2, AlertCircle, Phone, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    success?: string;
    id?: string;
    scope?: string;
    errCode?: string;
    errMessage?: string;
  }>;
}

export default async function DigiLockerCallbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const { success, id, scope } = params;

  // If no id, something went wrong before even reaching DigiLocker
  if (!id) {
    return <CallbackResult success={false} error="Invalid callback — missing request ID." />;
  }

  // Process the callback server-side
  const result = await handleDigiLockerCallback(id, success || "False", scope || "");

  if (!result.success && result.error === "User cancelled or DigiLocker verification failed.") {
    return <CallbackResult success={false} error="You cancelled the DigiLocker verification. Please try again." />;
  }

  if (!result.success) {
    return <CallbackResult success={false} error={result.error || "Verification failed."} />;
  }

  return (
    <CallbackResult
      success={true}
      verifiedName={result.verifiedName}
      assignedNumber={result.assignedNumber}
      alreadyApproved={(result as any).alreadyApproved}
    />
  );
}

// ─── Result UI ────────────────────────────────────────────────────────────────
function CallbackResult({
  success,
  error,
  verifiedName,
  assignedNumber,
  alreadyApproved,
}: {
  success: boolean;
  error?: string | null;
  verifiedName?: string | null;
  assignedNumber?: string | null;
  alreadyApproved?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-hairline shadow-lg overflow-hidden">
          {/* Top accent bar */}
          <div
            className={`h-1.5 w-full ${
              success
                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                : "bg-gradient-to-r from-rose-400 to-rose-600"
            }`}
          />

          <div className="p-8 text-center space-y-6">
            {/* Icon */}
            <div
              className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-inner ${
                success
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {success ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <AlertCircle className="w-10 h-10" />
              )}
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                {success
                  ? alreadyApproved
                    ? "Already Verified"
                    : "Identity Verified!"
                  : "Verification Failed"}
              </h1>
              {success ? (
                <p className="text-sm text-neutral-500">
                  {alreadyApproved
                    ? "Your KYC was already approved. You're all set."
                    : "Your identity was successfully verified via DigiLocker."}
                </p>
              ) : (
                <p className="text-sm text-rose-600 font-medium">{error}</p>
              )}
            </div>

            {/* Success details */}
            {success && !alreadyApproved && (
              <div className="space-y-3 text-left">
                {verifiedName && (
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                        Verified Name
                      </p>
                      <p className="text-sm font-bold text-emerald-900">{verifiedName}</p>
                    </div>
                  </div>
                )}
                {assignedNumber ? (
                  <div className="flex items-center gap-3 p-3.5 bg-indigo-50/80 border border-indigo-200/60 rounded-xl">
                    <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-700">
                        Phone Number Assigned
                      </p>
                      <p className="text-sm font-bold text-indigo-900 font-mono">
                        {assignedNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-xl">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
                        Number Assignment
                      </p>
                      <p className="text-sm text-amber-800">
                        KYC approved! A number will be assigned shortly by our team.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <a
                href="/dashboard/phone-numbers"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-bold transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
                Go to Phone Numbers
              </a>
              {!success && (
                <a
                  href="/dashboard/phone-numbers"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-hairline text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-all"
                >
                  Try Again
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-[11px] text-neutral-400 mt-4">
          Identity verified via{" "}
          <span className="font-semibold text-neutral-500">DigiLocker</span> ·{" "}
          Powered by{" "}
          <span className="font-semibold text-neutral-500">Setu</span>
        </p>
      </div>
    </div>
  );
}
