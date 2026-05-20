import { test } from '../../fixtures/test.fixture';
import { CheckoutPage } from '../../pages/checkout.page';
import webUsers from '../../test-data/static/web-users.json';

test('QARDEX-1: Checkout Products from Swag Labs', async ({ page, loginPage }) => {
  const checkoutPage = new CheckoutPage(page);

  await test.step('Login with a valid credential', async () => {
    await loginPage.goto();
    await loginPage.login(webUsers.sauceDemo.standardUser.username, webUsers.sauceDemo.standardUser.password);
    await loginPage.expectInventoryPage();
  });

  await test.step('Add some products to cart', async () => {
    await checkoutPage.addSomeProductsToCart();
  });

  await test.step('Checkout from cart', async () => {
    await checkoutPage.checkoutFromCart();
  });

  await test.step('Fill your information', async () => {
    await checkoutPage.fillInformation();
  });

  await test.step('Verify the products', async () => {
    await checkoutPage.expectProducts(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    await checkoutPage.expectTotal('$43.18');
  });

  await test.step('Finish order', async () => {
    await checkoutPage.finishOrder();
  });

  await test.step('You sould see text "Thank you for your order!"', async () => {
    await checkoutPage.expectOrderComplete();
  });
});
