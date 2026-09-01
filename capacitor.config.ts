import type { CapacitorConfig } from '@capacitor/cli';

// Set CAP_ENV=production (or build with NODE_ENV=production) before `npx cap sync`
// to bundle the local `dist` build instead of pointing at the Lovable preview.
const isProduction =
  process.env.CAP_ENV === 'production' || process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'app.lovable.d752382e2c9d4540a82bd43a8d002cef',
  appName: 'GainFlow',
  webDir: 'dist',
  ...(isProduction
    ? {}
    : {
        server: {
          // Development only - connects to Lovable preview
          url: 'https://d752382e-2c9d-4540-a82b-d43a8d002cef.lovableproject.com?forceHideBadge=true',
          cleartext: true,
        },
      }),

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
