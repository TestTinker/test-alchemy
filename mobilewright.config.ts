import { defineConfig } from 'mobilewright';

// export default defineConfig({
//   platform: 'android',
//   testDir: './tests',
//   reporter: 'html',
//   timeout: 300_000, // 5 minutes
//   actionTimeout: 60_000, // 60 seconds
// });

export default defineConfig({
  platform: 'android',
  deviceName: /^Small Phone( 2)?$/,
  testDir: './tests/mobile',
  reporter: 'html',
  timeout: 300_000,
  actionTimeout: 60_000,
  retries: 1,
  workers: 2,
});
