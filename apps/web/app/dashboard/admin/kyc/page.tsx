import { AdminKycClient } from "./AdminKycClient";
import { getAdminKycRequests, getAvailableVomyraNumbers } from "@/app/actions/kyc";

export const dynamic = "force-dynamic";

export default async function AdminKycPage() {
  const [res, vomyraRes] = await Promise.all([
    getAdminKycRequests(),
    getAvailableVomyraNumbers()
  ]);

  const requests = res.success ? (res.requests || []) : [];
  const availableNumbers = vomyraRes.success ? (vomyraRes.availableNumbers || []) : [];

  return <AdminKycClient initialRequests={requests} initialAvailableNumbers={availableNumbers} />;
}
