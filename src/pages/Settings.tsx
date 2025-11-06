import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, Languages, Moon, Sun, User, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Language, getLanguage, setLanguage } from "@/lib/i18n";

export default function Settings() {
  const { toast } = useToast();
  const [language, setLang] = useState<Language>('it');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });

    // Load settings
    const savedLang = getLanguage();
    setLang(savedLang);

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = language === 'it' ? 'en' : 'it';
    setLang(newLang);
    setLanguage(newLang);
    toast({
      title: newLang === 'it' ? "Lingua cambiata" : "Language changed",
      description: newLang === 'it' ? "Impostazioni salvate" : "Settings saved",
    });
    setTimeout(() => window.location.reload(), 500);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast({
      title: language === 'it' ? "Tema cambiato" : "Theme changed",
      description: language === 'it' ? "Impostazioni salvate" : "Settings saved",
    });
  };

  const handleFeedback = () => {
    window.location.href = "mailto:gainflow10@gmail.com?subject=Feedback GainFlow";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'it' ? 'Impostazioni' : 'Settings'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'it' ? 'Gestisci le tue preferenze e impostazioni' : 'Manage your preferences and settings'}
        </p>
      </div>

      {/* Account Settings */}
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>{language === 'it' ? 'Account' : 'Account'}</CardTitle>
              <CardDescription>
                {language === 'it' ? 'Informazioni sul tuo account' : 'Your account information'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Moon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>{language === 'it' ? 'Aspetto' : 'Appearance'}</CardTitle>
              <CardDescription>
                {language === 'it' ? 'Personalizza l\'aspetto dell\'app' : 'Customize the app appearance'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
              <div>
                <Label className="text-sm font-medium">
                  {language === 'it' ? 'Tema Scuro' : 'Dark Theme'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'it' ? 'Attiva il tema scuro' : 'Enable dark mode'}
                </p>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>

          <Separator />

          {/* Language Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-sm font-medium">
                  {language === 'it' ? 'Lingua' : 'Language'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'it' ? `Lingua corrente: Italiano` : `Current language: English`}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              {language === 'it' ? 'EN' : 'IT'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>{language === 'it' ? 'Notifiche' : 'Notifications'}</CardTitle>
              <CardDescription>
                {language === 'it' ? 'Gestisci le notifiche' : 'Manage your notifications'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'it' ? 'Notifiche Email' : 'Email Notifications'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'it' ? 'Ricevi aggiornamenti via email' : 'Receive updates via email'}
              </p>
            </div>
            <Switch 
              checked={emailNotifications} 
              onCheckedChange={(checked) => {
                setEmailNotifications(checked);
                toast({
                  title: language === 'it' ? "Preferenze salvate" : "Preferences saved",
                });
              }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="card-hover border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>{language === 'it' ? 'Feedback' : 'Feedback'}</CardTitle>
              <CardDescription>
                {language === 'it' ? 'Aiutaci a migliorare' : 'Help us improve'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleFeedback} className="w-full btn-glow">
            <Mail className="mr-2 h-4 w-4" />
            {language === 'it' ? 'Invia Feedback' : 'Send Feedback'}
          </Button>
        </CardContent>
      </Card>

      {/* Credits */}
      <Card className="glass-hover border-muted">
        <CardContent className="py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-1">
              {language === 'it' ? 'Realizzato con' : 'Made with'} ❤️ {language === 'it' ? 'da' : 'by'}
            </p>
            <p className="text-primary font-semibold text-lg">Ascanio Vecchio</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}