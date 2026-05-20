import type { ReporterDescription } from '@playwright/test';
import { allureConfig } from '../integrations/reporting/allure.config';

export const allureReporter: ReporterDescription = [
  'allure-playwright',
  {
    detail: true,
    outputFolder: allureConfig.resultsDir,
    suiteTitle: false,
  },
];

export const allureReport = {
  reporter: allureReporter,
  resultsDir: allureConfig.resultsDir,
  reportDir: allureConfig.reportDir,
  generateCommand: `allure generate ${allureConfig.resultsDir} --clean -o ${allureConfig.reportDir}`,
  openCommand: `allure open ${allureConfig.reportDir}`,
};
