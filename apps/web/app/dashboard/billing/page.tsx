import { getBillingDataAction } from "@/app/actions/billing";
import BillingClient from "./BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const initialData = await getBillingDataAction();

  return <BillingClient initialData={initialData} />;
}
