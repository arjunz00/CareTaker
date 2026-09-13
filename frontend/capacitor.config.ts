import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aegisnet.health',
  appName: 'AegisNet Mobile',
  webDir: '../app/static',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030712',
      showSpinner: true,
      spinnerColor: '#14b8a6'
    },
    StatusBar: {
      backgroundColor: '#030712',
      style: 'DARK'
    }
  }
};

export default config;
