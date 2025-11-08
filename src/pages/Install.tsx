import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Chrome, Share, Download } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <div className="max-w-2xl mx-auto space-y-6 pt-12">
        <div className="text-center space-y-4">
          <Smartphone className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">
            {t('installApp')}
          </h1>
          <p className="text-muted-foreground text-lg">
            Installa GainFlow sul tuo dispositivo per un'esperienza migliore
          </p>
        </div>

        {isInstallable && !isIOS && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Installazione Rapida
              </CardTitle>
              <CardDescription>
                Clicca il pulsante per installare l'app sul tuo dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleInstallClick} 
                className="w-full"
                size="lg"
              >
                Installa Ora
              </Button>
            </CardContent>
          </Card>
        )}

        {isIOS && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="w-5 h-5" />
                Installazione su iPhone/iPad
              </CardTitle>
              <CardDescription>
                Segui questi semplici passi per installare l'app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Apri il menu Condividi</p>
                  <p className="text-sm text-muted-foreground">
                    Tocca l'icona Condividi (quadrato con freccia) nella barra in basso di Safari
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Aggiungi alla schermata Home</p>
                  <p className="text-sm text-muted-foreground">
                    Scorri verso il basso e seleziona "Aggiungi a Home"
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Conferma</p>
                  <p className="text-sm text-muted-foreground">
                    Tocca "Aggiungi" in alto a destra per completare l'installazione
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isIOS && !isInstallable && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="w-5 h-5" />
                Installazione su Android/Desktop
              </CardTitle>
              <CardDescription>
                Segui questi semplici passi per installare l'app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Apri il menu del browser</p>
                  <p className="text-sm text-muted-foreground">
                    Tocca i tre puntini in alto a destra (Chrome) o l'icona menu del tuo browser
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Installa l'app</p>
                  <p className="text-sm text-muted-foreground">
                    Seleziona "Installa app" o "Aggiungi a schermata Home"
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Conferma</p>
                  <p className="text-sm text-muted-foreground">
                    Tocca "Installa" per completare l'installazione
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Vantaggi dell'installazione</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Accesso rapido</p>
                <p className="text-sm text-muted-foreground">Apri l'app direttamente dalla schermata Home</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Funziona offline</p>
                <p className="text-sm text-muted-foreground">Accedi ai tuoi dati anche senza connessione</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;