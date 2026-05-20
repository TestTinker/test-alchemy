import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { assertion } from '../utils/assertion.helper';
import { byRole, byText } from '../utils/locator.helper';

export class TodoPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.gotoPath('https://demo.playwright.dev/todomvc');
  }

  async addTodo(todoName: string): Promise<void> {
    const newTodoInput = byRole(this.page, 'textbox', { name: 'What needs to be done?' });

    await this.input(newTodoInput, todoName);
    await newTodoInput.press('Enter');
  }

  async expectTodoAdded(todoName: string): Promise<void> {
    const todoItem = byRole(this.page, 'listitem').filter({ hasText: todoName });

    await assertion.hasCount(todoItem, 1);
    await assertion.visible(byText(this.page, '1 item left'));
  }
}
