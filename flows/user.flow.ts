import { DashboardPage } from '../pages/dashboard.page';

export class UserFlow {
  constructor(private readonly dashboardPage: DashboardPage) {}

  async openDashboard(): Promise<void> {
    await this.dashboardPage.goto();
    await this.dashboardPage.expectLoaded();
  }
}
