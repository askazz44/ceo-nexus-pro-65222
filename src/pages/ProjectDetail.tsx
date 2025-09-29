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
import { ArrowLeft, Plus, Loader2, TrendingUp, TrendingDown, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    category: "",
    note: "",
    transaction_date: new Date().toISOString().split('T')[0],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("transactions").insert({
      project_id: id,
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category || null,
      note: formData.note || null,
      transaction_date: formData.transaction_date,
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
      setFormData({
        type: "income",
        amount: "",
        category: "",
        note: "",
        transaction_date: new Date().toISOString().split('T')[0],
      });
      loadTransactions();
    }
    setSubmitting(false);
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Transazione
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Transazione</DialogTitle>
              <DialogDescription>
                Registra un'entrata o un'uscita per questo progetto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Entrata</SelectItem>
                    <SelectItem value="expense">Uscita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Importo * ({project.currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="es. Vendite, Marketing, Stipendi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Data</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aggiungi
              </Button>
            </form>
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
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString('it-IT')}
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
    </div>
  );
}
