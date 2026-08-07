export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/dashboard">
              <span className="font-bold sm:inline-block">Vomyra Voice SaaS</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard">Overview</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard/assistants">Assistants</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard/campaigns">Campaigns</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard/phone-numbers">Phone Numbers</a>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <form action="/actions/auth/signout" method="POST" className="m-0">
              <button formAction={async () => {
                "use server";
                const { signOut } = await import('@/app/actions/auth');
                await signOut();
              }} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </div>
  );
}
