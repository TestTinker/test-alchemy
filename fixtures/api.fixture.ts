import { test as base } from '@playwright/test';
import { BaseApiClient } from '../api/clients/base.client';
import { AuthEndpoint } from '../api/endpoints/auth.endpoint';
import { UserEndpoint } from '../api/endpoints/user.endpoint';
import { testConfig } from '../config/test.config';

type ApiFixtures = {
  apiClient: BaseApiClient;
  authEndpoint: AuthEndpoint;
  userEndpoint: UserEndpoint;
};

export const apiTest = base.extend<ApiFixtures>({
  apiClient: async ({}, use) => {
    const client = new BaseApiClient(testConfig.baseUrl);
    await use(client);
    await client.dispose();
  },
  authEndpoint: async ({ apiClient }, use) => {
    await use(new AuthEndpoint(apiClient));
  },
  userEndpoint: async ({}, use) => {
    const client = new BaseApiClient('https://gorest.co.in', {
      Authorization: 'Bearer 7d384327c8eee7f576ee1fb490e7f22796d59bbafd6065a59bf7c76c774becd1',
    });

    await use(new UserEndpoint(client));
    await client.dispose();
  },
});
