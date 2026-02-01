import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d752382e2c9d4540a82bd43a8d002cef',
  appName: 'GainFlow',
  webDir: 'dist',
  server: {
    // For development - connects to Lovable preview
    url: 'https://d752382e-2c9d-4540-a82b-d43a8d002cef.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#8B5CF6',
  },
  ios: {
    backgroundColor: '#8B5CF6',
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#8B5CF6',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#8B5CF6',
      style: 'LIGHT',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
