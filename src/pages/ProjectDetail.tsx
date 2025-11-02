import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Loader2, TrendingUp, TrendingDown, Pencil, Trash2, MoreVertical } from "lucide-react";
import { CSVUpload } from "@/components/CSVUpload";
import { MonthlyReportDownload } from "@/components/MonthlyReportDownload";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormData } from "@/lib/schemas/transactionSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      amount: 0,
      category: "",
      note: "",
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    loadProject();
    loadTransactions();
  }, [id]);

  const loadProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Errore",
        description: "Progetto non trovato",
        variant: "destructive",
      });
      navigate("/projects");
    } else {
      setProject(data);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("project_id", id)
      .order("transaction_date", { ascending: false });

    if (!error) {
      setTransactions(data || []);
    }
  };

  const handleSubmit = async (data: TransactionFormData) => {
    if (editingTransaction) {
      const { error } = await supabase
        .from("transactions")
        .update({
          type: data.type,
          amount: data.amount,
          category: data.category || null,
          note: data.note || null,
          transaction_date: data.transaction_date,
        })
        .eq("id", editingTransaction.id);

      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transazione aggiornata",
          description: "La transazione è stata modificata",
        });
        setOpen(false);
        setEditingTransaction(null);
        form.reset();
        loadTransactions();
      }
    } else {
      const { error } = await supabase.from("transactions").insert({
        project_id: id,
        type: data.type,
        amount: data.amount,
        category: data.category || null,
        note: data.note || null,
        transaction_date: data.transaction_date,
      });

      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transazione aggiunta",
          description: "La transazione è stata registrata",
        });
        setOpen(false);
        form.reset();
        loadTransactions();
      }
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    form.reset({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category || "",
      note: transaction.note || "",
      transaction_date: transaction.transaction_date,
    });
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
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Transazione eliminata",
        description: "La transazione è stata rimossa",
      });
      loadTransactions();
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
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Progetto eliminato",
        description: "Il progetto è stato rimosso con successo",
      });
      navigate("/projects");
    }
    setDeleteProjectDialogOpen(false);
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  if (loading) {
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
            <DropdownMenuItem onClick={() => setDeleteProjectDialogOpen(true)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina Progetto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2">
          <CSVUpload projectId={id!} onUploadComplete={loadTransactions} />
          <MonthlyReportDownload project={project} transactions={transactions} />
        </div>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setEditingTransaction(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Transazione
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Modifica Transazione" : "Aggiungi Transazione"}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? "Modifica i dati della transazione" : "Registra un'entrata o un'uscita per questo progetto"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Entrata</SelectItem>
                          <SelectItem value="expense">Uscita</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importo * ({project.currency})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="es. Vendite, Marketing, Stipendi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transaction_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTransaction ? "Salva Modifiche" : "Aggiungi"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Entrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: project.currency,
              }).format(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Uscite</CardTitle>
            <TrendingDown className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: project.currency,
              }).format(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitto Netto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
              {new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: project.currency,
              }).format(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transazioni</TabsTrigger>
          <TabsTrigger value="info">Info Progetto</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storico Transazioni</CardTitle>
              <CardDescription>Tutte le entrate e uscite del progetto</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nessuna transazione registrata
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-5 w-5 text-chart-1" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-chart-2" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {new Intl.NumberFormat('it-IT', {
                                style: 'currency',
                                currency: project.currency,
                              }).format(transaction.amount)}
                            </span>
                            {transaction.category && (
                              <Badge variant="secondary">{transaction.category}</Badge>
                            )}
                          </div>
                          {transaction.note && (
                            <p className="text-sm text-muted-foreground">{transaction.note}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground mr-2">
                          {new Date(transaction.transaction_date).toLocaleDateString('it-IT')}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Progetto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <Label>Descrizione</Label>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                </div>
              )}
              {project.target_revenue && (
                <div>
                  <Label>Target Revenue</Label>
                  <p className="text-lg font-semibold mt-1">
                    {new Intl.NumberFormat('it-IT', {
                      style: 'currency',
                      currency: project.currency,
                    }).format(project.target_revenue)}
                  </p>
                </div>
              )}
              <div>
                <Label>Data Inizio</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(project.start_date).toLocaleDateString('it-IT')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione Transazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteProjectDialogOpen} onOpenChange={setDeleteProjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione Progetto</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo progetto? Tutte le transazioni associate verranno eliminate. Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>Elimina Progetto</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
