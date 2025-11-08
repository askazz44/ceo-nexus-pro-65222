import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STRIPE_CONFIG } from "@/config/stripe";
import { useTranslation } from "@/lib/i18n";

const Subscription = () => {
  const { toast } = useToast();
  const { t, language } = useTranslation();
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
          title: t('error'),
          description: t('loginRequired'),
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
          title: t('redirectingStripe'),
          description: t('checkoutWindowOpened'),
        });
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: t('error'),
        description: t('unableToCheckout'),
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
        title: t('error'),
        description: t('unableToOpenPortal'),
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      name: "Free",
      monthlyPrice: STRIPE_CONFIG.pricing.free.monthly,
      yearlyPrice: STRIPE_CONFIG.pricing.free.yearly,
      period: t('forever'),
      description: STRIPE_CONFIG.descriptions[language as 'it' | 'en'].free,
      features: STRIPE_CONFIG.features[language as 'it' | 'en'].free,
      priceId: null,
      tier: "free",
      icon: Zap,
    },
    {
      name: "Pro",
      monthlyPrice: STRIPE_CONFIG.pricing.pro.monthly,
      yearlyPrice: STRIPE_CONFIG.pricing.pro.yearly,
      period: billingPeriod === "monthly" ? t('perMonth') : t('perYear'),
      description: STRIPE_CONFIG.descriptions[language as 'it' | 'en'].pro,
      features: STRIPE_CONFIG.features[language as 'it' | 'en'].pro,
      priceId: billingPeriod === "monthly" ? STRIPE_CONFIG.priceIds.pro_monthly : STRIPE_CONFIG.priceIds.pro_yearly,
      tier: "pro",
      icon: Zap,
      popular: true,
    },
    {
      name: "Business",
      monthlyPrice: STRIPE_CONFIG.pricing.business.monthly,
      yearlyPrice: STRIPE_CONFIG.pricing.business.yearly,
      period: billingPeriod === "monthly" ? t('perMonth') : t('perYear'),
      description: STRIPE_CONFIG.descriptions[language as 'it' | 'en'].business,
      features: STRIPE_CONFIG.features[language as 'it' | 'en'].business,
      priceId: billingPeriod === "monthly" ? STRIPE_CONFIG.priceIds.business_monthly : STRIPE_CONFIG.priceIds.business_yearly,
      tier: "business",
      icon: Crown,
    },
    {
      name: "Lifetime",
      monthlyPrice: STRIPE_CONFIG.pricing.lifetime.monthly,
      yearlyPrice: STRIPE_CONFIG.pricing.lifetime.yearly,
      period: t('oneTime'),
      description: STRIPE_CONFIG.descriptions[language as 'it' | 'en'].lifetime,
      features: STRIPE_CONFIG.features[language as 'it' | 'en'].lifetime,
      priceId: STRIPE_CONFIG.priceIds.lifetime,
      tier: "lifetime",
      icon: Crown,
      highlight: true,
    },
  ];

  if (checking) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('choosePlan')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('manageProjectsTagline')}
        </p>
        
        <div className="flex justify-center mt-8">
          <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}>
            <TabsList>
              <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
              <TabsTrigger value="yearly">{t('yearly')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      {currentTier !== "free" && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {t('currentPlan')}: {currentTier.toUpperCase()}
            </Badge>
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground">
                {t('validUntil')} {new Date(subscriptionEnd).toLocaleDateString()}
              </p>
            )}
            {currentTier !== "lifetime" && currentTier !== "free" && (
              <Button variant="outline" onClick={handleManageSubscription} className="mt-2">
                {t('manageSubscription')}
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
            <Badge>{t('mostPopular')}</Badge>
          </div>
        )}
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="secondary">{t('currentPlan')}</Badge>
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
                    {loading === plan.priceId ? t('loading') : t('choosePlanButton')}
                  </Button>
                ) : isCurrentPlan ? (
                  <Button className="w-full" variant="secondary" disabled>
                    {t('activePlan')}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    {t('currentPlanButton')}
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
