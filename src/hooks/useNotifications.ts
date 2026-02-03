import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';

interface CustomNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const supported = 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (options: CustomNotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    try {
      // Check if service worker is available for better notification handling
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/pwa-icon-192-v2.png',
          badge: '/pwa-icon-192-v2.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
        });
      } else {
        // Fallback to regular Notification API
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/pwa-icon-192-v2.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
        });
      }
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }, [isSupported, permission]);

  const showBudgetAlert = useCallback((category: string, percentage: number, currency: string, overspent?: number) => {
    const isOver = percentage >= 100;
    
    const title = isOver 
      ? `⚠️ ${t('budgetExceeded')}`
      : `📊 ${t('budgetWarning')}`;
    
    const body = isOver
      ? t('categoryBudgetExceeded').replace('{category}', category).replace('{amount}', formatCurrency(overspent || 0, currency))
      : t('categoryBudgetWarning').replace('{category}', category).replace('{percentage}', percentage.toFixed(0));

    return showNotification({
      title,
      body,
      tag: `budget-${category}`,
      requireInteraction: isOver,
    });
  }, [showNotification, t]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showBudgetAlert,
    canNotify: isSupported && permission === 'granted',
  };
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(amount);
}
