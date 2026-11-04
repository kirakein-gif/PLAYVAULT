import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playvault.familyblocks',
  appName: 'Block Master',
  webDir: 'dist',
  android: {
    // Everything is bundled in the APK; nothing is loaded over the network.
    allowMixedContent: false,
    backgroundColor: '#1a2823',
  },
};

export default config;
