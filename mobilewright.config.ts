import { defineConfig } from 'mobilewright';

export default defineConfig({
  platform: 'android',
  testDir: './tests',
  reporter: 'html',
  timeout: 300_000, // 5 minutes
  actionTimeout: 60_000, // 60 seconds
});
