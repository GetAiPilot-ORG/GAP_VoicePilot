import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCampaignAction } from "@/app/actions/campaigns";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function CreateCampaignPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // Fetch available assistants for the dropdown
  const { data: assistants } = await supabase.from('assistants').select('id, name');

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Start Campaign</h2>
        <p className="text-muted-foreground">Queue up automated calls to a list of contacts.</p>
      </div>

      <Card>
        <form action={createCampaignAction}>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Select an assistant and provide the target phone numbers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input id="name" name="name" placeholder="e.g. Q3 Sales Outreach" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assistantId">Select Assistant</Label>
              <select 
                id="assistantId" 
                name="assistantId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">-- Choose an Assistant --</option>
                {assistants?.map(ast => (
                  <option key={ast.id} value={ast.id}>{ast.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numbers">Phone Numbers</Label>
              <Textarea 
                id="numbers" 
                name="numbers"
                placeholder="+1234567890, +0987654321"
                className="min-h-[150px]"
                required
              />
              <p className="text-xs text-muted-foreground">Enter comma-separated phone numbers in E.164 format.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/dashboard/campaigns">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit">Start Calling</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
