import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import type { ProjectStats } from '@/types/project';

interface ProfitabilityCardProps {
  stats: ProjectStats;
  currency: string;
}

export function ProfitabilityCard({ stats, currency }: ProfitabilityCardProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatNumber } = useLocale();

  const roi = stats.roi;
  const rate = stats.hourlyRate;

  const roiTone =
    roi === null ? 'muted'
      : roi >= 50 ? 'good'
      : roi >= 21 ? 'mid'
      : 'bad';

  const roiColor =
    roiTone === 'good' ? 'text-income'
      : roiTone === 'mid' ? 'text-savings'
      : roiTone === 'bad' ? 'text-expense'
      : 'text-muted-foreground';

  const roiMsg =
    roiTone === 'good' ? { text: t('roiGoodMsg'), emoji: '🟢', variant: 'default' as const }
      : roiTone === 'mid' ? { text: t('roiMidMsg'), emoji: '🟡', variant: 'default' as const }
      : roiTone === 'bad' ? { text: t('roiLowMsg'), emoji: '🔴', variant: 'destructive' as const }
      : null;

  const isShock = rate !== null && rate < 12;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('profitability')}</CardTitle>
          <TrendingUp className={`h-4 w-4 ${roiColor}`} />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`text-3xl font-bold ${roiColor}`}>
            {roi === null ? '—' : `${formatNumber(roi, { maximumFractionDigits: 1 })}%`}
          </div>
          {roiMsg && (
            <Alert variant={roiMsg.variant}>
              <AlertDescription className="text-sm">
                <span className="mr-1">{roiMsg.emoji}</span>
                {roiMsg.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('hourlyRate')}</CardTitle>
          <Clock className={`h-4 w-4 ${isShock ? 'text-expense' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent className="space-y-3">
          {rate === null ? (
            <>
              <div className="text-3xl font-bold text-muted-foreground">—</div>
              <p className="text-sm text-muted-foreground">{t('addHoursToSeeRate')}</p>
            </>
          ) : (
            <>
              <div className={`text-3xl font-bold ${isShock ? 'text-expense' : 'text-income'}`}>
                {formatCurrency(rate, currency)}
                <span className="text-sm font-normal text-muted-foreground ml-1">{t('perHour')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('hoursTotal')}: {formatNumber(stats.totalHours, { maximumFractionDigits: 1 })}
              </p>
              {isShock && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {t('hourlyRateShockMsg')}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
