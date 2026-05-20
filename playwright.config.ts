import { defineConfig, devices } from '@playwright/test';
import { testConfig } from './config/test.config';
import { htmlReporter } from './reporters';

export default defineConfig({
  // testDir: './tests',
  // fullyParallel: true,
  // retries: testConfig.retries,
  reporter: [
    ['list'],
    htmlReporter,
  ],
  // use: {
  //   baseURL: testConfig.baseUrl,
  //   trace: 'on-first-retry',
  //   screenshot: 'only-on-failure',
  // },
  // globalSetup: './hooks/global-setup.ts',
  // globalTeardown: './hooks/global-teardown.ts',
  projects: [
    {
      name: 'demo',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
      },
    },
  ],
});
