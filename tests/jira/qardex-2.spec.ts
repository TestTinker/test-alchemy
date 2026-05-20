import { test } from '../../fixtures/test.fixture';
import { Qardex2Page } from '../../pages/qardex-2.page';
import webUsers from '../../test-data/static/web-users.json';

test('QARDEX-2: Test Add Alarm', async ({ page, loginPage }) => {
  const generatedPage = new Qardex2Page(page);

  await test.step('Press Home button', async () => {
    await generatedPage.pressHomeButtonStep1();
  });

  await test.step('All Apps should be displayed', async () => {
    await generatedPage.allAppsShouldBeDisplayedStep2();
  });

  await test.step('Search "Clock" app', async () => {
    await generatedPage.searchClockAppStep3();
  });

  await test.step('Clock app should be displayed', async () => {
    await generatedPage.clockAppShouldBeDisplayedStep4();
  });

  await test.step('Move to tab "Alarm"', async () => {
    await generatedPage.moveToTabAlarmStep5();
  });

  await test.step('Add alarm 6.00 am', async () => {
    await generatedPage.addAlarm600AmStep6();
  });
});
