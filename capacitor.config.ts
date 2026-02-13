import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rcmndo.app',
  appName: 'rcmndo',
  webDir: 'public',  // Placeholder, we'll use server URL
  server: {
    // Point to the live server - the app will load from here
    url: 'https://rcmndo.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'rcmndo',
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#FF385C',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
