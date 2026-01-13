import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Shield, Download, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { exportUserDatabase, downloadDatabaseExport } from "@/lib/utils/databaseExport";
import { exportDatabaseToCSV } from "@/lib/utils/csvExport";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Admin() {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const dateLocale = language === 'it' ? 'it-IT' : 'en-US';

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      loadUsers();
    } else {
      toast({
        title: t('accessDenied'),
        description: t('noPermission'),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*, projects(count)");

    if (profiles) {
      setUsers(profiles);
    }
    setLoading(false);
  };

  const handleExportDatabase = async (format: 'json' | 'csv' = 'json') => {
    try {
      setExporting(true);
      const data = await exportUserDatabase();
      
      if (format === 'csv') {
        exportDatabaseToCSV(data);
      } else {
        downloadDatabaseExport(data);
      }
      
      toast({
        title: t('backupCompleted'),
        description: t('databaseExported'),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t('exportError'),
        description: t('cannotExport'),
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {t('noPermissionView')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('adminPanel')}</h1>
              <p className="text-muted-foreground">{t('userManagement')}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={exporting} variant="outline">
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('exporting')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('backupDatabase')}
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportDatabase('json')}>
                <Download className="mr-2 h-4 w-4" />
                {language === 'it' ? 'Esporta JSON' : 'Export JSON'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDatabase('csv')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {language === 'it' ? 'Esporta CSV (Excel)' : 'Export CSV (Excel)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('freePlan')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscription_tier === 'free').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeSubscriptions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscription_tier !== 'free').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('registeredUsers')}</CardTitle>
          <CardDescription>{t('platformUsers')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.full_name || user.email}</span>
                    <Badge variant={user.subscription_tier === 'free' ? 'secondary' : 'default'}>
                      {user.subscription_tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('registered')} {new Date(user.created_at).toLocaleDateString(dateLocale)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
