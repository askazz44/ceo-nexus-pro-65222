import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

export function DeleteAccountDialog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const CONFIRM_PHRASE = "ELIMINA";

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_PHRASE) {
      toast({
        title: t('error'),
        description: t('typeConfirmPhrase'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('error'),
          description: t('notAuthenticated'),
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete account');
      }

      toast({
        title: t('accountDeleted'),
        description: t('accountDeletedSuccess'),
      });

      // Sign out and redirect using React Router
      await supabase.auth.signOut();
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: t('error'),
        description: error.message || t('deleteAccountError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('deleteAccount')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">{t('deleteAccountTitle')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>{t('deleteAccountWarning')}</p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>{t('deleteAccountItem1')}</li>
              <li>{t('deleteAccountItem2')}</li>
              <li>{t('deleteAccountItem3')}</li>
            </ul>
            <div className="pt-4">
              <Label htmlFor="confirm" className="text-foreground font-medium">
                {t('typeToConfirm')} <span className="font-bold text-destructive">{CONFIRM_PHRASE}</span>
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="mt-2"
                disabled={loading}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('cancel')}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={confirmText !== CONFIRM_PHRASE || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('deleteAccountPermanently')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
