import { test } from '../../fixtures/test.fixture';
import webUsers from '../../test-data/static/web-users.json';

test('login redirects to inventory', async ({ loginPage }) => {
  await loginPage.goto();

  await loginPage.login(webUsers.sauceDemo.standardUser.username, webUsers.sauceDemo.standardUser.password);

  await loginPage.expectInventoryPage();
});
