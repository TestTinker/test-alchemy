import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class Qardex2Page extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async pressHomeButtonStep1(): Promise<void> {
    throw new Error('TODO: Implement Jira step 1: Press Home button');
  }

  async allAppsShouldBeDisplayedStep2(): Promise<void> {
    throw new Error('TODO: Implement Jira step 2: All Apps should be displayed');
  }

  async searchClockAppStep3(): Promise<void> {
    throw new Error('TODO: Implement Jira step 3: Search "Clock" app');
  }

  async clockAppShouldBeDisplayedStep4(): Promise<void> {
    throw new Error('TODO: Implement Jira step 4: Clock app should be displayed');
  }

  async moveToTabAlarmStep5(): Promise<void> {
    throw new Error('TODO: Implement Jira step 5: Move to tab "Alarm"');
  }

  async addAlarm600AmStep6(): Promise<void> {
    throw new Error('TODO: Implement Jira step 6: Add alarm 6.00 am');
  }
}
