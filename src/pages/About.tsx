import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  FolderKanban,
  PieChart,
  FileText,
  Shield,
  Zap,
  Bell,
  Globe,
  Smartphone,
  Gift,
  ArrowRight,
  CheckCircle2,
  Target,
  Users,
  Rocket,
  DollarSign,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

const About = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isIt = language === "it";

  const capabilities = [
    {
      icon: FolderKanban,
      title: isIt ? "Progetti illimitati" : "Unlimited Projects",
      desc: isIt
        ? "Crea un progetto per ogni cliente/commessa e traccia entrate, uscite e risparmi separatamente"
        : "Create a project for each client/job and track income, expenses and savings separately",
    },
    {
      icon: BarChart3,
      title: isIt ? "Dashboard intelligente" : "Smart Dashboard",
      desc: isIt
        ? "Visualizza profitto netto, confronto periodi e trend con grafici interattivi"
        : "View net profit, period comparison and trends with interactive charts",
    },
    {
      icon: Zap,
      title: isIt ? "Import CSV bancario" : "Bank CSV Import",
      desc: isIt
        ? "Importa transazioni da Intesa, UniCredit, Revolut, N26, PayPal e altri con un click"
        : "Import transactions from Intesa, UniCredit, Revolut, N26, PayPal and more in one click",
    },
    {
      icon: Bell,
      title: isIt ? "Budget con notifiche" : "Budget with Alerts",
      desc: isIt
        ? "Imposta limiti di spesa e ricevi notifiche push automatiche quando superi l'80%"
        : "Set spending limits and receive automatic push notifications when you exceed 80%",
    },
    {
      icon: FileText,
      title: isIt ? "Report PDF" : "PDF Reports",
      desc: isIt
        ? "Genera report mensili professionali da condividere con il commercialista"
        : "Generate professional monthly reports to share with your accountant",
    },
    {
      icon: Globe,
      title: isIt ? "Multi-valuta" : "Multi-currency",
      desc: isIt
        ? "EUR, USD, GBP, CHF per chi lavora con clienti internazionali"
        : "EUR, USD, GBP, CHF for those working with international clients",
    },
    {
      icon: Smartphone,
      title: isIt ? "PWA installabile" : "Installable PWA",
      desc: isIt
        ? "Funziona come app nativa su telefono, anche offline"
        : "Works like a native phone app, even offline",
    },
    {
      icon: Shield,
      title: isIt ? "Dati sicuri" : "Secure Data",
      desc: isIt
        ? "Crittografia, autenticazione e Row Level Security su ogni tabella"
        : "Encryption, authentication and Row Level Security on every table",
    },
    {
      icon: Gift,
      title: isIt ? "Sistema referral" : "Referral System",
      desc: isIt
        ? "Invita 3 amici e ottieni 1 mese Pro gratis"
        : "Invite 3 friends and get 1 month Pro free",
    },
  ];

  const strengths = [
    {
      icon: Target,
      title: isIt ? "Semplicità" : "Simplicity",
      desc: isIt
        ? "Interfaccia pulita, nessuna curva di apprendimento — pensata per chi NON è un contabile"
        : "Clean interface, no learning curve — designed for non-accountants",
    },
    {
      icon: FolderKanban,
      title: isIt ? "Per progetto" : "Per Project",
      desc: isIt
        ? "L'unica app italiana che traccia profitti per singolo progetto/cliente"
        : "The only Italian app that tracks profits per individual project/client",
    },
    {
      icon: DollarSign,
      title: isIt ? "Prezzo accessibile" : "Affordable Price",
      desc: isIt
        ? "Piano Free generoso, Pro da €9/mese — 60% meno di QuickBooks"
        : "Generous Free plan, Pro from €9/month — 60% less than QuickBooks",
    },
    {
      icon: Globe,
      title: isIt ? "Made for Italy" : "Made for Italy",
      desc: isIt
        ? "Interfaccia bilingue IT/EN, import da banche italiane, pensata per Partite IVA"
        : "Bilingual IT/EN interface, Italian bank imports, designed for freelancers",
    },
    {
      icon: Smartphone,
      title: isIt ? "Mobile-first" : "Mobile-first",
      desc: isIt
        ? "PWA installabile con notifiche push, funziona ovunque"
        : "Installable PWA with push notifications, works anywhere",
    },
  ];

  const growthPoints = [
    {
      value: "5M+",
      label: isIt ? "Partite IVA in Italia" : "Freelancers in Italy",
      sub: isIt
        ? "La maggior parte usa Excel o nulla"
        : "Most use Excel or nothing",
    },
    {
      value: "∞",
      label: isIt ? "Scalabilità" : "Scalability",
      sub: isIt
        ? "Architettura cloud-native, pronta per migliaia di utenti"
        : "Cloud-native architecture, ready for thousands of users",
    },
    {
      value: "🌍",
      label: isIt ? "Espansione" : "Expansion",
      sub: isIt
        ? "Facilmente adattabile ad altri mercati europei"
        : "Easily adaptable to other European markets",
    },
    {
      value: "🔄",
      label: isIt ? "Viralità organica" : "Organic Virality",
      sub: isIt
        ? "Referral e passaparola tra colleghi freelancer"
        : "Referral and word-of-mouth among freelancers",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              GainFlow
            </span>
          </Button>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in text-sm px-4 py-1.5">
              {isIt ? "📊 Chi siamo" : "📊 About Us"}
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                GainFlow
              </span>
            </h1>

            <p
              className="text-xl md:text-2xl text-foreground/80 mb-4 animate-fade-in font-medium"
              style={{ animationDelay: "0.1s" }}
            >
              {isIt
                ? "Gestione Finanze per Freelancer & Microimprese"
                : "Financial Management for Freelancers & Micro-enterprises"}
            </p>

            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {isIt
                ? "L'app che trasforma il caos finanziario dei freelancer in chiarezza. Traccia i profitti per singolo progetto, non per categoria generica — così sai esattamente quanto guadagni da ogni cliente."
                : "The app that turns freelancer financial chaos into clarity. Track profits per individual project, not by generic category — so you know exactly how much you earn from each client."}
            </p>
          </div>
        </div>
      </section>

      {/* What you can do */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isIt ? "💡 Cosa puoi fare" : "💡 What you can do"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isIt
                ? "Tutto ciò che serve per gestire le finanze dei tuoi progetti"
                : "Everything you need to manage your project finances"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="card-hover border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isIt ? "🎯 Punti di forza" : "🎯 Strengths"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isIt
                ? "Ciò che rende GainFlow unica sul mercato"
                : "What makes GainFlow unique in the market"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {strengths.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quote */}
          <div className="max-w-3xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <blockquote className="relative p-8 rounded-2xl bg-card border border-border/50 shadow-lg">
              <div className="absolute -top-4 left-8 text-5xl text-primary/30 font-serif">
                "
              </div>
              <p className="text-lg italic text-foreground/80 leading-relaxed">
                {isIt
                  ? "Wave è troppo americano. QuickBooks è troppo caro. Notion richiede setup. GainFlow è l'unica app che fa una cosa sola e la fa bene: dirti quanto guadagni da ogni progetto, in 30 secondi."
                  : "Wave is too American. QuickBooks is too expensive. Notion requires setup. GainFlow is the only app that does one thing and does it well: telling you how much you earn from each project, in 30 seconds."}
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Growth Potential */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isIt ? "📈 Potenzialità di crescita" : "📈 Growth Potential"}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {growthPoints.map((item, index) => (
              <Card
                key={index}
                className="text-center card-hover border-border/50 bg-card/80 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-primary mb-2">{item.value}</p>
                  <p className="font-semibold mb-1">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Extra monetization info */}
          <div className="max-w-3xl mx-auto mt-16">
            <Card className="border-border/50 bg-card/80 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 text-center">
                  {isIt ? "💰 Modello di monetizzazione" : "💰 Monetization Model"}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: isIt ? "Abbonamenti mensili" : "Monthly subscriptions", detail: "€9-20/mese" },
                    { label: isIt ? "Lifetime Deal" : "Lifetime Deal", detail: "€249" },
                    { label: isIt ? "Affiliazioni professionali" : "Professional affiliations", detail: isIt ? "Commissioni ricorrenti" : "Recurring commissions" },
                    { label: isIt ? "White-label per studi" : "White-label for firms", detail: isIt ? "€2-5k per licenza" : "€2-5k per license" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="h-5 w-5 text-income flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container mx-auto px-4 text-center relative">
          <Rocket className="h-12 w-12 text-primary mx-auto mb-6 animate-fade-in" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isIt ? "Pronto a prendere il controllo?" : "Ready to take control?"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {isIt
              ? "Unisciti ai freelancer che stanno già usando GainFlow per sapere esattamente quanto guadagnano da ogni progetto."
              : "Join the freelancers already using GainFlow to know exactly how much they earn from each project."}
          </p>
          <Button
            size="lg"
            className="btn-glow text-lg px-8"
            onClick={() => navigate("/auth")}
          >
            {isIt ? "Inizia Gratis" : "Start Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            {isIt ? "Realizzato con" : "Made with"} ❤️ {isIt ? "da" : "by"}{" "}
            <a
              href="https://www.linkedin.com/in/ascanio-vecchio-110990384"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Ascanio Vecchio
            </a>
          </p>
          <p>
            © {new Date().getFullYear()} GainFlow.{" "}
            {isIt ? "Tutti i diritti riservati." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
