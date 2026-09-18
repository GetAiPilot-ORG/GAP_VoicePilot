import AuthSectionOne from "@/components/ui/auth-section-1";

export const metadata = {
  title: "Set New Password - GAP VoicePilot",
  description: "Set a new password for your GAP VoicePilot account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  return <AuthSectionOne mode="reset-password" error={resolvedParams?.error} />;
}
