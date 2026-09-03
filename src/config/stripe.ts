// Centralize all Stripe IDs and language-aware copy
export const STRIPE_CONFIG = {
  priceIds: {
    pro_monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || "price_1UBbYVJ0DTKAEOs5SXGjUsKV",
    pro_yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || "price_1UBbZQJ0DTKAEOs51PjDog77",
    business_monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || "price_1UBba9J0DTKAEOs518l1ITQ6",
    business_yearly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_YEARLY || "price_1UBbc5J0DTKAEOs5o918MIj6",
    lifetime: import.meta.env.VITE_STRIPE_PRICE_LIFETIME || "price_1UBbczJ0DTKAEOs5pyklAXVb",
  },
  features: {
    it: {
      free: ["2 progetti", "30 giorni di cronologia", "Analisi base", "Export CSV"],
      pro: ["10 progetti", "ZERO ADS", "Cronologia illimitata", "Export avanzati", "Previsioni AI"],
      business: ["Progetti illimitati", "Team access", "API", "White-label", "Supporto prioritario"],
      lifetime: ["Tutte le funzionalità Pro", "Accesso a vita", "Nessun costo mensile", "Aggiornamenti inclusi", "Supporto premium"],
    },
    en: {
      free: ["2 projects", "30 days history", "Basic analytics", "CSV export"],
      pro: ["10 projects", "ZERO ADS", "Unlimited history", "Advanced exports", "AI forecasts"],
      business: ["Unlimited projects", "Team access", "API", "White-label", "Priority support"],
      lifetime: ["All Pro features", "Lifetime access", "No monthly cost", "Updates included", "Premium support"],
    },
  },
  pricing: {
    free: { monthly: "€0", yearly: "€0" },
    pro: { monthly: "€9.99", yearly: "€79" },
    business: { monthly: "€14.99", yearly: "€149" },
    lifetime: { monthly: "€199", yearly: "€199" },
  },
  descriptions: {
    it: {
      free: "Per iniziare",
      pro: "Per professionisti",
      business: "Per aziende",
      lifetime: "Pro tier per sempre",
    },
    en: {
      free: "For getting started",
      pro: "For professionals",
      business: "For businesses",
      lifetime: "Pro tier forever",
    },
  },
} as const;

export type SubscriptionTier = keyof typeof STRIPE_CONFIG.features.it;
