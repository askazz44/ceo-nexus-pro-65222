import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Gift } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSignUpSchema, authSignInSchema, type AuthSignUpFormData, type AuthSignInFormData } from "@/lib/schemas/passwordSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "@/lib/i18n";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const isIt = language === 'it';
  
  const signUpForm = useForm<AuthSignUpFormData>({
    resolver: zodResolver(authSignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  const signInForm = useForm<AuthSignInFormData>({
    resolver: zodResolver(authSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (data: AuthSignUpFormData) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: signUpData.user.id,
            email: signUpData.user.email!,
            full_name: data.fullName,
            subscription_tier: "free",
          });

        if (profileError) throw profileError;

        // Apply referral code if provided
        if (referralCode.trim()) {
          // Type assertion needed since apply_referral is a new function
          const { error: referralError } = await (supabase.rpc as any)('apply_referral', {
            referral_code_input: referralCode.trim().toUpperCase(),
            new_user_id: signUpData.user.id,
          });

          if (referralError) {
            console.log('Referral code not valid or error:', referralError);
            // Don't block signup, just log the error
          }
        }
      }

      toast({
        title: t('registrationComplete'),
        description: t('accountCreated'),
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignIn = async (data: AuthSignInFormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: t('loginSuccess'),
        description: t('welcome'),
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: isIt ? "Email inviata" : "Email sent",
        description: isIt 
          ? "Controlla la tua email per il link di reset password"
          : "Check your email for the password reset link",
      });
      
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/20 p-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Card className="w-full max-w-md shadow-xl animate-fade-up glass">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-2xl font-bold text-primary-foreground">GF</span>
            </div>
            <CardTitle className="text-2xl font-bold">
              {isIt ? "Recupera Password" : "Forgot Password"}
            </CardTitle>
            <CardDescription>
              {isIt 
                ? "Inserisci la tua email per ricevere il link di reset"
                : "Enter your email to receive the reset link"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('emailPlaceholder')}
                          className="glass-hover"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full btn-glow" 
                  disabled={forgotPasswordForm.formState.isSubmitting}
                >
                  {forgotPasswordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isIt ? "Invia Link Reset" : "Send Reset Link"}
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isIt ? "Torna al login" : "Back to login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/20 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-xl animate-fade-up glass">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-2xl font-bold text-primary-foreground">GF</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GainFlow
          </CardTitle>
          <CardDescription className="text-center">
            {t('welcomeTagline')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            className="glass-hover"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('password')}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="glass-hover"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full btn-glow" 
                    disabled={signInForm.formState.isSubmitting}
                  >
                    {signInForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('signIn')}
                  </Button>
                  <Button 
                    type="button"
                    variant="link" 
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    {isIt ? "Password dimenticata?" : "Forgot password?"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fullName')}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Mario Rossi"
                            className="glass-hover"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            className="glass-hover"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('password')}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="glass-hover"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  {/* Referral Code Field */}
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      {t('referralCodeLabel')}
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder={t('referralCodePlaceholder')}
                      className="glass-hover uppercase"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      maxLength={8}
                    />
                    {referralCode && (
                      <p className="text-xs text-muted-foreground">
                        {isIt ? 'Il tuo amico riceverà credito quando ti registri!' : 'Your friend will get credit when you sign up!'}
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-glow" 
                    disabled={signUpForm.formState.isSubmitting}
                  >
                    {signUpForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('signUp')}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
