import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sellerpintar.app',
  appName: 'SellerPintar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;