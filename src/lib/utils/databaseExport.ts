import { supabase } from "@/integrations/supabase/client";

export interface DatabaseExport {
  exportDate: string;
  profile: any;
  projects: any[];
  transactions: any[];
}

export async function exportUserDatabase(): Promise<DatabaseExport> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Fetch user profile (use maybeSingle to handle missing profiles gracefully)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch all user projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch all transactions for user projects
  const projectIds = projects?.map(p => p.id) || [];
  const { data: transactions } = projectIds.length > 0
    ? await supabase
        .from("transactions")
        .select("*")
        .in("project_id", projectIds)
        .order("transaction_date", { ascending: false })
    : { data: [] };

  return {
    exportDate: new Date().toISOString(),
    profile: profile || {},
    projects: projects || [],
    transactions: transactions || [],
  };
}

export function downloadDatabaseExport(data: DatabaseExport, filename?: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `ceo-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
