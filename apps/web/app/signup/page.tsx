import AuthSectionOne from "@/components/ui/auth-section-1";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  return <AuthSectionOne mode="signup" error={resolvedParams?.error} />;
}
