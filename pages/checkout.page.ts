import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async addSomeProductsToCart(): Promise<void> {
    await this.page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await this.page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(this.page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
  }

  async checkoutFromCart(): Promise<void> {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
    await expect(this.page).toHaveURL(/cart/);
    await expect(this.page.getByText('Your Cart')).toBeVisible();
    await this.page.locator('[data-test="checkout"]').click();
    await expect(this.page).toHaveURL(/checkout-step-one/);
  }

  async fillInformation(firstName = 'Test', lastName = 'User', postalCode = '10110'): Promise<void> {
    await this.page.locator('[data-test="firstName"]').fill(firstName);
    await this.page.locator('[data-test="lastName"]').fill(lastName);
    await this.page.locator('[data-test="postalCode"]').fill(postalCode);
    await this.page.locator('[data-test="continue"]').click();
    await expect(this.page).toHaveURL(/checkout-step-two/);
  }

  async expectProducts(productNames: string[]): Promise<void> {
    for (const productName of productNames) {
      await expect(this.page.getByText(productName)).toBeVisible();
    }
  }

  async expectTotal(total: string): Promise<void> {
    await expect(this.page.getByText(`Total: ${total}`)).toBeVisible();
  }

  async finishOrder(): Promise<void> {
    await this.page.locator('[data-test="finish"]').click();
    await expect(this.page).toHaveURL(/checkout-complete/);
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(this.page.getByText('Your order has been dispatched')).toBeVisible();
  }
}
