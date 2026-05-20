import { expect, type APIResponse, type Locator, type Page } from '@playwright/test';

export const DEFAULT_ASSERTION_TIMEOUT = 10_000;

type TextValue = string | RegExp | Array<string | RegExp>;
type ClassValue = string | RegExp | Array<string | RegExp>;
type ScreenshotName = string | string[];
type ExpectedMatchObjectValue = Record<string, unknown> | Array<unknown>;

export class AssertionHelper {
  /** Builds the Playwright timeout option with a default value of 10 seconds. */
  private withTimeout(timeout?: number): { timeout: number } {
    return { timeout: timeout ?? DEFAULT_ASSERTION_TIMEOUT };
  }

  /** Waits until the locator resolves to an attached element. */
  async waitForAttached(locator: Locator, timeout?: number): Promise<void> {
    await this.attached(locator, timeout);
  }

  /** Asserts that the locator resolves to an attached element. */
  async attached(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeAttached(this.withTimeout(timeout));
  }

  /** Waits until the locator resolves to a detached element. */
  async waitForDetached(locator: Locator, timeout?: number): Promise<void> {
    await this.detached(locator, timeout);
  }

  /** Asserts that the locator does not resolve to an attached element. */
  async detached(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).not.toBeAttached(this.withTimeout(timeout));
  }

  /** Asserts that the checkbox or radio locator is checked. */
  async checked(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeChecked(this.withTimeout(timeout));
  }

  /** Asserts that the checkbox or radio locator is not checked. */
  async unchecked(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).not.toBeChecked(this.withTimeout(timeout));
  }

  /** Asserts that the locator is disabled. */
  async disabled(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeDisabled(this.withTimeout(timeout));
  }

  /** Waits until the locator is editable. */
  async waitForEditable(locator: Locator, timeout?: number): Promise<void> {
    await this.editable(locator, timeout);
  }

  /** Asserts that the locator is editable. */
  async editable(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeEditable(this.withTimeout(timeout));
  }

  /** Asserts that the locator is not editable. */
  async readonly(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).not.toBeEditable(this.withTimeout(timeout));
  }

  /** Asserts that the container locator is empty. */
  async empty(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeEmpty(this.withTimeout(timeout));
  }

  /** Waits until the locator is enabled. */
  async waitForEnabled(locator: Locator, timeout?: number): Promise<void> {
    await this.enabled(locator, timeout);
  }

  /** Waits until the locator is enabled. */
  async waitForEnable(locator: Locator, timeout?: number): Promise<void> {
    await this.enabled(locator, timeout);
  }

  /** Asserts that the locator is enabled. */
  async enabled(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeEnabled(this.withTimeout(timeout));
  }

  /** Asserts that the locator is focused. */
  async focused(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeFocused(this.withTimeout(timeout));
  }

  /** Waits until the locator is hidden. */
  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    await this.hidden(locator, timeout);
  }

  /** Asserts that the locator is hidden. */
  async hidden(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeHidden(this.withTimeout(timeout));
  }

  /** Asserts that the locator intersects with the viewport. */
  async inViewport(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeInViewport(this.withTimeout(timeout));
  }

  /** Waits until the locator is visible. */
  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await this.visible(locator, timeout);
  }

  /** Asserts that the locator is visible. */
  async visible(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeVisible(this.withTimeout(timeout));
  }

  /** Waits until the locator is displayed. */
  async waitForDisplay(locator: Locator, timeout?: number): Promise<void> {
    await this.display(locator, timeout);
  }

  /** Asserts that the locator is displayed; alias for visible. */
  async display(locator: Locator, timeout?: number): Promise<void> {
    await this.visible(locator, timeout);
  }

  /** Waits until the locator passes Playwright click actionability checks without clicking it. */
  async waitForClickable(locator: Locator, timeout?: number): Promise<void> {
    await this.clickable(locator, timeout);
  }

  /** Asserts that the locator is clickable by running a trial click. */
  async clickable(locator: Locator, timeout?: number): Promise<void> {
    await locator.click({ trial: true, timeout: timeout ?? DEFAULT_ASSERTION_TIMEOUT });
  }

  /** Asserts that the locator contains the expected text. */
  async containsText(locator: Locator, text: TextValue, timeout?: number): Promise<void> {
    await expect(locator).toContainText(text, this.withTimeout(timeout));
  }

  /** Asserts that the locator contains the expected CSS classes. */
  async containsClass(locator: Locator, className: string | string[], timeout?: number): Promise<void> {
    await expect(locator).toContainClass(className, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected accessible description. */
  async hasAccessibleDescription(locator: Locator, description: string | RegExp, timeout?: number): Promise<void> {
    await expect(locator).toHaveAccessibleDescription(description, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected accessible name. */
  async hasAccessibleName(locator: Locator, name: string | RegExp, timeout?: number): Promise<void> {
    await expect(locator).toHaveAccessibleName(name, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected DOM attribute value. */
  async hasAttribute(locator: Locator, name: string, value: string | RegExp, timeout?: number): Promise<void> {
    await expect(locator).toHaveAttribute(name, value, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected class property. */
  async hasClass(locator: Locator, className: ClassValue, timeout?: number): Promise<void> {
    await expect(locator).toHaveClass(className, this.withTimeout(timeout));
  }

  /** Asserts that the locator list has the expected count. */
  async hasCount(locator: Locator, count: number, timeout?: number): Promise<void> {
    await expect(locator).toHaveCount(count, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected CSS property value. */
  async hasCss(locator: Locator, name: string, value: string | RegExp, timeout?: number): Promise<void> {
    await expect(locator).toHaveCSS(name, value, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected ID. */
  async hasId(locator: Locator, id: string | RegExp, timeout?: number): Promise<void> {
    await expect(locator).toHaveId(id, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected JavaScript property value. */
  async hasJsProperty(locator: Locator, name: string, value: unknown, timeout?: number): Promise<void> {
    await expect(locator).toHaveJSProperty(name, value, this.withTimeout(timeout));
  }

  /** Asserts that the locator has the expected ARIA role. */
  async hasRole(locator: Locator, role: string, timeout?: number): Promise<void> {
    await expect(locator).toHaveRole(role as never, this.withTimeout(timeout));
  }

  /** Asserts that the locator screenshot matches the stored snapshot. */
  async hasScreenshot(locator: Locator, name?: ScreenshotName, timeout?: number): Promise<void> {
    if (name === undefined) {
      await expect(locator).toHaveScreenshot(this.withTimeout(timeout));
      return;
    }

    await expect(locator).toHaveScreenshot(name, this.withTimeout(timeout));
  }

  /** Asserts that the locator text exactly matches the expected text. */
  async hasText(locator: Locator, text: TextValue, timeout?: number): Promise<void> {
    await expect(locator).toHaveText(text, this.withTimeout(timeout));
  }

  /** Asserts that the input locator has the expected value. */
  async hasValue(locator: Locator, value: string | RegExp, timeout?: number): Promise<void> {
    await expect(locator).toHaveValue(value, this.withTimeout(timeout));
  }

  /** Asserts that the select locator has the expected selected values. */
  async hasValues(locator: Locator, values: Array<string | RegExp>, timeout?: number): Promise<void> {
    await expect(locator).toHaveValues(values, this.withTimeout(timeout));
  }

  /** Asserts that the locator matches the expected ARIA snapshot. */
  async matchesAriaSnapshot(locator: Locator, expected?: string, timeout?: number): Promise<void> {
    if (expected === undefined) {
      await expect(locator).toMatchAriaSnapshot(this.withTimeout(timeout));
      return;
    }

    await expect(locator).toMatchAriaSnapshot(expected, this.withTimeout(timeout));
  }

  /** Asserts that the page screenshot matches the stored snapshot. */
  async pageHasScreenshot(page: Page, name?: ScreenshotName, timeout?: number): Promise<void> {
    if (name === undefined) {
      await expect(page).toHaveScreenshot(this.withTimeout(timeout));
      return;
    }

    await expect(page).toHaveScreenshot(name, this.withTimeout(timeout));
  }

  /** Asserts that the page has the expected title. */
  async pageHasTitle(page: Page, title: string | RegExp, timeout?: number): Promise<void> {
    await expect(page).toHaveTitle(title, this.withTimeout(timeout));
  }

  /** Asserts that the page has the expected URL. */
  async pageHasUrl(page: Page, url: string | RegExp | ((url: URL) => boolean), timeout?: number): Promise<void> {
    await expect(page).toHaveURL(url, this.withTimeout(timeout));
  }

  /** Asserts that the API response status code is in the 200-299 range. */
  async responseOk(response: APIResponse): Promise<void> {
    await expect(response).toBeOK();
  }

  /** Asserts that the actual value is the same as the expected value. */
  toBe(actual: unknown, expected: unknown): void {
    expect(actual).toBe(expected);
  }

  /** Asserts that the actual number is approximately equal to the expected number. */
  toBeCloseTo(actual: number, expected: number, numDigits?: number): void {
    expect(actual).toBeCloseTo(expected, numDigits);
  }

  /** Asserts that the value is not undefined. */
  toBeDefined(value: unknown): void {
    expect(value).toBeDefined();
  }

  /** Asserts that the value is falsy. */
  toBeFalsy(value: unknown): void {
    expect(value).toBeFalsy();
  }

  /** Asserts that the actual number is greater than the expected number. */
  toBeGreaterThan(actual: number, expected: number): void {
    expect(actual).toBeGreaterThan(expected);
  }

  /** Asserts that the actual number is greater than or equal to the expected number. */
  toBeGreaterThanOrEqual(actual: number, expected: number): void {
    expect(actual).toBeGreaterThanOrEqual(expected);
  }

  /** Asserts that the value is an instance of the expected class. */
  toBeInstanceOf(value: unknown, expectedClass: Function): void {
    expect(value).toBeInstanceOf(expectedClass);
  }

  /** Asserts that the actual number is less than the expected number. */
  toBeLessThan(actual: number, expected: number): void {
    expect(actual).toBeLessThan(expected);
  }

  /** Asserts that the actual number is less than or equal to the expected number. */
  toBeLessThanOrEqual(actual: number, expected: number): void {
    expect(actual).toBeLessThanOrEqual(expected);
  }

  /** Asserts that the value is NaN. */
  toBeNaN(value: unknown): void {
    expect(value).toBeNaN();
  }

  /** Asserts that the value is null. */
  toBeNull(value: unknown): void {
    expect(value).toBeNull();
  }

  /** Asserts that the value is truthy. */
  toBeTruthy(value: unknown): void {
    expect(value).toBeTruthy();
  }

  /** Asserts that the value is undefined. */
  toBeUndefined(value: unknown): void {
    expect(value).toBeUndefined();
  }

  /** Asserts that a string, array, or set contains the expected item. */
  toContain(actual: string | ReadonlyArray<unknown> | Set<unknown>, expected: unknown): void {
    expect(actual).toContain(expected);
  }

  /** Asserts that an array contains an item deeply equal to the expected item. */
  toContainEqual(actual: ReadonlyArray<unknown>, expected: unknown): void {
    expect(actual).toContainEqual(expected);
  }

  /** Asserts that the actual value is deeply equal to the expected value. */
  toEqual(actual: unknown, expected: unknown): void {
    expect(actual).toEqual(expected);
  }

  /** Asserts that an array or string has the expected length. */
  toHaveLength(actual: string | ReadonlyArray<unknown>, length: number): void {
    expect(actual).toHaveLength(length);
  }

  /** Asserts that an object has the expected property path and optional value. */
  toHaveProperty(actual: object, propertyPath: string | string[], expected?: unknown): void {
    if (arguments.length >= 3) {
      expect(actual).toHaveProperty(propertyPath, expected);
      return;
    }

    expect(actual).toHaveProperty(propertyPath);
  }

  /** Asserts that a string matches the expected regular expression. */
  toMatch(actual: string, expected: string | RegExp): void {
    expect(actual).toMatch(expected);
  }

  /** Asserts that an object or array contains the expected properties. */
  toMatchObject(actual: unknown, expected: ExpectedMatchObjectValue): void {
    expect(actual).toMatchObject(expected);
  }

  /** Asserts that the actual value strictly equals the expected value, including property types. */
  toStrictEqual(actual: unknown, expected: unknown): void {
    expect(actual).toStrictEqual(expected);
  }

  /** Asserts that a function throws an error. */
  toThrow(callback: () => unknown, expected?: string | RegExp | Error | Function): void {
    if (arguments.length >= 2) {
      expect(callback).toThrow(expected);
      return;
    }

    expect(callback).toThrow();
  }

  /** Creates an asymmetric matcher for any value of the expected class or primitive type. */
  any(sample: unknown): ReturnType<typeof expect.any> {
    return expect.any(sample);
  }

  /** Creates an asymmetric matcher for any value except null or undefined. */
  anything(): ReturnType<typeof expect.anything> {
    return expect.anything();
  }

  /** Creates an asymmetric matcher for arrays containing the expected elements. */
  arrayContaining(sample: unknown[]): ReturnType<typeof expect.arrayContaining> {
    return expect.arrayContaining(sample);
  }

  /** Creates an asymmetric matcher for arrays where every element matches the sample. */
  arrayOf(sample: unknown): ReturnType<typeof expect.arrayOf> {
    return expect.arrayOf(sample);
  }

  /** Creates an asymmetric matcher for numbers close to the expected value. */
  closeTo(sample: number, precision?: number): ReturnType<typeof expect.closeTo> {
    return expect.closeTo(sample, precision);
  }

  /** Creates an asymmetric matcher for objects containing the expected properties. */
  objectContaining(sample: Record<string, unknown>): ReturnType<typeof expect.objectContaining> {
    return expect.objectContaining(sample);
  }

  /** Creates an asymmetric matcher for strings containing the expected substring. */
  stringContaining(sample: string): ReturnType<typeof expect.stringContaining> {
    return expect.stringContaining(sample);
  }

  /** Creates an asymmetric matcher for strings matching the expected pattern. */
  stringMatching(sample: string | RegExp): ReturnType<typeof expect.stringMatching> {
    return expect.stringMatching(sample);
  }
}

export const assertion = new AssertionHelper();
