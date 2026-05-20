import { Page } from '@playwright/test';

export function byTestId(page: Page, testId: string) {
  return page.getByTestId(testId);
}

export function byDataTest(page: Page, testId: string) {
  return page.locator(`[data-test="${testId}"]`);
}

export function byRole(
  page: Page,
  role: Parameters<Page['getByRole']>[0],
  options?: Parameters<Page['getByRole']>[1],
) {
  return page.getByRole(role, options);
}

export function byText(page: Page, text: string | RegExp) {
  return page.getByText(text);
}
