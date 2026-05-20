import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.gotoPath('/dashboard');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  }
}
