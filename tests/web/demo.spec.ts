import { test } from '../../fixtures/test.fixture';
import todos from '../../test-data/static/todos.json';

test('add todo', async ({ todoPage }) => {
  const todoName = todos.todoMvc.items.buyMilk;

  await todoPage.goto();

  await todoPage.addTodo(todoName);

  await todoPage.expectTodoAdded(todoName);
});
