// this is a skeleton test for mobilewright (see https://github.com/mobile-next/mobilewright/blob/main/README.md)
// for documentation see: https://mobilewright.dev/docs/
// for agent skill see: https://github.com/mobile-next/mobilewright-skill
import { test, expect } from '@mobilewright/test';
import { getResponsiveSwipeCoords } from '../../utils/mobile.helper';

test('opens Play Store from the Android app drawer', async ({ screen }) => {
  await screen.pressButton('HOME');
  await expect(screen.getByText('Play Store')).toBeVisible();

  const swipeCoords = getResponsiveSwipeCoords();
  await screen.swipe('up', { startY: swipeCoords.startY, distance: swipeCoords.distance, duration: 500 });
  await expect(screen.getByText('All apps')).toBeVisible();

  await screen.getByText('Play Store').tap();
  await expect(screen.getByText(/Search apps|Sign in|Google Play/)).toBeVisible();
});
