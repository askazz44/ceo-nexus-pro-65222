import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { TrendingUp, TrendingDown, Pencil, Trash2, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/hooks/useLocale';
import type { Transaction } from '@/types/project';
import { TransactionFilters, TransactionFiltersState, defaultFilters } from './TransactionFilters';

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
  loading: boolean;
  page: number;
  totalPages: number;
  categories: string[];
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export function TransactionList({
  transactions,
  currency,
  loading,
  page,
  totalPages,
  categories,
  filters,
  onFiltersChange,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useLocale();

  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.category !== 'all' || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.searchQuery;

  if (loading) {
    return (
      <>
        <TransactionFilters 
          filters={filters} 
          onFiltersChange={onFiltersChange} 
          categories={categories} 
        />
        <Card>
          <CardHeader>
            <CardTitle>{t('transactionHistory')}</CardTitle>
            <CardDescription>{t('allTransactions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (transactions.length === 0) {
    return (
      <>
        <TransactionFilters 
          filters={filters} 
          onFiltersChange={onFiltersChange} 
          categories={categories} 
        />
        <Card>
          <CardHeader>
            <CardTitle>{t('transactionHistory')}</CardTitle>
            <CardDescription>{t('allTransactions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              {hasActiveFilters ? (
                <div className="space-y-3">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">{t('noResultsFound')}</p>
                  <p className="text-sm text-muted-foreground">{t('clearFilters')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onFiltersChange(defaultFilters)}
                  >
                    {t('resetFilters')}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t('noTransactionsRecorded')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <TransactionFilters 
        filters={filters} 
        onFiltersChange={onFiltersChange} 
        categories={categories} 
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('transactionHistory')}</CardTitle>
          <CardDescription>{t('allTransactions')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                {transaction.type === 'income' ? (
                    <TrendingUp className="h-5 w-5 text-income" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-expense" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {formatCurrency(Number(transaction.amount), currency)}
                      </p>
                      {transaction.category && (
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.transaction_date)}
                      {transaction.note && ` • ${transaction.note}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 0 && onPageChange(page - 1)}
                    className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => onPageChange(i)}
                      isActive={page === i}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages - 1 && onPageChange(page + 1)}
                    className={page === totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </>
  );
}
