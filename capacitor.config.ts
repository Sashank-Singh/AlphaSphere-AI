import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alphasphere.ai',
  appName: 'AlphaSphere AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
