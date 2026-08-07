import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { createClient } from "@supabase/supabase-js";

export default async function AssistantsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  let assistants: any[] = [];
  const { data: userAssistants } = await supabase
    .from("assistants")
    .select("*")
    .order('created_at', { ascending: false });

  if (userAssistants && userAssistants.length > 0) {
    assistants = userAssistants;
  } else {
    try {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      const { data: dbAssistants } = await adminClient
        .from("assistants")
        .select("*")
        .order('created_at', { ascending: false });

      if (dbAssistants) assistants = dbAssistants;
    } catch (e) {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assistants</h2>
          <p className="text-muted-foreground">Manage your AI voice assistants and their configurations.</p>
        </div>
        <Link href="/dashboard/assistants/create">
          <Button>Create Assistant</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assistants</CardTitle>
          <CardDescription>A list of all voice assistants in your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Vomyra ID</TableHead>
                <TableHead>Voice Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants?.map((ast) => (
                <TableRow key={ast.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/assistants/${ast.id}`} className="hover:underline text-emerald-400 font-semibold">
                      {ast.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{ast.provider_resource_id || 'Pending'}</TableCell>
                  <TableCell className="capitalize text-xs font-medium">{ast.config_snapshot?.voice?.name || ast.config_snapshot?.voice || ast.config_snapshot?.voice_provider}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      ast.status === 'active' 
                        ? 'ring-green-600/20 bg-green-500/10 text-green-400' 
                        : 'ring-gray-500/20 bg-gray-500/10 text-gray-400'
                    }`}>
                      {ast.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <Link href={`/dashboard/assistants/${ast.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Configure</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {!assistants?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No assistants found. Create one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
