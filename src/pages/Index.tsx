import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  FileText, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  FolderKanban
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const features = [
    {
      icon: FolderKanban,
      title: language === 'it' ? 'Multi-Progetto' : 'Multi-Project',
      description: language === 'it' 
        ? 'Gestisci più progetti contemporaneamente con dashboard dedicate' 
        : 'Manage multiple projects simultaneously with dedicated dashboards',
    },
    {
      icon: TrendingUp,
      title: language === 'it' ? 'Analisi Trend' : 'Trend Analysis',
      description: language === 'it' 
        ? 'Visualizza l\'andamento delle tue finanze con grafici interattivi' 
        : 'View your financial trends with interactive charts',
    },
    {
      icon: PieChart,
      title: language === 'it' ? 'Categorie Spese' : 'Expense Categories',
      description: language === 'it' 
        ? 'Categorizza le spese e scopri dove vanno i tuoi soldi' 
        : 'Categorize expenses and discover where your money goes',
    },
    {
      icon: FileText,
      title: language === 'it' ? 'Report PDF' : 'PDF Reports',
      description: language === 'it' 
        ? 'Genera report mensili professionali in formato PDF' 
        : 'Generate professional monthly reports in PDF format',
    },
    {
      icon: Shield,
      title: language === 'it' ? 'Sicuro & Privato' : 'Secure & Private',
      description: language === 'it' 
        ? 'I tuoi dati sono protetti con crittografia end-to-end' 
        : 'Your data is protected with end-to-end encryption',
    },
    {
      icon: Zap,
      title: language === 'it' ? 'Import CSV' : 'CSV Import',
      description: language === 'it' 
        ? 'Importa facilmente le transazioni da file CSV' 
        : 'Easily import transactions from CSV files',
    },
  ];

  const benefits = [
    language === 'it' ? 'Dashboard globale con panoramica completa' : 'Global dashboard with complete overview',
    language === 'it' ? 'Supporto multi-valuta' : 'Multi-currency support',
    language === 'it' ? 'Confronto periodi automatico' : 'Automatic period comparison',
    language === 'it' ? 'Installabile come app PWA' : 'Installable as PWA app',
    language === 'it' ? 'Interfaccia italiano/inglese' : 'Italian/English interface',
    language === 'it' ? 'Zero configurazione richiesta' : 'Zero configuration required',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with toggles */}
      <header className="fixed top-0 right-0 p-4 flex items-center gap-2 z-50">
        <LanguageToggle />
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              {language === 'it' ? '✨ Gestione Finanziaria Semplice' : '✨ Simple Financial Management'}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GainFlow
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {language === 'it' 
                ? 'Tieni traccia delle entrate e uscite dei tuoi progetti. Perfetto per freelancer e piccole imprese.'
                : 'Track income and expenses for your projects. Perfect for freelancers and small businesses.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="btn-glow text-lg px-8"
                onClick={() => navigate('/auth')}
              >
                {language === 'it' ? 'Inizia Gratis' : 'Start Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/subscription')}
              >
                {language === 'it' ? 'Vedi Piani' : 'View Plans'}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">2</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'it' ? 'Progetti gratis' : 'Free projects'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-income">∞</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'it' ? 'Transazioni' : 'Transactions'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-accent-foreground">24/7</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'it' ? 'Accessibile' : 'Accessible'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'it' ? 'Tutto ciò di cui hai bisogno' : 'Everything you need'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'it' 
                ? 'Strumenti potenti per gestire le finanze dei tuoi progetti in modo efficiente'
                : 'Powerful tools to manage your project finances efficiently'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="card-hover border-border/50 bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {language === 'it' ? 'Perché scegliere GainFlow?' : 'Why choose GainFlow?'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {language === 'it' 
                  ? 'Progettato per freelancer e piccole imprese che vogliono tenere sotto controllo le proprie finanze senza complicazioni.'
                  : 'Designed for freelancers and small businesses who want to keep their finances under control without complications.'}
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-income flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="mt-8"
                onClick={() => navigate('/auth')}
              >
                {language === 'it' ? 'Crea Account Gratis' : 'Create Free Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <Card className="relative shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-income/10 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-income" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'it' ? 'Profitto Netto' : 'Net Profit'}
                      </p>
                      <p className="text-2xl font-bold text-income">+€12,450</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-income/5 border border-income/20">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-income" />
                        <span>{language === 'it' ? 'Entrate' : 'Income'}</span>
                      </div>
                      <span className="font-semibold text-income">€24,800</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg bg-expense/5 border border-expense/20">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-expense" />
                        <span>{language === 'it' ? 'Uscite' : 'Expenses'}</span>
                      </div>
                      <span className="font-semibold text-expense">€12,350</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'it' ? 'Pronto a iniziare?' : 'Ready to get started?'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {language === 'it' 
              ? 'Crea il tuo account gratuito e inizia a gestire le finanze dei tuoi progetti oggi stesso.'
              : 'Create your free account and start managing your project finances today.'}
          </p>
          <Button 
            size="lg" 
            className="btn-glow text-lg px-8"
            onClick={() => navigate('/auth')}
          >
            {language === 'it' ? 'Inizia Ora - È Gratis' : 'Start Now - It\'s Free'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            {language === 'it' ? 'Realizzato con' : 'Made with'} ❤️ {language === 'it' ? 'da' : 'by'}{' '}
            <a 
              href="https://www.linkedin.com/in/ascanio-vecchio-110990384" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Ascanio Vecchio
            </a>
          </p>
          <p>© {new Date().getFullYear()} GainFlow. {language === 'it' ? 'Tutti i diritti riservati.' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;