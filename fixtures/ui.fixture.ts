import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { TodoPage } from '../pages/todo.page';

type UiFixtures = {
  dashboardPage: DashboardPage;
  loginPage: LoginPage;
  todoPage: TodoPage;
};

export const uiTest = base.extend<UiFixtures>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
});
