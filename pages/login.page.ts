import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { assertion } from '../utils/assertion.helper';
import { byDataTest } from '../utils/locator.helper';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.gotoPath('https://www.saucedemo.com/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.input(byDataTest(this.page, 'username'), username);
    await this.input(byDataTest(this.page, 'password'), password);
    await this.click(byDataTest(this.page, 'login-button'));
  }

  async expectInventoryPage(): Promise<void> {
    await assertion.pageHasUrl(this.page, /inventory/);
  }
}
