import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';
import { allureReporter, htmlReporter } from './reporters';

export default defineConfig({
  ...baseConfig,
  testMatch: [
    '**/tests/web/login.spec.ts',
    '**/tests/api/create-user.spec.ts',
  ],
  reporter: [
    ['list'],
    htmlReporter,
    allureReporter,
  ],
});
