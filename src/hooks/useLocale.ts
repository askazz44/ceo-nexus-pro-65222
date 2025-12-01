import { useMemo } from 'react';
import { enUS, it as itLocale } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';

export function useLocale() {
  const { language } = useTranslation();

  const numberLocale = useMemo(
    () => (language === 'it' ? 'it-IT' : 'en-US'),
    [language]
  );

  const dateLocale = useMemo(
    () => (language === 'it' ? itLocale : enUS),
    [language]
  );

  const formatCurrency = useMemo(
    () => (amount: number, currency: string) =>
      new Intl.NumberFormat(numberLocale, {
        style: 'currency',
        currency,
      }).format(amount),
    [numberLocale]
  );

  const formatDate = useMemo(
    () => (date: Date | string, formatStr: string = 'PP') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(numberLocale, {
        dateStyle: 'medium',
      }).format(dateObj);
    },
    [numberLocale]
  );

  return {
    numberLocale,
    dateLocale,
    formatCurrency,
    formatDate,
  };
}
