import AuthSectionOne from "@/components/ui/auth-section-1";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  return <AuthSectionOne mode="login" error={resolvedParams?.error} />;
}
