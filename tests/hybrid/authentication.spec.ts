import { test, expect } from '../../fixtures/test.fixture';

test('api login model can support ui flow', async ({ authEndpoint, page }) => {
  const response = await authEndpoint.login({
    username: 'standard.user',
    password: 'secret_sauce',
  });

  await page.goto('/login');
  expect(response.userId).toBe('standard.user');
});
