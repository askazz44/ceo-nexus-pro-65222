import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';

export interface TransactionFiltersState {
  type: 'all' | 'income' | 'expense';
  category: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  searchQuery: string;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
  categories: string[];
}

export function TransactionFilters({ filters, onFiltersChange, categories }: TransactionFiltersProps) {
  const { t, language } = useTranslation();
  const { formatDate } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  const dateLocale = language === 'it' ? it : enUS;

  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.category !== 'all' || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.searchQuery;

  const resetFilters = () => {
    onFiltersChange({
      type: 'all',
      category: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      searchQuery: '',
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={isExpanded ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('filters')}
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                !
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-muted-foreground">
              <X className="h-3 w-3" />
              {t('resetFilters')}
            </Button>
          )}

          <div className="flex-1">
            <Input
              placeholder={t('searchNotes')}
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="max-w-xs"
            />
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            {/* Type Filter */}
            <div className="space-y-2">
              <Label>{t('type')}</Label>
              <Select
                value={filters.type}
                onValueChange={(value: 'all' | 'income' | 'expense') => 
                  onFiltersChange({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="income">{t('entryType')}</SelectItem>
                  <SelectItem value="expense">{t('exitType')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>{t('category')}</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label>{t('dateFrom')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, 'PPP', { locale: dateLocale }) : t('selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                    locale={dateLocale}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>{t('dateTo')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'PPP', { locale: dateLocale }) : t('selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
                    locale={dateLocale}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const defaultFilters: TransactionFiltersState = {
  type: 'all',
  category: 'all',
  dateFrom: undefined,
  dateTo: undefined,
  searchQuery: '',
};
