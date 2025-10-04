// Centralizza tutti gli ID Stripe
export const STRIPE_CONFIG = {
  priceIds: {
    pro_monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || "price_1SDMO8Qq3sG1dhTUwHusboCN",
    pro_yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || "price_1SDMOfQq3sG1dhTUzZ4VevXN",
    business_monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || "price_1SDPTdQq3sG1dhTUcfeVjrui",
    business_yearly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_YEARLY || "price_1SDPTtQq3sG1dhTUpw16XOy7",
    lifetime: import.meta.env.VITE_STRIPE_PRICE_LIFETIME || "price_1SDPUIQq3sG1dhTUZlnFF8fH",
  },
  features: {
    free: ["2 progetti", "30 giorni di cronologia", "Analisi base", "Export CSV"],
    pro: ["10 progetti", "ZERO ADS", "Cronologia illimitata", "Export avanzati", "Previsioni AI"],
    business: ["Progetti illimitati", "Team access", "API", "White-label", "Supporto prioritario"],
    lifetime: ["Tutte le funzionalità Pro", "Accesso a vita", "Nessun costo mensile", "Aggiornamenti inclusi", "Supporto premium"],
  },
  pricing: {
    free: { monthly: "€0", yearly: "€0" },
    pro: { monthly: "€9.99", yearly: "€79" },
    business: { monthly: "€19.99", yearly: "€149" },
    lifetime: { monthly: "€249", yearly: "€249" },
  },
  descriptions: {
    free: "Per iniziare",
    pro: "Per professionisti",
    business: "Per aziende",
    lifetime: "Pro tier forever",
  }
} as const;

export type SubscriptionTier = keyof typeof STRIPE_CONFIG.features;
