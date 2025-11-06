import { Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="mailto:gainflow10@gmail.com"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              {t('feedback')}
            </a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {t('madeBy')}{' '}
            <span className="text-primary font-medium">
              Ascanio Vecchio
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}