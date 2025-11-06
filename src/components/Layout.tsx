import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FolderKanban, Settings, LogOut, User, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/lib/i18n";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkAdmin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('signOut'),
      description: t('signOutMessage'),
    });
  };

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: t('dashboard') },
    { path: "/projects", icon: FolderKanban, label: t('projects') },
    { path: "/subscription", icon: CreditCard, label: t('subscription') },
  ];

  if (isAdmin) {
    navItems.push({ path: "/admin", icon: Settings, label: t('admin') });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-glow transition-all">
                <span className="text-lg font-bold text-primary-foreground">GF</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GainFlow
              </span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2 text-sm font-medium flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {user?.email}
              </span>
            </div>
            <ThemeToggle />
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-6 min-h-[calc(100vh-4rem-5rem)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
