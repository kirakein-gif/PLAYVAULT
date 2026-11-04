import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playvault.familyhangman',
  appName: 'Hangman Master',
  webDir: 'dist',
  android: {
    // Everything is bundled in the APK; nothing is loaded over the network.
    allowMixedContent: false,
    backgroundColor: '#101820',
  },
};

export default config;
