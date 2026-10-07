import { Suspense } from "react";
import AuthSectionOne from "@/components/ui/auth-section-1";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthSectionOne mode="signup" error={resolvedParams?.error} />
    </Suspense>
  );
}
