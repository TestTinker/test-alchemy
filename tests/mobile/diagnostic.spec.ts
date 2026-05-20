import { test } from '@mobilewright/test';
import type { Screen } from '@mobilewright/core';
import type { TestInfo } from '@playwright/test';
import { getResponsiveSwipeCoords } from '../../utils/mobile.helper';
import * as fs from 'fs';
import * as path from 'path';

const CONTACTS_APP_ID = 'com.android.contacts';

async function attachStepScreenshot(screen: Screen, testInfo: TestInfo, name: string): Promise<void> {
  await testInfo.attach(name, {
    body: await screen.screenshot(),
    contentType: 'image/png',
  });
}

async function firstVisible(locators: any[], timeout = 2_000) {
  for (const locator of locators) {
    if (await locator.isVisible({ timeout }).catch(() => false)) {
      return locator;
    }
  }
  throw new Error('None of the expected mobile locators were visible.');
}

test('Diagnostic: Capture window dump at add contact dialog', async ({ device, screen }, testInfo) => {
  test.setTimeout(120_000);

  // Open Contacts app
  await screen.pressButton('HOME');
  let contactsApp = await firstVisible([
    screen.getByLabel('Contacts'),
    screen.getByText('Contacts'),
  ], 5_000).catch(() => null);

  if (!contactsApp) {
    const swipeCoords = getResponsiveSwipeCoords();
    await screen.swipe('up', {
      startY: swipeCoords.startY,
      distance: swipeCoords.distance,
      duration: 700,
    });
    contactsApp = await firstVisible([
      screen.getByText('Contacts'),
      screen.getByLabel('Contacts'),
    ], 10_000);
  }

  await contactsApp.tap();
  await attachStepScreenshot(screen, testInfo, '01-contacts-app');

  // Try to open add contact dialog
  let addButton = screen.getByRole('button').first();
  try {
    await addButton.tap();
  } catch (e) {
    console.log('Failed to tap first button, trying others');
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
  await attachStepScreenshot(screen, testInfo, '02-after-button-tap');

  // Dump window hierarchy
  const dumpOutput = await device.executeShellCommand('uiautomator dump /sdcard/window_dump.xml').catch(() => 'dump failed');
  const dumpContent = await device.executeShellCommand('cat /sdcard/window_dump.xml').catch(() => 'cat failed');
  
  // Save to file for inspection
  const outputDir = path.join(process.cwd(), 'test-results', 'diagnostics');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outputDir, 'window_dump_add_contact.xml'), dumpContent);
  
  console.log('Window dump saved to test-results/diagnostics/window_dump_add_contact.xml');
});
