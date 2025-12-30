import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, TrendingUp, Building2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormData } from "@/lib/schemas/projectSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function Projects() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(true);
  const [projectLimit, setProjectLimit] = useState({ current: 0, max: 0, tier: 'free' as 'free' | 'pro' | 'business' | 'lifetime' });
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      target_revenue: undefined,
      currency: "EUR",
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    loadProjects();
    checkCanCreate();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: t('error'),
        description: t('unableToLoadProjects'),
        variant: "destructive",
      });
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const checkCanCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Prendi il profilo con il tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle();

    // Conta progetti attuali
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Calcola limite
    const limits = { free: 2, pro: 10, business: 999999, lifetime: 999999 };
    const maxProjects = limits[profile?.subscription_tier || 'free'];

    setProjectLimit({ 
      current: count || 0, 
      max: maxProjects,
      tier: profile?.subscription_tier || 'free'
    });
    setCanCreate((count || 0) < maxProjects);
  };

  const handleSubmit = async (data: ProjectFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: data.name,
      industry: data.industry || null,
      description: data.description || null,
      target_revenue: data.target_revenue || null,
      currency: data.currency,
      start_date: data.start_date,
    });

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('projectCreated'),
        description: t('projectCreatedSuccess'),
      });
      setOpen(false);
      form.reset();
      loadProjects();
      checkCanCreate();
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectToDelete);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('projectDeleted'),
        description: t('projectDeletedSuccess'),
      });
      loadProjects();
      checkCanCreate();
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const openDeleteDialog = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-xl mb-3" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute -top-10 left-0 w-48 h-48 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('myProjects')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('manageCompanies')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreate} className="btn-glow shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              {t('createProject')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('createNewProject')}</DialogTitle>
              <DialogDescription>
                {t('projectDetails')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('projectName')} *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('industry')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="es. Tech, Retail, Consulting" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('description')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Obiettivi e note sul progetto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="target_revenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('targetRevenue')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('currency')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('startDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('createProject')}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!canCreate && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-medium">
              {t('limitReached').replace('{current}', projectLimit.current.toString()).replace('{max}', projectLimit.max.toString())}
            </p>
            <p className="text-sm text-muted-foreground">
              {projectLimit.tier === 'free' && t('upgradeToProMessage')}
              {projectLimit.tier === 'pro' && t('upgradeToBusinessMessage')}
            </p>
            <Button onClick={() => navigate('/subscription')} size="sm">
              {t('seePlans')}
            </Button>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noProjectsYet')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('startCreating')}
            </p>
            <Button onClick={() => setOpen(true)} disabled={!canCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createFirstProject')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Card
              key={project.id}
              className="group card-hover cursor-pointer overflow-hidden border-2 hover:border-primary/50 bg-gradient-to-br from-card to-accent/5"
              onClick={() => navigate(`/project/${project.id}`)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-3 shadow-md group-hover:shadow-glow transition-all">
                    <Building2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => openDeleteDialog(e, project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                {project.industry && (
                  <CardDescription className="text-sm">{project.industry}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="relative">
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                {project.target_revenue && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-income-light/50 border border-income/20">
                    <TrendingUp className="h-4 w-4 text-income" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Target Revenue</p>
                      <p className="font-bold text-income">
                        {new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', {
                          style: 'currency',
                          currency: project.currency,
                        }).format(project.target_revenue)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeletion')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteProjectWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
