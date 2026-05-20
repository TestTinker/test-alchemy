import { expect, Locator, Page } from '@playwright/test';

type Target = string | Locator;

export class BasePage {
  constructor(protected readonly page: Page) {}

  async gotoPath(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async click(target: Target): Promise<void> {
    await this.getLocator(target).click();
  }

  async clear(target: Target): Promise<void> {
    await this.getLocator(target).clear();
  }

  async input(target: Target, value: string): Promise<void> {
    await this.getLocator(target).fill(value);
  }

  async uploadFile(target: Target, filePath: string | string[]): Promise<void> {
    await this.getLocator(target).setInputFiles(filePath);
  }

  protected getLocator(target: Target): Locator {
    return typeof target === 'string' ? this.page.locator(target) : target;
  }
  
  async expectUrlContains(value: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(value));
  }
}
