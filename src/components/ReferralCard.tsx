import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Share2, Users, Check, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

interface ReferralData {
  referral_code: string | null;
  referral_count: number;
  referral_reward_claimed: boolean;
}

export function ReferralCard() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Type assertion for new columns that may not be in generated types
      const profileData = data as unknown as {
        referral_code: string | null;
        referral_count: number;
        referral_reward_claimed: boolean;
      };
      
      setReferralData({
        referral_code: profileData.referral_code,
        referral_count: profileData.referral_count || 0,
        referral_reward_claimed: profileData.referral_reward_claimed || false,
      });
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!referralData?.referral_code) return;
    
    try {
      await navigator.clipboard.writeText(referralData.referral_code);
      setCopied(true);
      toast({
        title: t('codeCopied'),
        description: t('shareWithFriends'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('copyFailed'),
        variant: 'destructive',
      });
    }
  };

  const shareReferralLink = async () => {
    if (!referralData?.referral_code) return;
    
    const shareText = `${t('referralShareText')} ${referralData.referral_code}`;
    const shareUrl = `${window.location.origin}/auth?ref=${referralData.referral_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GainFlow',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: t('linkCopied'),
        description: t('shareWithFriends'),
      });
    }
  };

  if (loading) {
    return (
      <Card className="card-hover animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const progress = Math.min((referralData?.referral_count || 0) / 3 * 100, 100);
  const rewardUnlocked = (referralData?.referral_count || 0) >= 3;

  return (
    <Card className="card-hover border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {t('referralProgram')}
              {rewardUnlocked && (
                <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
                  <Crown className="h-3 w-3 mr-1" />
                  {t('rewardUnlocked')}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {t('referralDescription')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('yourReferralCode')}</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-wider text-center">
              {referralData?.referral_code || '---'}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferralCode}
              className="h-12 w-12"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={shareReferralLink}
              className="h-12 w-12"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{t('friendsInvited')}</span>
            </div>
            <span className="font-bold">
              {referralData?.referral_count || 0} / 3
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {rewardUnlocked 
              ? t('congratsProUnlocked')
              : t('invite3Friends')
            }
          </p>
        </div>

        {/* Reward Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            {t('referralReward')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t('referralBenefit1')}</li>
            <li>• {t('referralBenefit2')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
