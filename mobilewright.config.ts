import { defineConfig } from 'mobilewright';

process.env.MOBILE_DEBUG_SCREENSHOTS ??= '1';

export default defineConfig({
  platform: 'android',
  testDir: './tests',
  reporter: 'html',
  timeout: 300_000, // 5 minutes
  actionTimeout: 60_000, // 60 seconds
});
