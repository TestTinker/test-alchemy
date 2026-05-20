import { LoginPage } from '../pages/login.page';

export class AuthFlow {
  constructor(private readonly loginPage: LoginPage) {}

  async login(username: string, password: string): Promise<void> {
    await this.loginPage.goto();
    await this.loginPage.login(username, password);
  }
}
