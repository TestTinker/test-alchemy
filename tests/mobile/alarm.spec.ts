import { test, expect } from '@mobilewright/test';
import type { Locator, Screen } from '@mobilewright/core';
import type { TestInfo } from '@playwright/test';
import { getResponsiveSwipeCoords } from '../../utils/mobile.helper';

async function attachStepScreenshot(screen: Screen, testInfo: TestInfo, name: string): Promise<void> {
  await testInfo.attach(name, {
    body: await screen.screenshot(),
    contentType: 'image/png',
  });
}

async function firstVisible(locators: Locator[], timeout = 2_000): Promise<Locator> {
  for (const locator of locators) {
    if (await locator.isVisible({ timeout }).catch(() => false)) {
      return locator;
    }
  }

  throw new Error('None of the expected mobile locators were visible.');
}

async function tapFirstVisible(locators: Locator[], timeout = 2_000): Promise<void> {
  const locator = await firstVisible(locators, timeout);
  await locator.tap();
}

test('QARDEX-2: Test Add Alarm', async ({ device, screen }, testInfo) => {
  test.setTimeout(120_000);

  await device.terminateApp('com.google.android.deskclock').catch(() => { });

  await test.step('Press Home button', async () => {
    await screen.pressButton('HOME');
    await attachStepScreenshot(screen, testInfo, '01-press-home-button');
  });

  await test.step('All Apps should be displayed', async () => {
    // FIX: Use responsive swipe coordinates for small devices
    const swipeCoords = getResponsiveSwipeCoords();
    await screen.swipe('up', { startY: swipeCoords.startY, distance: swipeCoords.distance, duration: 700 });
    await expect(screen.getByText('Camera')).toBeVisible({ timeout: 10_000 });
    await attachStepScreenshot(screen, testInfo, '02-all-apps-displayed');
  });

  await test.step('Search "Clock" app', async () => {
    await firstVisible([
      screen.getByText(/Search web and more/i),
      screen.getByLabel('Search web and more'),
      screen.getByText(/Search apps/i),
      screen.getByLabel('Search apps'),
      screen.getByRole('textfield', { name: /Search web and more|Search apps/i }),
      screen.getByRole('textfield', { name: /Search apps/i }),
    ], 1_500).then((search) => search.fill('Clock'));

    await expect(screen.getByText('Clock')).toBeVisible({ timeout: 10_000 });
    if (await screen.getByText('Got it').isVisible({ timeout: 1_000 }).catch(() => false)) {
      await screen.getByText('Got it').tap();
    }
    await attachStepScreenshot(screen, testInfo, '03-search-clock-app');
  });

  await test.step('Clock app should be displayed', async () => {
    const clockApp = await firstVisible([
      screen.getByText('Clock').nth(1),
      screen.getByLabel('Clock').nth(1),
      screen.getByText('Clock').last(),
      screen.getByLabel('Clock').last(),
    ], 2_000);

    await expect(clockApp).toBeVisible();
    await attachStepScreenshot(screen, testInfo, '04-clock-app-displayed');
    await clockApp.tap();
  });

  await test.step('Move to tab "Alarm"', async () => {
    await tapFirstVisible([
      screen.getByRole('tab', { name: /Alarm/i }),
      screen.getByText('Alarm'),
      screen.getByLabel('Alarm'),
    ], 2_000);

    await expect(screen.getByText(/Alarm/i)).toBeVisible({ timeout: 10_000 });
    // await attachStepScreenshot(screen, testInfo, '05-move-to-alarm-tab');
  });

  await test.step('Add alarm 6.00 am', async () => {

    // Tap "+" button
    await tapFirstVisible([
      screen.getByLabel('Add alarm'),
      screen.getByRole('button', { name: /Add alarm/i }),
    ], 2_000);

    // switch to text mode
    await screen.getByLabel(
      'Switch to text input mode for the time input.'
    ).tap();

    // Hour
    await screen.getByText('Hour').tap();
    await device.driver.typeText('06');

    // Minute
    await screen.getByText('Minute').doubleTap();
    await device.driver.typeText('00');

    // AM
    await screen.getByText('AM').tap();

    // OK
    await screen.getByRole('button', { name: 'OK' }).tap();
    // await tapFirstVisible([
    //   screen.getByText('OK'),
    //   screen.getByRole('button', { name: 'OK' }),
    //   screen.getByLabel('OK'),
    // ], 2000);

    await attachStepScreenshot(screen, testInfo, '06-add-alarm-600-am');
  });
});
