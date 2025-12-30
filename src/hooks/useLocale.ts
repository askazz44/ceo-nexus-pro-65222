import { useMemo, useCallback } from 'react';
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

  const formatCurrency = useCallback(
    (amount: number, currency: string) =>
      new Intl.NumberFormat(numberLocale, {
        style: 'currency',
        currency,
      }).format(amount),
    [numberLocale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(numberLocale, options).format(value),
    [numberLocale]
  );

  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(numberLocale, options ?? { dateStyle: 'medium' }).format(dateObj);
    },
    [numberLocale]
  );

  const formatPercent = useCallback(
    (value: number, decimals: number = 1) =>
      new Intl.NumberFormat(numberLocale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value),
    [numberLocale]
  );

  return {
    language,
    numberLocale,
    dateLocale,
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercent,
  };
}
