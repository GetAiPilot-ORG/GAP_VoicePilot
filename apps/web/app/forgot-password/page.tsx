import { Suspense } from "react";
import AuthSectionOne from "@/components/ui/auth-section-1";

export const metadata = {
  title: "Forgot Password - GAP VoicePilot",
  description: "Reset your GAP VoicePilot account password securely.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthSectionOne mode="forgot-password" error={resolvedParams?.error} />
    </Suspense>
  );
}
