import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
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
  }, [navigate]);

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
          <div className="text-center text-sm text-muted-foreground">
            {t('redirecting')} {countdown} {t('seconds')}...
          </div>
          <Button 
            className="w-full" 
            onClick={() => navigate("/subscription")}
          >
            {t('viewSubscription')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
