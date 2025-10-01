import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PRICE_IDS = {
  pro_monthly: "price_1SDMO8Qq3sG1dhTUwHusboCN",
  pro_yearly: "price_1SDMOfQq3sG1dhTUzZ4VevXN",
  business_monthly: "price_1SDPTdQq3sG1dhTUcfeVjrui",
  business_yearly: "price_1SDPTtQq3sG1dhTUpw16XOy7",
  lifetime: "price_1SDPUIQq3sG1dhTUZlnFF8fH",
};

const Subscription = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const checkSubscription = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) return;

      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;

      if (data) {
        setCurrentTier(data.tier || "free");
        setSubscriptionEnd(data.subscription_end);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(priceId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast({
          title: "Errore",
          description: "Devi effettuare il login per abbonarti",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Reindirizzamento a Stripe",
          description: "Aperta nuova finestra per il checkout",
        });
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Errore",
        description: "Impossibile avviare il checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) return;

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Errore",
        description: "Impossibile aprire il portale di gestione",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      name: "Free",
      monthlyPrice: "€0",
      yearlyPrice: "€0",
      period: "/sempre",
      description: "Per iniziare",
      features: [
        "2 progetti",
        "30 giorni di cronologia",
        "Analisi base",
        "Export CSV"
      ],
      priceId: null,
      tier: "free",
      icon: Zap,
    },
    {
      name: "Pro",
      monthlyPrice: "€9.99",
      yearlyPrice: "€79",
      period: billingPeriod === "monthly" ? "/mese" : "/anno",
      description: "Per professionisti",
      features: [
        "10 progetti",
        "ZERO ADS",
        "Cronologia illimitata",
        "Export avanzati",
        "Previsioni AI"
      ],
      priceId: billingPeriod === "monthly" ? PRICE_IDS.pro_monthly : PRICE_IDS.pro_yearly,
      tier: "pro",
      icon: Zap,
      popular: true,
    },
    {
      name: "Business",
      monthlyPrice: "€19.99",
      yearlyPrice: "€149",
      period: billingPeriod === "monthly" ? "/mese" : "/anno",
      description: "Per aziende",
      features: [
        "Progetti illimitati",
        "Team access",
        "API",
        "White-label",
        "Supporto prioritario"
      ],
      priceId: billingPeriod === "monthly" ? PRICE_IDS.business_monthly : PRICE_IDS.business_yearly,
      tier: "business",
      icon: Crown,
    },
    {
      name: "Lifetime",
      monthlyPrice: "€249",
      yearlyPrice: "€249",
      period: "/una tantum",
      description: "Pro tier forever",
      features: [
        "Tutte le funzionalità Pro",
        "Accesso a vita",
        "Nessun costo mensile",
        "Aggiornamenti inclusi",
        "Supporto premium"
      ],
      priceId: PRICE_IDS.lifetime,
      tier: "lifetime",
      icon: Crown,
      highlight: true,
    },
  ];

  if (checking) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Scegli il tuo piano</h1>
        <p className="text-xl text-muted-foreground">
          Gestisci i tuoi progetti con gli strumenti più adatti alle tue esigenze
        </p>
        
        <div className="flex justify-center mt-8">
          <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}>
            <TabsList>
              <TabsTrigger value="monthly">Mensile</TabsTrigger>
              <TabsTrigger value="yearly">Annuale</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {currentTier !== "free" && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Piano attuale: {currentTier.toUpperCase()}
            </Badge>
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground">
                Valido fino al {new Date(subscriptionEnd).toLocaleDateString()}
              </p>
            )}
            {currentTier !== "lifetime" && currentTier !== "free" && (
              <Button variant="outline" onClick={handleManageSubscription} className="mt-2">
                Gestisci abbonamento
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.tier === currentTier;

          return (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg"
                  : plan.highlight
                  ? "border-secondary shadow-lg"
                  : ""
              } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Più popolare</Badge>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary">Piano attuale</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.priceId && !isCurrentPlan ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(plan.priceId!, plan.name)}
                    disabled={loading === plan.priceId}
                  >
                    {loading === plan.priceId ? "Caricamento..." : "Scegli piano"}
                  </Button>
                ) : isCurrentPlan ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Piano attivo
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Piano attuale
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
