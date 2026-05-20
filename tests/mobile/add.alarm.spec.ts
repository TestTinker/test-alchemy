import { test, expect } from '@mobilewright/test';
import type { Locator, Screen } from '@mobilewright/core';
import type { TestInfo } from '@playwright/test';

const CLOCK_APP_ID = 'com.google.android.deskclock';

async function attachStepScreenshot(screen: Screen, testInfo: TestInfo, name: string): Promise<void> {
  if (process.env.MOBILE_DEBUG_SCREENSHOTS !== '1') {
    return;
  }

  await testInfo.attach(name, {
    body: await screen.screenshot(),
    contentType: 'image/png',
  });
}

async function firstVisible(locators: Locator[], timeout = 2_000): Promise<Locator> {
  const endTime = Date.now() + timeout;
  const checkInterval = 500; // Check every 500ms
  
  while (Date.now() < endTime) {
    for (const locator of locators) {
      if (await locator.isVisible({ timeout: 100 }).catch(() => false)) {
        return locator;
      }
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }

  throw new Error('None of the expected mobile locators were visible.');
}

test('QARDEX-2: add alarm 6:00 AM', async ({ device, screen }, testInfo) => {
  test.setTimeout(180_000);

  await device.terminateApp(CLOCK_APP_ID).catch(() => { });
  await device.launchApp(CLOCK_APP_ID);

  const alarmTabId = `${CLOCK_APP_ID}:id/tab_menu_alarm`;
  const alarmTitleId = `${CLOCK_APP_ID}:id/action_bar_title`;
  const addAlarmFabId = `${CLOCK_APP_ID}:id/fab`;
  const pickerTitleId = `${CLOCK_APP_ID}:id/header_title`;
  const amButtonId = `${CLOCK_APP_ID}:id/material_clock_period_am_button`;
  const hourId = `${CLOCK_APP_ID}:id/material_hour_tv`;
  const minuteId = `${CLOCK_APP_ID}:id/material_minute_tv`;
  const okButtonId = `${CLOCK_APP_ID}:id/material_timepicker_ok_button`;
  const digitalClockId = `${CLOCK_APP_ID}:id/digital_clock`;
  const alarmSwitchId = `${CLOCK_APP_ID}:id/onoff`;

  await test.step('Open Clock app', async () => {
    await expect(
      await firstVisible([
        screen.getByTestId(alarmTitleId),
        screen.getByText('Alarm'),
      ], 10_000)
    ).toBeVisible();
    await attachStepScreenshot(screen, testInfo, '01-clock-opened');
  });

  await test.step('Open Alarm tab', async () => {
    const alarmTab = await firstVisible([
      screen.getByTestId(alarmTabId),
      screen.getByRole('tab', { name: /Alarm/i }),
      screen.getByLabel('Alarm'),
      screen.getByText('Alarm'),
    ], 10_000);

    if (!(await alarmTab.isSelected({ timeout: 1_000 }).catch(() => false))) {
      await alarmTab.tap();
    }

    await expect(screen.getByTestId(alarmTitleId)).toHaveText('Alarms');
    await expect(screen.getByTestId(addAlarmFabId)).toBeVisible({ timeout: 10_000 });
    await attachStepScreenshot(screen, testInfo, '02-alarm-tab');
  });

  await test.step('Open add alarm picker', async () => {
    await screen.getByTestId(addAlarmFabId).tap();
    await expect(screen.getByTestId(pickerTitleId)).toHaveText('Select time');
    await attachStepScreenshot(screen, testInfo, '03-time-picker');
  });

  await test.step('Set 6:00 AM and save', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await screen.getByTestId(amButtonId).tap();
    await screen.getByTestId(hourId).tap();
    await screen.getByLabel("6 o'clock").tap();
    await screen.getByTestId(minuteId).tap();
    await firstVisible([
      screen.getByLabel('0 minutes'),
      screen.getByLabel('00 minutes'),
    ], 5_000).then((locator) => locator.tap());

    // Give emulator time to settle and prevent WebSocket connection issues
    await new Promise(resolve => setTimeout(resolve, 2_000));

    await screen.getByTestId(okButtonId).tap();

    // Wait until the picker is gone before checking the alarm list
    await expect(screen.getByTestId(pickerTitleId)).toBeHidden({ timeout: 15_000 });

    // Give emulator time to settle and prevent WebSocket connection issues
    await new Promise(resolve => setTimeout(resolve, 2_000));

    // Assert on multiple possible alarm text patterns - prioritize stable testIds
    await firstVisible([
      screen.getByLabel('6:00 AM alarm').nth(0),
      screen.getByText(/6:00.?AM/i).nth(0),
    ], 15_000);

    await attachStepScreenshot(screen, testInfo, '04-alarm-added');
  });
});
