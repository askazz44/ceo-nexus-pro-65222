import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { useProject } from "@/hooks/useProjects";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Loader2, MoreVertical, Trash2, FileSpreadsheet } from "lucide-react";
import { CSVUpload } from "@/components/CSVUpload";
import { MonthlyReportDownload } from "@/components/MonthlyReportDownload";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ProjectStatsCards } from "@/components/project-detail/ProjectStats";
import { TransactionForm } from "@/components/project-detail/TransactionForm";
import { TransactionList } from "@/components/project-detail/TransactionList";
import { ProjectCharts } from "@/components/project-detail/ProjectCharts";
import { defaultFilters, TransactionFiltersState } from "@/components/project-detail/TransactionFilters";
import { exportTransactionsToCSV } from "@/lib/utils/csvExport";
import type { TransactionFormData } from "@/lib/schemas/transactionSchema";
import type { Transaction } from "@/types/project";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const { project, loading: projectLoading } = useProject(id);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<TransactionFiltersState>(defaultFilters);
  
  const { transactions, allTransactions, stats, loading: transactionsLoading, totalPages, categories, refetch } = useTransactions({
    projectId: id,
    page,
    itemsPerPage: 20,
    filters,
  });

  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);

  // Reset page when filters change
  const handleFiltersChange = (newFilters: TransactionFiltersState) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleSubmit = async (data: TransactionFormData) => {
    if (editingTransaction) {
      const { error } = await supabase
        .from("transactions")
        .update({
          type: data.type as 'income' | 'expense' | 'savings',
          amount: data.amount,
          category: data.category || null,
          note: data.note || null,
          transaction_date: data.transaction_date,
        })
        .eq("id", editingTransaction.id);

      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('transactionUpdated'),
          description: t('transactionModified'),
        });
        setOpen(false);
        setEditingTransaction(null);
        setPage(0);
        refetch();
      }
    } else {
      const { error } = await supabase.from("transactions").insert({
        project_id: id,
        type: data.type as 'income' | 'expense' | 'savings',
        amount: data.amount,
        category: data.category || null,
        note: data.note || null,
        transaction_date: data.transaction_date,
      });

      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('transactionAdded'),
          description: t('transactionRecorded'),
        });
        setOpen(false);
        setPage(0);
        refetch();
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionToDelete);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('transactionDeleted'),
        description: t('transactionRemoved'),
      });
      setPage(0);
      refetch();
    }
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const openDeleteDialog = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('projectDeleted'),
        description: t('projectRemovedSuccess'),
      });
      navigate("/projects");
    }
    setDeleteProjectDialogOpen(false);
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.industry && (
            <p className="text-muted-foreground">{project.industry}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => exportTransactionsToCSV(allTransactions, project.name)}
              disabled={allTransactions.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {language === 'it' ? 'Esporta CSV' : 'Export CSV'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteProjectDialogOpen(true)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('deleteProject')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2">
          <CSVUpload projectId={id!} onUploadComplete={refetch} />
          <MonthlyReportDownload project={project} transactions={allTransactions} />
        </div>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setEditingTransaction(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('newTransaction')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransaction ? t('editTransaction') : t('addTransaction')}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? t('editTransactionDesc') : t('registerTransactionDesc')}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              projectId={id!}
              currency={project.currency}
              editingTransaction={editingTransaction}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ProjectStatsCards stats={stats} currency={project.currency} />

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">{t('transactions')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
          <TabsTrigger value="info">{t('projectInfo')}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionList
            transactions={transactions}
            currency={project.currency}
            loading={transactionsLoading}
            page={page}
            totalPages={totalPages}
            categories={categories}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ProjectCharts transactions={allTransactions} currency={project.currency} />
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>{t('projectInfo')}</CardTitle>
              <CardDescription>{t('projectDetails')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('description')}</p>
                  <p className="mt-1">{project.description}</p>
                </div>
              )}
              {project.industry && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('industry')}</p>
                  <p className="mt-1">{project.industry}</p>
                </div>
              )}
              {project.target_revenue && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('targetRevenue')}</p>
                  <p className="mt-1">
                    {new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', {
                      style: 'currency',
                      currency: project.currency,
                    }).format(Number(project.target_revenue))}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('startDate')}</p>
                <p className="mt-1">{new Date(project.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('currency')}</p>
                <p className="mt-1">{project.currency}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeletion')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteTransactionWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteProjectDialogOpen} onOpenChange={setDeleteProjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeletion')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteProjectWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
