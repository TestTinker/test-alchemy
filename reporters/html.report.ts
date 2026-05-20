import type { ReporterDescription } from '@playwright/test';

export const htmlReporter: ReporterDescription = [
  'html',
  {
    open: 'never',
    outputFolder: 'playwright-report',
    title: 'Playwright Test Report',
  },
];

export const htmlReport = {
  reporter: htmlReporter,
  outputFolder: 'playwright-report',
  openCommand: 'playwright show-report playwright-report',
};
