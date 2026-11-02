import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playvault.familychess',
  appName: '우리집 체스 PREMIUM',
  webDir: 'dist',
  android: {
    // Everything is bundled in the APK; nothing is loaded over the network.
    allowMixedContent: false,
    backgroundColor: '#101820',
  },
};

export default config;
