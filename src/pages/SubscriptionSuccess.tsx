import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);
  const [isUpdating, setIsUpdating] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Refresh subscription status immediately on page load
  useEffect(() => {
    const refreshSubscription = async () => {
      try {
        setIsUpdating(true);
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (error) {
          console.error('Error refreshing subscription:', error);
        } else {
          console.log('Subscription refreshed:', data);
          setUpdateSuccess(true);
        }
      } catch (err) {
        console.error('Failed to refresh subscription:', err);
      } finally {
        setIsUpdating(false);
      }
    };

    refreshSubscription();
  }, []);

  useEffect(() => {
    // Only start countdown after subscription is updated
    if (isUpdating) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/subscription");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isUpdating]);

  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">{t('subscriptionSuccess')}</CardTitle>
          <CardDescription>
            {t('subscriptionSuccessDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('language') === 'Lingua' 
              ? 'Grazie per esserti abbonato. Potrai accedere a tutte le funzionalità premium del tuo piano.'
              : 'Thank you for subscribing. You will be able to access all premium features of your plan.'}
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground text-center">
              {t('language') === 'Lingua' ? 'ID Sessione' : 'Session ID'}: {sessionId}
            </p>
          )}
          {isUpdating ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('language') === 'Lingua' ? 'Aggiornamento abbonamento...' : 'Updating subscription...'}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              {t('redirecting')} {countdown} {t('seconds')}...
            </div>
          )}
          <Button 
            className="w-full" 
            onClick={() => navigate("/subscription")}
            disabled={isUpdating}
          >
            {t('viewSubscription')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
