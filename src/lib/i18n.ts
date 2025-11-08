import * as React from 'react';

export type Language = 'it' | 'en';

export const translations = {
  it: {
    // Navigation
    dashboard: 'Dashboard',
    projects: 'Progetti',
    subscription: 'Abbonamento',
    admin: 'Admin',
    
    // Auth
    signOut: 'Disconnesso',
    signOutMessage: 'A presto!',
    
    // Dashboard
    totalProjects: 'Progetti Totali',
    totalIncome: 'Incassi Totali',
    totalExpense: 'Spese Totali',
    monthlyTrend: 'Andamento Mensile',
    incomeVsExpense: 'Incassi vs Spese',
    income: 'Incassi',
    expense: 'Spese',
    recentTransactions: 'Transazioni Recenti',
    viewAll: 'Vedi tutte',
    noTransactions: 'Nessuna transazione recente',
    
    // Projects
    myProjects: 'I Miei Progetti',
    createProject: 'Nuovo Progetto',
    noProjects: 'Nessun progetto trovato',
    createFirst: 'Crea il tuo primo progetto',
    
    // Footer
    madeBy: 'Realizzato da',
    feedback: 'Invia Feedback',
    
    // Install
    installApp: 'Installa GainFlow',
    
    // Common
    loading: 'Caricamento...',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    projects: 'Projects',
    subscription: 'Subscription',
    admin: 'Admin',
    
    // Auth
    signOut: 'Signed out',
    signOutMessage: 'See you soon!',
    
    // Dashboard
    totalProjects: 'Total Projects',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expenses',
    monthlyTrend: 'Monthly Trend',
    incomeVsExpense: 'Income vs Expenses',
    income: 'Income',
    expense: 'Expenses',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View all',
    noTransactions: 'No recent transactions',
    
    // Projects
    myProjects: 'My Projects',
    createProject: 'New Project',
    noProjects: 'No projects found',
    createFirst: 'Create your first project',
    
    // Footer
    madeBy: 'Made by',
    feedback: 'Send Feedback',
    
    // Install
    installApp: 'Install GainFlow',
    
    // Common
    loading: 'Loading...',
  },
};

export const getLanguage = (): Language => {
  const saved = localStorage.getItem('language') as Language | null;
  return saved || 'it';
};

export const setLanguage = (lang: Language) => {
  localStorage.setItem('language', lang);
};

export const useTranslation = () => {
  const [language, setLang] = React.useState<Language>(getLanguage());

  const t = (key: keyof typeof translations.it): string => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang: Language) => {
    setLang(lang);
    setLanguage(lang);
  };

  return { t, language, changeLanguage };
};